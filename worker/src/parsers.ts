import type { ListStatus, MinecraftActivityEvent, PerformanceStatus } from "./types.js";

export const parseListResponse = (response: string, fallbackMaxPlayers: number): ListStatus | null => {
  const match = response.match(/There are\s+(\d+)\s+of\s+a\s+max\s+of\s+(\d+)\s+players online:?\s*(.*)$/i);

  if (!match) {
    return null;
  }

  const playersOnline = Number.parseInt(match[1], 10);
  const parsedMaxPlayers = Number.parseInt(match[2], 10);
  const playersRaw = match[3]?.trim() ?? "";
  const players = playersRaw
    ? playersRaw
        .split(",")
        .map((player) => player.trim())
        .filter(Boolean)
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

  if (!Number.isFinite(tps) || tps < 0) {
    return null;
  }

  return Math.min(tps, 20);
};

export const parsePerformanceResponse = (response: string): PerformanceStatus | null => {
  const cleanResponse = response.replace(/§[0-9a-fk-or]/gi, "").replace(/\*/g, "");
  const tps = parseTpsResponse(cleanResponse);
  const msptMatch = cleanResponse.match(/(?:├─|└─|-)?\s*5s\s*-\s*(\d+(?:\.\d+)?),\s*\d+(?:\.\d+)?,\s*\d+(?:\.\d+)?/i);
  const mspt = msptMatch ? Number.parseFloat(msptMatch[1]) : null;

  if (tps === null && mspt === null) {
    return null;
  }

  return {
    tps,
    mspt: Number.isFinite(mspt) ? mspt : null,
  };
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

export const parseActivityLogLine = (line: string): MinecraftActivityEvent | null => {
  const message = line.match(logMessagePattern)?.[1]?.trim() || line.trim();

  if (!message) {
    return null;
  }

  const joinMatch = message.match(/^(.+?) joined the game$/i);

  if (joinMatch) {
    const player = joinMatch[1];
    return createActivityEvent("join", `${player} ha entrado al servidor`, player);
  }

  const leaveMatch = message.match(/^(.+?) left the game$/i);

  if (leaveMatch) {
    const player = leaveMatch[1];
    return createActivityEvent("leave", `${player} ha salido del servidor`, player);
  }

  const advancementMatch = message.match(/^(.+?) has (?:made the advancement|completed the challenge|reached the goal) \[(.+)]$/i);

  if (advancementMatch) {
    const [, player, advancement] = advancementMatch;
    return createActivityEvent("advancement", `${player} consiguió ${advancement}`, player);
  }

  const backupMatch = message.match(/\bbackup\b/i);

  if (backupMatch && /\b(done|complete|completed|correctly|success|successful|finalizado|completado)\b/i.test(message)) {
    return createActivityEvent("backup", "El servidor ha hecho backup correctamente");
  }

  const deathMatch = message.match(/^([A-Za-z0-9_]{2,16})\s+(.+)$/);

  if (deathMatch && /\b(was|died|fell|burned|blew|hit|shot|slain|killed|tried|went|starved|drowned|suffocated|discovered)\b/i.test(message)) {
    const player = deathMatch[1];
    return createActivityEvent("death", message, player);
  }

  return null;
};
