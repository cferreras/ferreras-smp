import { Redis } from "ioredis";
import type { WorkerConfig } from "./config.js";
import { logger } from "./logger.js";
import type { MinecraftStatus } from "./types.js";

export const MINECRAFT_STATUS_KEY = "mc:status";

export const createRedisClient = (config: WorkerConfig) => {
  const redis = new Redis(config.redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy(times: number) {
      return Math.min(times * 500, 5_000);
    },
  });

  redis.on("error", (error: Error) => {
    logger.warn("Error de Redis/DragonFly; se reintentará automáticamente", error);
  });

  return redis;
};

export const saveMinecraftStatus = async (redis: Redis, status: MinecraftStatus) => {
  await redis.set(MINECRAFT_STATUS_KEY, JSON.stringify(status));
};
