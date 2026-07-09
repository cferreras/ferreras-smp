import { Rcon } from "rcon-client";
import type { WorkerConfig } from "./config.js";

const withTimeout = async <T>(operation: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
  let timeout: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} ha superado ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    return await Promise.race([operation, timeoutPromise]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
};

export type RconSession = {
  send(command: string): Promise<string>;
  close(): void;
};

export const connectRcon = async (config: WorkerConfig): Promise<RconSession> => {
  const connection = await withTimeout(
    Rcon.connect({
      host: config.rconHost,
      port: config.rconPort,
      password: config.rconPassword,
    }),
    config.rconConnectTimeoutMs,
    "La conexión RCON",
  );

  return {
    send(command) {
      return withTimeout(connection.send(command), config.rconCommandTimeoutMs, `El comando RCON ${command}`);
    },
    close() {
      connection.end();
    },
  };
};
