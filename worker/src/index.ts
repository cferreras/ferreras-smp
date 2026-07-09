import { loadConfig, type WorkerConfig } from "./config.js";
import { logger } from "./logger.js";
import { startLogReader } from "./log-reader.js";
import { parseListResponse, parsePerformanceResponse, parseTpsResponse, parseWorldDayResponse } from "./parsers.js";
import { createRedisClient, saveMinecraftStatus } from "./redis.js";
import { connectRcon } from "./rcon.js";
import type { MinecraftStatus } from "./types.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createOfflineStatus = (config: WorkerConfig): MinecraftStatus => ({
  online: false,
  host: config.minecraftHostPublic,
  playersOnline: 0,
  maxPlayers: config.minecraftMaxPlayers,
  players: [],
  worldDay: null,
  tps: null,
  lastUpdated: new Date().toISOString(),
});

const queryPerformance = async (
  send: (command: string) => Promise<string>,
): Promise<{ tps: number | null; mspt: number | null }> => {
  for (const command of ["mspt", "tickinfo"]) {
    try {
      const response = await send(command);
      const performance = parsePerformanceResponse(response);

      if (performance) {
        return performance;
      }

      if (response.trim()) {
        logger.warn(`No se pudo parsear la respuesta de /${command}`, response);
      }
    } catch {
      // TabTPS commands are optional.
    }
  }

  for (const command of ["spark tps", "tps"]) {
    try {
      const firstResponse = await send(command);
      const response = firstResponse.trim() ? firstResponse : await send(command);
      const tps = parseTpsResponse(response);

      if (tps !== null) {
        return { tps, mspt: null };
      }

      if (response.trim()) {
        logger.warn(`No se pudo parsear la respuesta de /${command}`, response);
      }
    } catch {
      // TPS is optional. Some servers do not expose /tps or Spark.
    }
  }

  return { tps: null, mspt: null };
};

const queryWorldDay = async (send: (command: string) => Promise<string>): Promise<number | null> => {
  for (const command of ["daycount", "time query day"]) {
    try {
      const response = await send(command);
      const worldDay = parseWorldDayResponse(response);

      if (worldDay !== null) {
        return worldDay;
      }

      logger.warn(`No se pudo parsear la respuesta de /${command}`, response);
    } catch (error) {
      logger.warn(`No se pudo ejecutar /${command}`, error);
    }
  }

  return null;
};

const queryMinecraftStatus = async (config: WorkerConfig): Promise<MinecraftStatus> => {
  const session = await connectRcon(config);

  try {
    const listResponse = await session.send("list");
    const listStatus = parseListResponse(listResponse, config.minecraftMaxPlayers);

    if (!listStatus) {
      logger.warn("No se pudo parsear la respuesta de /list", listResponse);
    }

    const worldDay = await queryWorldDay((command) => session.send(command));
    const performance = await queryPerformance((command) => session.send(command));

    return {
      online: true,
      host: config.minecraftHostPublic,
      playersOnline: listStatus?.playersOnline ?? 0,
      maxPlayers: listStatus?.maxPlayers ?? config.minecraftMaxPlayers,
      players: listStatus?.players ?? [],
      worldDay,
      tps: performance.tps,
      mspt: performance.mspt,
      lastUpdated: new Date().toISOString(),
    };
  } finally {
    session.close();
  }
};

const runOnce = async (config: WorkerConfig, redis: ReturnType<typeof createRedisClient>) => {
  try {
    const status = await queryMinecraftStatus(config);
    try {
      await saveMinecraftStatus(redis, status);
    } catch (error) {
      logger.warn("No se pudo guardar mc:status en Redis/DragonFly; se reintentará en el siguiente ciclo", error);
      return;
    }

    logger.info(`Consulta RCON OK: ${status.playersOnline}/${status.maxPlayers} jugadores`);
  } catch (error) {
    logger.warn("Servidor offline/no responde; guardando online=false", error);

    try {
      await saveMinecraftStatus(redis, createOfflineStatus(config));
    } catch (redisError) {
      logger.warn("No se pudo guardar el estado offline en Redis/DragonFly", redisError);
    }
  }
};

const connectRedisWithRetry = async (
  redis: ReturnType<typeof createRedisClient>,
  shouldStop: () => boolean,
) => {
  while (!shouldStop()) {
    try {
      await redis.connect();
      logger.info("Conexión Redis/DragonFly OK");
      return;
    } catch (error) {
      logger.warn("Redis/DragonFly no disponible; reintentando en 5s", error);
      await sleep(5_000);
    }
  }
};

const main = async () => {
  const config = loadConfig();
  const redis = createRedisClient(config);

  logger.info("minecraft-live-worker iniciado");
  let shouldStop = false;

  const stop = async () => {
    shouldStop = true;
    logger.info("Cerrando worker");
    redis.disconnect();
    process.exit(0);
  };

  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  await connectRedisWithRetry(redis, () => shouldStop);
  const stopLogReader = startLogReader(config, redis);

  while (!shouldStop) {
    await runOnce(config, redis);
    await sleep(config.minecraftPollIntervalMs);
  }

  stopLogReader?.();
};

main().catch((error) => {
  logger.error("El worker no pudo arrancar", error);
  process.exitCode = 1;
});
