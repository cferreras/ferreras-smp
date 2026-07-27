import { loadConfig } from "./config.js";
import { logger } from "./logger.js";
import { startLogReader } from "./log-reader.js";
import { createRedisClient } from "./redis.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    stopLogReader = await startLogReader(config, redis);
  }
};

main().catch((error) => {
  logger.error("El worker no pudo arrancar", error);
  process.exitCode = 1;
});
