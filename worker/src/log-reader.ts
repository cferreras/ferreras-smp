import { createReadStream, statSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createInterface } from "node:readline";
import type { Redis } from "ioredis";
import type { WorkerConfig } from "./config.js";
import { logger } from "./logger.js";
import { parseActivityLogLine } from "./parsers.js";
import { saveActivityEvent } from "./redis.js";

const readNewLines = async (filePath: string, from: number, to: number) => {
  if (to <= from) {
    return [];
  }

  const lines: string[] = [];
  const stream = createReadStream(filePath, {
    encoding: "utf8",
    start: from,
    end: to - 1,
  });
  const reader = createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  for await (const line of reader) {
    lines.push(line);
  }

  return lines;
};

export const startLogReader = (config: WorkerConfig, redis: Redis) => {
  if (!config.minecraftLogPath) {
    logger.info("Lectura de logs desactivada: MINECRAFT_LOG_PATH no configurada");
    return;
  }

  const logPath = config.minecraftLogPath;
  let position = 0;
  let reading = false;

  try {
    position = statSync(logPath).size;
    logger.info(`Leyendo actividad desde ${logPath}`);
  } catch (error) {
    logger.warn("No se pudo abrir el log de Minecraft; se reintentará", error);
  }

  const interval = setInterval(async () => {
    if (reading) {
      return;
    }

    reading = true;

    try {
      const file = await stat(logPath);

      if (file.size < position) {
        position = 0;
      }

      const lines = await readNewLines(logPath, position, file.size);
      position = file.size;

      for (const line of lines) {
        const event = parseActivityLogLine(line);

        if (!event) {
          continue;
        }

        await saveActivityEvent(redis, event);
        logger.info(`Actividad detectada: ${event.message}`);
      }
    } catch (error) {
      logger.warn("No se pudo leer latest.log", error);
    } finally {
      reading = false;
    }
  }, config.minecraftLogPollIntervalMs);

  return () => clearInterval(interval);
};
