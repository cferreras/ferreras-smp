import { Redis } from "ioredis";
import type { WorkerConfig } from "./config.js";
import { logger } from "./logger.js";
import type { MinecraftActivityEvent, MinecraftStatus } from "./types.js";

export const MINECRAFT_STATUS_KEY = "mc:status";
export const MINECRAFT_ACTIVITY_RECENT_KEY = "mc:activity:recent";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isNullableFiniteNumber = (value: unknown): value is number | null =>
  value === null || isFiniteNumber(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const hasField = (value: Record<string, unknown>, field: string) =>
  Object.prototype.hasOwnProperty.call(value, field);

export const isPartialMinecraftStatus = (value: unknown): value is Partial<MinecraftStatus> => {
  if (!isRecord(value)) {
    return false;
  }

  if (hasField(value, "online") && typeof value.online !== "boolean") {
    return false;
  }

  if (hasField(value, "host") && !isNonEmptyString(value.host)) {
    return false;
  }

  if (
    (hasField(value, "playersOnline") && (!isFiniteNumber(value.playersOnline) || value.playersOnline < 0)) ||
    (hasField(value, "maxPlayers") && (!isFiniteNumber(value.maxPlayers) || value.maxPlayers < 0))
  ) {
    return false;
  }

  if (
    hasField(value, "players") &&
    (!Array.isArray(value.players) || value.players.some((player) => !isNonEmptyString(player)))
  ) {
    return false;
  }

  if (hasField(value, "worldDay") && (!isNullableFiniteNumber(value.worldDay) || (value.worldDay ?? 0) < 0)) {
    return false;
  }

  if (hasField(value, "tps") && (!isNullableFiniteNumber(value.tps) || (value.tps ?? 0) < 0)) {
    return false;
  }

  if (hasField(value, "mspt") && (!isNullableFiniteNumber(value.mspt) || (value.mspt ?? 0) < 0)) {
    return false;
  }

  if (hasField(value, "version") && value.version !== null && !isNonEmptyString(value.version)) {
    return false;
  }

  if (hasField(value, "lastUpdated") && !isNonEmptyString(value.lastUpdated)) {
    return false;
  }

  return true;
};

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

export const readMinecraftStatus = async (redis: Redis): Promise<Partial<MinecraftStatus> | null> => {
  const value = await redis.get(MINECRAFT_STATUS_KEY);

  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return isPartialMinecraftStatus(parsed) ? parsed : null;
  } catch (error) {
    logger.warn("El estado mc:status de Redis no contiene JSON válido", error);
    return null;
  }
};

export const saveActivityEvent = async (redis: Redis, event: MinecraftActivityEvent) => {
  await redis
    .multi()
    .lpush(MINECRAFT_ACTIVITY_RECENT_KEY, JSON.stringify(event))
    .ltrim(MINECRAFT_ACTIVITY_RECENT_KEY, 0, 49)
    .exec();
};
