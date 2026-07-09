import { loadConfig, type WorkerConfig } from "./config.js";
import { logger } from "./logger.js";
import { parseListResponse, parseTpsResponse, parseWorldDayResponse } from "./parsers.js";
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

const queryTps = async (send: (command: string) => Promise<string>): Promise<number | null> => {
  for (const command of ["tps", "spark tps"]) {
    try {
      const response = await send(command);
      const tps = parseTpsResponse(response);

      if (tps !== null) {
        return tps;
      }
    } catch {
      // TPS is optional. Some servers do not expose /tps or Spark.
    }
  }

  return null;
};

const queryMinecraftStatus = async (config: WorkerConfig): Promise<MinecraftStatus> => {
  const session = await connectRcon(config);

  try {
    const listResponse = await session.send("list");
    const worldDayResponse = await session.send("time query day");
    const listStatus = parseListResponse(listResponse, config.minecraftMaxPlayers);

    if (!listStatus) {
      logger.warn("No se pudo parsear la respuesta de /list", listResponse);
    }

    const worldDay = parseWorldDayResponse(worldDayResponse);

    if (worldDay === null) {
      logger.warn("No se pudo parsear la respuesta de /time query day", worldDayResponse);
    }

    const tps = await queryTps((command) => session.send(command));

    return {
      online: true,
      host: config.minecraftHostPublic,
      playersOnline: listStatus?.playersOnline ?? 0,
      maxPlayers: listStatus?.maxPlayers ?? config.minecraftMaxPlayers,
      players: listStatus?.players ?? [],
      worldDay,
      tps,
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
  };

  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  await connectRedisWithRetry(redis, () => shouldStop);

  while (!shouldStop) {
    await runOnce(config, redis);
    await sleep(config.minecraftPollIntervalMs);
  }
};

main().catch((error) => {
  logger.error("El worker no pudo arrancar", error);
  process.exitCode = 1;
});
