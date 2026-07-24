import type {
  MinecraftActivityEvent,
  MinecraftLiveSnapshot,
  MinecraftStatus,
} from "../../types/minecraft-live";
import { ACTIVITY_EVENT_LOOKBACK_LIMIT } from "../group-activity-events";
import { getRedis } from "../redis";
import {
  DEFAULT_MINECRAFT_SNAPSHOT,
  DEFAULT_MINECRAFT_STATUS,
  MINECRAFT_REDIS_KEYS,
} from "./constants";

const parseJson = <T>(value: string | null): T | undefined => {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
};

const normalizeStatus = (status?: Partial<MinecraftStatus>): MinecraftStatus => ({
  ...DEFAULT_MINECRAFT_STATUS,
  ...status,
  players: Array.isArray(status?.players) ? status.players : DEFAULT_MINECRAFT_STATUS.players,
  online: status?.online ?? DEFAULT_MINECRAFT_STATUS.online,
  playersOnline: status?.playersOnline ?? DEFAULT_MINECRAFT_STATUS.playersOnline,
  maxPlayers: status?.maxPlayers ?? DEFAULT_MINECRAFT_STATUS.maxPlayers,
  worldDay: status?.worldDay ?? DEFAULT_MINECRAFT_STATUS.worldDay,
  tps: status?.tps ?? DEFAULT_MINECRAFT_STATUS.tps,
  lastUpdated: status?.lastUpdated ?? new Date().toISOString(),
});

const isActivityEvent = (event: Partial<MinecraftActivityEvent>): event is MinecraftActivityEvent =>
  typeof event.id === "string" &&
  typeof event.type === "string" &&
  typeof event.message === "string" &&
  typeof event.createdAt === "string";

export const minecraftLiveService = {
  getFallbackSnapshot(): MinecraftLiveSnapshot {
    return DEFAULT_MINECRAFT_SNAPSHOT;
  },

  async getSnapshot(): Promise<MinecraftLiveSnapshot> {
    const [status, activity] = await Promise.all([
      this.getStatus(),
      this.getActivity(ACTIVITY_EVENT_LOOKBACK_LIMIT),
    ]);

    return {
      status,
      activity,
    };
  },

  async getStatus(): Promise<MinecraftStatus> {
    const redis = getRedis();
    const status = parseJson<Partial<MinecraftStatus>>(await redis.get(MINECRAFT_REDIS_KEYS.status));

    return normalizeStatus(status);
  },

  async getActivity(limit: number): Promise<MinecraftActivityEvent[]> {
    const redis = getRedis();
    const values = await redis.lrange(MINECRAFT_REDIS_KEYS.activityRecent, 0, limit - 1);

    return values
      .map((value) => parseJson<Partial<MinecraftActivityEvent>>(value))
      .filter((event): event is MinecraftActivityEvent => Boolean(event && isActivityEvent(event)));
  },
};
