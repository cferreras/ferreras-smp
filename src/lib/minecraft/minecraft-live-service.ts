import type {
  MinecraftActivityEvent,
  MinecraftLiveSnapshot,
  MinecraftPoll,
  MinecraftStatus,
} from "../../types/minecraft-live";
import { getRedis } from "../redis";
import {
  DEFAULT_MINECRAFT_POLL,
  DEFAULT_MINECRAFT_SNAPSHOT,
  DEFAULT_MINECRAFT_STATUS,
  MINECRAFT_REDIS_KEYS,
  POLL_ID,
  POLL_OPTIONS,
  POLL_QUESTION,
} from "./constants";

type PollMeta = {
  id?: string;
  question?: string;
};

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

const calculatePercentage = (votes: number, totalVotes: number) =>
  totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);

const getPollMeta = async (): Promise<Required<PollMeta>> => {
  const redis = getRedis();
  const meta = parseJson<PollMeta>(await redis.get(MINECRAFT_REDIS_KEYS.pollMeta));

  return {
    id: meta?.id || POLL_ID,
    question: meta?.question || POLL_QUESTION,
  };
};

export const minecraftLiveService = {
  getFallbackSnapshot(): MinecraftLiveSnapshot {
    return DEFAULT_MINECRAFT_SNAPSHOT;
  },

  async getSnapshot(): Promise<MinecraftLiveSnapshot> {
    const [status, activity, poll] = await Promise.all([
      this.getStatus(),
      this.getActivity(),
      this.getPoll(),
    ]);

    return {
      status,
      activity,
      poll,
    };
  },

  async getStatus(): Promise<MinecraftStatus> {
    const redis = getRedis();
    const status = parseJson<Partial<MinecraftStatus>>(await redis.get(MINECRAFT_REDIS_KEYS.status));

    return normalizeStatus(status);
  },

  async getActivity(): Promise<MinecraftActivityEvent[]> {
    const redis = getRedis();
    const values = await redis.lrange(MINECRAFT_REDIS_KEYS.activityRecent, 0, 9);

    return values
      .map((value) => parseJson<Partial<MinecraftActivityEvent>>(value))
      .filter((event): event is MinecraftActivityEvent => Boolean(event && isActivityEvent(event)));
  },

  async getPoll(): Promise<MinecraftPoll> {
    const redis = getRedis();
    const [meta, scores] = await Promise.all([
      getPollMeta(),
      Promise.all(POLL_OPTIONS.map((option) => redis.zscore(MINECRAFT_REDIS_KEYS.pollVotes, option.id))),
    ]);
    const votes = scores.map((score) => (score ? Number(score) : 0));
    const totalVotes = votes.reduce((total, voteCount) => total + voteCount, 0);

    return {
      ...DEFAULT_MINECRAFT_POLL,
      id: meta.id,
      question: meta.question,
      totalVotes,
      options: POLL_OPTIONS.map((option, index) => ({
        ...option,
        votes: votes[index] || 0,
        percentage: calculatePercentage(votes[index] || 0, totalVotes),
      })),
    };
  },
};
