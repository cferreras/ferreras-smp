import type { MinecraftActivityEvent, MinecraftPoll, MinecraftStatus } from "../../types/minecraft-live";

export const MINECRAFT_REDIS_KEYS = {
  status: "mc:status",
  activityRecent: "mc:activity:recent",
  pollVotes: "mc:poll:weekend-plan:votes",
  pollMeta: "mc:poll:weekend-plan:meta",
  pollRateLimitPrefix: "mc:rate:poll:weekend-plan",
} as const;

export const POLL_ID = "weekend-plan";
export const POLL_QUESTION = "¿Qué hacemos este finde?";

export const POLL_OPTIONS = [
  { id: "end", label: "Ir al End" },
  { id: "spawn", label: "Construir zona común" },
  { id: "ancient-city", label: "Explorar Ancient City" },
  { id: "fishing", label: "Evento de pesca" },
] as const;

export const DEFAULT_MINECRAFT_STATUS: MinecraftStatus = {
  online: false,
  host: "mc.ferreras.dev",
  playersOnline: 0,
  maxPlayers: 20,
  players: [],
  worldDay: null,
  tps: null,
  mspt: null,
  version: null,
  lastUpdated: new Date(0).toISOString(),
};

export const DEFAULT_MINECRAFT_ACTIVITY: MinecraftActivityEvent[] = [];

export const DEFAULT_MINECRAFT_POLL: MinecraftPoll = {
  id: POLL_ID,
  question: POLL_QUESTION,
  options: POLL_OPTIONS.map((option) => ({
    ...option,
    votes: 0,
    percentage: 0,
  })),
  totalVotes: 0,
};

export const DEFAULT_MINECRAFT_SNAPSHOT = {
  status: DEFAULT_MINECRAFT_STATUS,
  activity: DEFAULT_MINECRAFT_ACTIVITY,
  poll: DEFAULT_MINECRAFT_POLL,
};
