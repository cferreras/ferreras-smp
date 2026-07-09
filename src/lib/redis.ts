import Redis from "ioredis";

let redisClient: Redis | undefined;

export class MissingRedisUrlError extends Error {
  constructor() {
    super("Missing REDIS_URL environment variable");
    this.name = "MissingRedisUrlError";
  }
}

const getRedisUrl = () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new MissingRedisUrlError();
  }

  return redisUrl;
};

export const getRedis = () => {
  if (!redisClient) {
    redisClient = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      lazyConnect: true,
    });
  }

  return redisClient;
};
