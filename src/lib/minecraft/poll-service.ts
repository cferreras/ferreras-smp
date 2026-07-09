import type { MinecraftPoll } from "../../types/minecraft-live";
import { getRedis } from "../redis";
import { MINECRAFT_REDIS_KEYS, POLL_OPTIONS } from "./constants";
import { minecraftLiveService } from "./minecraft-live-service";
import { hashIp } from "./security";

const RATE_LIMIT_SECONDS = 86_400;

export type PollVoteResult =
  | {
      ok: true;
      poll: MinecraftPoll;
    }
  | {
      ok: false;
      error: string;
      status: number;
    };

export const pollService = {
  async getCurrentPoll(): Promise<MinecraftPoll> {
    return minecraftLiveService.getPoll();
  },

  async vote(optionId: string, ip: string): Promise<PollVoteResult> {
    if (!optionId) {
      return {
        ok: false,
        error: "Falta optionId",
        status: 400,
      };
    }

    const optionExists = POLL_OPTIONS.some((option) => option.id === optionId);

    if (!optionExists) {
      return {
        ok: false,
        error: "Opción no válida",
        status: 400,
      };
    }

    const redis = getRedis();
    const ipHash = hashIp(ip);
    const rateLimitKey = `${MINECRAFT_REDIS_KEYS.pollRateLimitPrefix}:${ipHash}`;
    const voteAllowed = await redis.set(rateLimitKey, "1", "EX", RATE_LIMIT_SECONDS, "NX");

    if (voteAllowed !== "OK") {
      return {
        ok: false,
        error: "Ya has votado recientemente",
        status: 429,
      };
    }

    await redis.zincrby(MINECRAFT_REDIS_KEYS.pollVotes, 1, optionId);

    return {
      ok: true,
      poll: await minecraftLiveService.getPoll(),
    };
  },
};
