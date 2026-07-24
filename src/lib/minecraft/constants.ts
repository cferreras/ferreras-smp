import type { MinecraftActivityEvent, MinecraftStatus } from "../../types/minecraft-live";

export const MINECRAFT_REDIS_KEYS = {
  status: "mc:status",
  activityRecent: "mc:activity:recent",
} as const;

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

export const DEFAULT_MINECRAFT_SNAPSHOT = {
  status: DEFAULT_MINECRAFT_STATUS,
  activity: DEFAULT_MINECRAFT_ACTIVITY,
};
