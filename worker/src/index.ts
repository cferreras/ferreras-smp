import { loadConfig, type WorkerConfig } from "./config.js";
import { logger } from "./logger.js";
import { startLogReader } from "./log-reader.js";
import { parseListResponse, parseWorldDayResponse } from "./parsers.js";
import { createRedisClient, readMinecraftStatus, saveMinecraftStatus } from "./redis.js";
import { PersistentRconClient } from "./rcon.js";
import type { MinecraftStatus } from "./types.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const queryWorldDay = async (rcon: PersistentRconClient, previousDay: number | null) => {
  for (const command of ["daycount", "time query day"]) {
    try {
      const worldDay = parseWorldDayResponse(await rcon.send(command));

      if (worldDay !== null) {
        return worldDay;
      }
    } catch (error) {
      logger.warn(`No se pudo ejecutar /${command} durante la reconciliación`, error);
    }
  }

  return previousDay;
};

const reconcileMinecraftStatus = async (config: WorkerConfig, redis: ReturnType<typeof createRedisClient>) => {
  const rcon = new PersistentRconClient(config);

  try {
    const previous = await readMinecraftStatus(redis);
    const list = parseListResponse(await rcon.send("list"), config.minecraftMaxPlayers);
    const worldDay = await queryWorldDay(rcon, typeof previous?.worldDay === "number" ? previous.worldDay : null);
    const status: MinecraftStatus = {
      online: true,
      host: config.minecraftHostPublic,
      playersOnline: list?.playersOnline ?? 0,
      maxPlayers: list?.maxPlayers ?? config.minecraftMaxPlayers,
      players: list?.players ?? [],
      worldDay,
      tps: previous?.tps ?? null,
      mspt: previous?.mspt ?? null,
      version: previous?.version ?? null,
      lastUpdated: new Date().toISOString(),
    };

    await saveMinecraftStatus(redis, status);
    logger.info(
      `Reconciliación RCON OK: día ${worldDay ?? "desconocido"}, ${status.playersOnline}/${status.maxPlayers} jugadores`,
    );
  } catch (error) {
    logger.warn("No se pudo reconciliar el estado por RCON; se conserva el último snapshot", error);
  } finally {
    rcon.close();
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
  let shouldStop = false;
  let stopLogReader: (() => void) | undefined;

  logger.info("minecraft-live-worker iniciado en modo eventos de log");

  const stop = () => {
    if (shouldStop) return;
    shouldStop = true;
    logger.info("Cerrando worker");
    stopLogReader?.();
    redis.disconnect();
  };

  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  await connectRedisWithRetry(redis, () => shouldStop);

  if (!shouldStop) {
    await reconcileMinecraftStatus(config, redis);

    if (!shouldStop) {
      stopLogReader = await startLogReader(config, redis);
    }
  }
};

main().catch((error) => {
  logger.error("El worker no pudo arrancar", error);
  process.exitCode = 1;
});
