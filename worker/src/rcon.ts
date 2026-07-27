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
    if (timeout) clearTimeout(timeout);
  }
};

/**
 * Cliente reutilizable para comandos administrativos (say, kick, whitelist,
 * save-all, etc.). Se conecta bajo demanda y conserva la sesión.
 */
export class PersistentRconClient {
  private connection: Rcon | null = null;
  private connecting: Promise<Rcon> | null = null;
  private commandQueue: Promise<unknown> = Promise.resolve();

  constructor(private readonly config: WorkerConfig) {}

  private connect(): Promise<Rcon> {
    if (this.connection) return Promise.resolve(this.connection);

    if (!this.connecting) {
      this.connecting = withTimeout(
        Rcon.connect({
          host: this.config.rconHost,
          port: this.config.rconPort,
          password: this.config.rconPassword,
        }),
        this.config.rconConnectTimeoutMs,
        "La conexión RCON",
      )
        .then((connection) => {
          this.connection = connection;
          return connection;
        })
        .finally(() => {
          this.connecting = null;
        });
    }

    return this.connecting;
  }

  send(command: string): Promise<string> {
    const operation = this.commandQueue.then(async () => {
      const connection = await this.connect();

      try {
        return await withTimeout(
          connection.send(command),
          this.config.rconCommandTimeoutMs,
          `El comando RCON ${command}`,
        );
      } catch (error) {
        connection.end();
        this.connection = null;
        throw error;
      }
    });

    this.commandQueue = operation.catch(() => undefined);
    return operation;
  }

  close() {
    this.connection?.end();
    this.connection = null;
  }
}
