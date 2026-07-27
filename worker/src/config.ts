export type WorkerConfig = {
  redisUrl: string;
  rconHost: string;
  rconPort: number;
  rconPassword: string;
  minecraftHostPublic: string;
  minecraftMaxPlayers: number;
  rconConnectTimeoutMs: number;
  rconCommandTimeoutMs: number;
  minecraftLogPath: string;
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
  return {
    redisUrl: requiredString("REDIS_URL"),
    rconHost: requiredString("RCON_HOST"),
    rconPort: optionalInteger("RCON_PORT", 25_575),
    rconPassword: requiredString("RCON_PASSWORD"),
    minecraftHostPublic: requiredString("MINECRAFT_HOST_PUBLIC"),
    minecraftMaxPlayers: optionalInteger("MINECRAFT_MAX_PLAYERS", 20),
    rconConnectTimeoutMs: optionalInteger("RCON_CONNECT_TIMEOUT_MS", 5_000),
    rconCommandTimeoutMs: optionalInteger("RCON_COMMAND_TIMEOUT_MS", 5_000),
    minecraftLogPath: requiredString("MINECRAFT_LOG_PATH"),
  };
};
