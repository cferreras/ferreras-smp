import type { MinecraftActivityEvent, MinecraftPoll, MinecraftStatus } from "../../types/minecraft-live";

export const MINECRAFT_REDIS_KEYS = {
  status: "mc:status",
  activityRecent: "mc:activity:recent",
  pollVotes: "mc:poll:server-feedback:votes",
  pollMeta: "mc:poll:server-feedback:meta",
  pollRateLimitPrefix: "mc:rate:poll:server-feedback",
} as const;

export const POLL_ID = "server-feedback";
export const POLL_QUESTION = "¿Qué te parece el servidor?";

export const POLL_OPTIONS = [
  { id: "great", label: "Me encanta" },
  { id: "good", label: "Está bien" },
  { id: "improve", label: "Puede mejorar" },
  { id: "issues", label: "He tenido problemas" },
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
