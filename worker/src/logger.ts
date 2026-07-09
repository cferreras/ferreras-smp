type LogLevel = "info" | "warn" | "error";

const write = (level: LogLevel, message: string, meta?: unknown) => {
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}`;

  if (meta instanceof Error) {
    console[level](line, meta.message);
    return;
  }

  if (meta) {
    console[level](line, meta);
    return;
  }

  console[level](line);
};

export const logger = {
  info: (message: string, meta?: unknown) => write("info", message, meta),
  warn: (message: string, meta?: unknown) => write("warn", message, meta),
  error: (message: string, meta?: unknown) => write("error", message, meta),
};
