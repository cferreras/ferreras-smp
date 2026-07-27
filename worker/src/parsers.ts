import type {
  ListStatus,
  MinecraftActivityEvent,
  ParsedMinecraftLogLine,
  PerformanceStatus,
} from "./types.js";

export const parseListResponse = (response: string, fallbackMaxPlayers: number): ListStatus | null => {
  const match = response.match(/There are\s+(\d+)\s+of\s+a\s+max\s+of\s+(\d+)\s+players online:?\s*(.*)$/i);

  if (!match) {
    return null;
  }

  const playersOnline = Number.parseInt(match[1], 10);
  const parsedMaxPlayers = Number.parseInt(match[2], 10);
  const playersRaw = match[3]?.trim() ?? "";
  const players = playersRaw
    ? playersRaw.split(",").map((player) => player.trim()).filter(Boolean)
    : [];

  return {
    playersOnline: Number.isFinite(playersOnline) ? playersOnline : players.length,
    maxPlayers: Number.isFinite(parsedMaxPlayers) ? parsedMaxPlayers : fallbackMaxPlayers,
    players,
  };
};

export const parseWorldDayResponse = (response: string): number | null => {
  if (/Timeline\s+minecraft:day\b/i.test(response)) {
    return null;
  }

  const dayCountMatch = response.match(/Current day count:\s*(\d+)/i);

  if (dayCountMatch) {
    const dayCount = Number.parseInt(dayCountMatch[1], 10);
    return Number.isFinite(dayCount) ? dayCount : null;
  }

  const match = response.match(/(?:The time is|time is)\s*(-?\d+)/i);

  if (!match) {
    return null;
  }

  const worldDay = Number.parseInt(match[1], 10);
  return Number.isFinite(worldDay) && worldDay >= 0 ? worldDay : null;
};

export const parseTpsResponse = (response: string): number | null => {
  const cleanResponse = response.replace(/§[0-9a-fk-or]/gi, "").replace(/\*/g, "");
  const sparkMatch = cleanResponse.match(/TPS from last 5s,\s*10s,\s*1m,\s*5m,\s*15m:\D*(20(?:\.0+)?|1?\d(?:\.\d+)?)/i);
  const match = sparkMatch ?? cleanResponse.match(/(?:TPS:\s*|TPS[^0-9:]*:\s*|^)(20(?:\.0+)?|1?\d(?:\.\d+)?)/i);

  if (!match) {
    return null;
  }

  const tps = Number.parseFloat(match[1]);
  return Number.isFinite(tps) && tps >= 0 ? Math.min(tps, 20) : null;
};

export const parsePerformanceResponse = (response: string): PerformanceStatus | null => {
  const cleanResponse = response.replace(/§[0-9a-fk-or]/gi, "").replace(/\*/g, "");
  const tps = parseTpsResponse(cleanResponse);
  const msptMatch = cleanResponse.match(/(?:├─|└─|-)?\s*5s\s*-\s*(\d+(?:\.\d+)?),\s*\d+(?:\.\d+)?,\s*\d+(?:\.\d+)?/i);
  const mspt = msptMatch ? Number.parseFloat(msptMatch[1]) : null;

  if (tps === null && mspt === null) {
    return null;
  }

  return { tps, mspt: Number.isFinite(mspt) ? mspt : null };
};

const logMessagePattern = /^\[[^\]]+]\s+\[[^\]]+]:\s+(?:\[[^\]]+]\s+)?(.+)$/;

const createActivityEvent = (
  type: MinecraftActivityEvent["type"],
  message: string,
  player?: string,
): MinecraftActivityEvent => ({
  id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  type,
  player,
  message,
  createdAt: new Date().toISOString(),
});

export const parseMinecraftLogLine = (line: string): ParsedMinecraftLogLine => {
  const message = line.match(logMessagePattern)?.[1]?.trim() || line.trim();

  if (!message) {
    return { activity: null, state: null };
  }

  const startingMatch = message.match(/^Starting minecraft server version\s+(.+)$/i);

  if (startingMatch) {
    return {
      activity: null,
      state: { type: "server_starting", version: startingMatch[1].trim() || null },
    };
  }

  if (/^Done \([^)]+\)!\s+For help,/i.test(message)) {
    return {
      activity: createActivityEvent("system", "El servidor está disponible"),
      state: { type: "server_ready" },
    };
  }

  if (/^(?:Stopping server|Closing server|Thread RCON Listener stopped)$/i.test(message)) {
    return {
      activity: createActivityEvent("system", "El servidor se ha detenido"),
      state: { type: "server_stopped" },
    };
  }

  const worldDayMatch =
    message.match(/^¡Un nuevo día comienza!\s+Día:?\s*(\d+)\.?$/i) ??
    message.match(/^A new day has begun!\s+Day:?\s*(\d+)\.?$/i);

  if (worldDayMatch) {
    return {
      activity: null,
      state: { type: "world_day", day: Number.parseInt(worldDayMatch[1], 10) },
    };
  }

  const joinMatch = message.match(
    /^([A-Za-z0-9_]{2,16}) (?:joined the game|se ha unido a la partida)$/i,
  );

  if (joinMatch) {
    const player = joinMatch[1];
    return {
      activity: createActivityEvent("join", `${player} ha entrado al servidor`, player),
      state: { type: "player_join", player },
    };
  }

  const leaveMatch = message.match(
    /^([A-Za-z0-9_]{2,16}) (?:left the game|ha abandonado la partida)$/i,
  );

  if (leaveMatch) {
    const player = leaveMatch[1];
    return {
      activity: createActivityEvent("leave", `${player} ha salido del servidor`, player),
      state: { type: "player_leave", player },
    };
  }

  const advancementMatch = message.match(
    /^(.+?) (?:has (?:made the advancement|completed the challenge|reached the goal)|ha (?:conseguido el progreso|completado el desafío|alcanzado el objetivo)) \[(.+)]$/i,
  );

  if (advancementMatch) {
    const [, player, advancement] = advancementMatch;
    return {
      activity: createActivityEvent("advancement", `${player} consiguió ${advancement}`, player),
      state: null,
    };
  }

  if (
    /\bbackup\b/i.test(message) &&
    /\b(done|complete|completed|correctly|success|successful|finalizado|completado)\b/i.test(message)
  ) {
    return {
      activity: createActivityEvent("backup", "El servidor ha hecho backup correctamente"),
      state: null,
    };
  }

  const deathMatch = message.match(/^([A-Za-z0-9_]{2,16})\s+(.+)$/);

  if (
    deathMatch &&
    (/\b(was|died|fell|burned|blew|hit|shot|slain|killed|tried|went|starved|drowned|suffocated|discovered)\b/i.test(message) ||
      /(murió|muerto|cayó|ardió|quemó|explotó|asesinado|disparado|ahogó|asfixió|intentó|descubrió)/i.test(message))
  ) {
    const player = deathMatch[1];
    return {
      activity: createActivityEvent("death", message, player),
      state: null,
    };
  }

  return { activity: null, state: null };
};

export const parseActivityLogLine = (line: string): MinecraftActivityEvent | null =>
  parseMinecraftLogLine(line).activity;
