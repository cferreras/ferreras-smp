export type WorkerConfig = {
  redisUrl: string;
  rconHost: string;
  rconPort: number;
  rconPassword: string;
  minecraftHostPublic: string;
  minecraftMaxPlayers: number;
  minecraftPollIntervalMs: number;
  rconConnectTimeoutMs: number;
  rconCommandTimeoutMs: number;
  minecraftLogPath?: string;
  minecraftLogPollIntervalMs: number;
};

const requiredString = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria ${name}`);
  }

  return value;
};

const optionalInteger = (name: string, fallback: number): number => {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const value = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} debe ser un número entero positivo`);
  }

  return value;
};

export const loadConfig = (): WorkerConfig => {
  const pollIntervalMs = Math.max(optionalInteger("MINECRAFT_POLL_INTERVAL_MS", 10_000), 5_000);

  return {
    redisUrl: requiredString("REDIS_URL"),
    rconHost: requiredString("RCON_HOST"),
    rconPort: optionalInteger("RCON_PORT", 25_575),
    rconPassword: requiredString("RCON_PASSWORD"),
    minecraftHostPublic: requiredString("MINECRAFT_HOST_PUBLIC"),
    minecraftMaxPlayers: optionalInteger("MINECRAFT_MAX_PLAYERS", 20),
    minecraftPollIntervalMs: pollIntervalMs,
    rconConnectTimeoutMs: optionalInteger("RCON_CONNECT_TIMEOUT_MS", 5_000),
    rconCommandTimeoutMs: optionalInteger("RCON_COMMAND_TIMEOUT_MS", 5_000),
    minecraftLogPath: process.env.MINECRAFT_LOG_PATH?.trim() || undefined,
    minecraftLogPollIntervalMs: optionalInteger("MINECRAFT_LOG_POLL_INTERVAL_MS", 2_000),
  };
};
