import { createReadStream, watch, type FSWatcher } from "node:fs";
import { stat } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { StringDecoder } from "node:string_decoder";
import type { Redis } from "ioredis";
import type { WorkerConfig } from "./config.js";
import { logger } from "./logger.js";
import { parseMinecraftLogLine } from "./parsers.js";
import { saveActivityEvent, saveMinecraftStatus } from "./redis.js";
import { MinecraftStatusTracker } from "./status-tracker.js";

const readBytes = async (
  filePath: string,
  from: number,
  to: number,
  decoder: StringDecoder,
): Promise<string> => {
  if (to <= from) {
    return "";
  }

  let content = "";
  const stream = createReadStream(filePath, { start: from, end: to - 1 });

  for await (const chunk of stream) {
    content += decoder.write(chunk as Buffer);
  }

  return content;
};

export const startLogReader = async (config: WorkerConfig, redis: Redis) => {
  const logPath = config.minecraftLogPath;
  const logDirectory = dirname(logPath);
  const logFilename = basename(logPath);
  const tracker = new MinecraftStatusTracker(config);
  let position = 0;
  let fileIdentity: string | null = null;
  let partialLine = "";
  let decoder = new StringDecoder("utf8");
  let initialRead = true;
  let stopped = false;
  let reading: Promise<void> | null = null;
  let readAgain = false;

  const processAvailableLines = async () => {
    let file;

    try {
      file = await stat(logPath);
    } catch (error) {
      if (initialRead) {
        await saveMinecraftStatus(redis, tracker.snapshot());
        logger.warn(`Esperando a que aparezca ${logPath}`, error);
        initialRead = false;
      }
      return;
    }

    const nextIdentity = `${file.dev}:${file.ino}`;
    const rotated = fileIdentity !== null && fileIdentity !== nextIdentity;
    const truncated = file.size < position;

    if (rotated || truncated) {
      position = 0;
      partialLine = "";
      decoder = new StringDecoder("utf8");
      tracker.reset();
      logger.info("Se ha detectado una rotación de latest.log; reconstruyendo el estado");
    }

    fileIdentity = nextIdentity;
    const to = file.size;
    const appended = await readBytes(logPath, position, to, decoder);
    position = to;
    const lines = (partialLine + appended).split(/\r?\n/);
    partialLine = lines.pop() ?? "";
    let statusChanged = rotated || truncated;

    for (const line of lines) {
      const parsed = parseMinecraftLogLine(line);

      if (parsed.state) {
        statusChanged = tracker.apply(parsed.state) || statusChanged;
      }

      if (!initialRead && parsed.activity) {
        await saveActivityEvent(redis, parsed.activity);
        logger.info(`Actividad detectada: ${parsed.activity.message}`);
      }
    }

    if (initialRead || statusChanged) {
      await saveMinecraftStatus(redis, tracker.snapshot());
    }

    if (initialRead) {
      logger.info(`Siguiendo ${logPath} en tiempo real`);
      initialRead = false;
    }
  };

  const requestRead = () => {
    if (stopped) {
      return;
    }

    if (reading) {
      readAgain = true;
      return;
    }

    reading = (async () => {
      do {
        readAgain = false;
        try {
          await processAvailableLines();
        } catch (error) {
          logger.warn("No se pudo procesar latest.log; se reintentará con el próximo cambio", error);
        }
      } while (readAgain && !stopped);
    })().finally(() => {
      reading = null;
    });
  };

  let watcher: FSWatcher;

  try {
    watcher = watch(logDirectory, (_eventType, filename) => {
      if (!filename || filename.toString() === logFilename) {
        requestRead();
      }
    });
  } catch (error) {
    throw new Error(`No se pudo observar el directorio de logs ${logDirectory}`, { cause: error });
  }

  watcher.on("error", (error) => {
    logger.error("El observador de latest.log ha fallado", error);
  });

  requestRead();
  while (reading) {
    await reading;
  }

  return () => {
    stopped = true;
    watcher.close();
  };
};
