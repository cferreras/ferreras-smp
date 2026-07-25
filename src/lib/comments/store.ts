import { createHash, randomBytes, randomUUID } from "node:crypto";
import type Redis from "ioredis";
import { getRedis } from "../redis.ts";
import {
  COMMENT_PAGE_DEFAULT,
  COMMENT_PAGE_MAX,
  type DefaultSkin,
} from "./constants.ts";
import type {
  CommentRecord,
  CommentStatus,
  ModerationAction,
  ModerationTokenRecord,
  PublicComment,
} from "./types.ts";

const COMMENT_PREFIX = "comments:comment:";
const PUBLISHED_PREFIX = "comments:post:";
const PENDING_KEY = "comments:moderation:pending";
const REPORTED_KEY = "comments:moderation:reported";
const NOTIFICATIONS_KEY = "comments:notifications:pending";
const RATE_SCRIPT = `
  local value = redis.call("INCR", KEYS[1])
  if value == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end
  local ttl = redis.call("TTL", KEYS[1])
  return { value, ttl }
`;

const commentKey = (id: string) => `${COMMENT_PREFIX}${id}`;
const publishedKey = (slug: string) => `${PUBLISHED_PREFIX}${slug}:published`;
const moderationTokenKey = (hash: string) => `comments:moderation-token:${hash}`;
const moderationTokenSetKey = (commentId: string) => `comments:moderation-tokens:${commentId}`;

const encodeCursor = (offset: number) =>
  Buffer.from(String(offset), "utf8").toString("base64url");

const decodeCursor = (cursor: string | null) => {
  if (!cursor) return 0;

  try {
    const value = Number.parseInt(Buffer.from(cursor, "base64url").toString("utf8"), 10);
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
};

const parseComment = (id: string, data: Record<string, string>): CommentRecord | null => {
  if (!data.postSlug || !data.authorCode || !data.avatar || !data.status) return null;

  return {
    id,
    postSlug: data.postSlug,
    authorCode: data.authorCode,
    avatar: data.avatar as DefaultSkin,
    nickname: data.nickname ?? "",
    body: data.body ?? "",
    status: data.status as CommentStatus,
    riskScore: Number.parseInt(data.riskScore || "0", 10),
    createdAt: data.createdAt,
    moderatedAt: data.moderatedAt ?? "",
    moderationReason: data.moderationReason ?? "",
    reportCount: Number.parseInt(data.reportCount || "0", 10),
  };
};

const toPublicComment = (comment: CommentRecord): PublicComment => ({
  id: comment.id,
  authorCode: comment.authorCode,
  avatar: comment.avatar,
  nickname: comment.nickname,
  body: comment.body,
  createdAt: comment.createdAt,
  reportCount: comment.reportCount,
});

export class CommentRateLimitError extends Error {
  constructor(public readonly retryAfter: number) {
    super("Comment rate limit exceeded");
    this.name = "CommentRateLimitError";
  }
}

export class CommentStore {
  constructor(private readonly redis: Redis = getRedis()) {}

  async listPublished(slug: string, cursor: string | null, requestedLimit: number | null) {
    const offset = decodeCursor(cursor);
    const limit = Math.min(
      Math.max(requestedLimit || COMMENT_PAGE_DEFAULT, 1),
      COMMENT_PAGE_MAX,
    );
    const ids = await this.redis.zrange(publishedKey(slug), offset, offset + limit);
    const hasMore = ids.length > limit;
    const pageIds = ids.slice(0, limit);
    const rows = pageIds.length
      ? await Promise.all(pageIds.map((id) => this.redis.hgetall(commentKey(id))))
      : [];
    const comments = rows
      .map((row, index) => parseComment(pageIds[index], row))
      .filter((comment): comment is CommentRecord => comment?.status === "published")
      .map(toPublicComment);

    return {
      comments,
      nextCursor: hasMore ? encodeCursor(offset + limit) : null,
      count: await this.redis.zcard(publishedKey(slug)),
    };
  }

  async getComment(id: string) {
    return parseComment(id, await this.redis.hgetall(commentKey(id)));
  }

  async createComment(input: Omit<CommentRecord, "id" | "createdAt" | "moderatedAt" | "moderationReason" | "reportCount">) {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const record: CommentRecord = {
      ...input,
      id,
      createdAt,
      moderatedAt: "",
      moderationReason: "",
      reportCount: 0,
    };
    const values = {
      postSlug: record.postSlug,
      authorCode: record.authorCode,
      avatar: record.avatar,
      nickname: record.nickname,
      body: record.body,
      status: record.status,
      riskScore: String(record.riskScore),
      createdAt,
      moderatedAt: "",
      moderationReason: "",
      reportCount: "0",
    };
    const transaction = this.redis.multi().hset(commentKey(id), values);

    if (record.status === "published") {
      transaction.zadd(publishedKey(record.postSlug), Date.parse(createdAt), id);
    } else if (record.status === "pending") {
      transaction.zadd(PENDING_KEY, Date.parse(createdAt), id);
    }

    await transaction.exec();
    return record;
  }

  async consumeRateLimits(identityHash: string, networkHash: string) {
    const windows = [
      { name: "burst", seconds: 30, limit: 1 },
      { name: "hour", seconds: 60 * 60, limit: 5 },
      { name: "day", seconds: 60 * 60 * 24, limit: 15 },
    ];
    const checks = windows.flatMap((window) => [
      {
        ...window,
        promise: this.redis.eval(
          RATE_SCRIPT,
          1,
          `comments:rate:identity:${window.name}:${identityHash}`,
          window.seconds,
        ),
      },
      {
        ...window,
        promise: this.redis.eval(
          RATE_SCRIPT,
          1,
          `comments:rate:network:${window.name}:${networkHash}`,
          window.seconds,
        ),
      },
    ]);
    const results = await Promise.all(checks.map((check) => check.promise));
    let pressure = 0;
    let retryAfter = 0;

    results.forEach((raw, index) => {
      const [count, ttl] = raw as [number, number];
      const check = checks[index];
      pressure = Math.max(pressure, count / check.limit);
      if (count > check.limit) retryAfter = Math.max(retryAfter, ttl);
    });

    if (retryAfter > 0) throw new CommentRateLimitError(retryAfter);
    return Math.min(pressure, 1);
  }

  async markDuplicate(identityHash: string, body: string) {
    const bodyHash = createHash("sha256").update(body).digest("base64url");
    const result = await this.redis.set(
      `comments:duplicate:${identityHash}:${bodyHash}`,
      "1",
      "EX",
      60 * 60,
      "NX",
    );
    return result !== "OK";
  }

  async beginIdempotentRequest(key: string) {
    const redisKey = `comments:idempotency:${key}`;
    const existing = await this.redis.get(redisKey);
    if (existing) return existing;

    const claimed = await this.redis.set(redisKey, "processing", "EX", 10 * 60, "NX");
    return claimed === "OK" ? null : (await this.redis.get(redisKey)) ?? "processing";
  }

  async completeIdempotentRequest(key: string, result: unknown) {
    await this.redis.set(
      `comments:idempotency:${key}`,
      JSON.stringify(result),
      "EX",
      60 * 60 * 24,
    );
  }

  async clearIdempotentRequest(key: string) {
    await this.redis.del(`comments:idempotency:${key}`);
  }

  async reportComment(id: string, identityHash: string) {
    const comment = await this.getComment(id);
    if (!comment || comment.status !== "published") return null;

    const unique = await this.redis.set(
      `comments:report:${id}:${identityHash}`,
      "1",
      "EX",
      60 * 60 * 24 * 30,
      "NX",
    );
    if (unique !== "OK") return { comment, duplicate: true };

    const count = await this.redis.hincrby(commentKey(id), "reportCount", 1);
    comment.reportCount = count;
    if (count >= 2) await this.redis.zadd(REPORTED_KEY, Date.now(), id);
    return { comment, duplicate: false };
  }

  async consumeReportLimit(identityHash: string) {
    const [count, ttl] = await this.redis.eval(
      RATE_SCRIPT,
      1,
      `comments:rate:report:day:${identityHash}`,
      60 * 60 * 24,
    ) as [number, number];
    if (count > 10) throw new CommentRateLimitError(Math.max(ttl, 1));
  }

  async createModerationToken(commentId: string, action: ModerationAction) {
    const token = randomBytes(24).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("base64url");
    const record: ModerationTokenRecord = {
      commentId,
      action,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    await this.redis.multi()
      .set(
        moderationTokenKey(tokenHash),
        JSON.stringify(record),
        "EX",
        24 * 60 * 60,
      )
      .sadd(moderationTokenSetKey(commentId), tokenHash)
      .expire(moderationTokenSetKey(commentId), 24 * 60 * 60)
      .exec();
    return token;
  }

  async deleteModerationToken(token: string) {
    const tokenHash = createHash("sha256").update(token).digest("base64url");
    const record = await this.readModerationToken(token);
    const transaction = this.redis.multi().del(moderationTokenKey(tokenHash));
    if (record) transaction.srem(moderationTokenSetKey(record.commentId), tokenHash);
    await transaction.exec();
  }

  async readModerationToken(token: string) {
    const tokenHash = createHash("sha256").update(token).digest("base64url");
    const key = moderationTokenKey(tokenHash);
    const value = await this.redis.get(key);
    if (typeof value !== "string") return null;

    try {
      const record = JSON.parse(value) as ModerationTokenRecord;
      return Date.parse(record.expiresAt) > Date.now() ? record : null;
    } catch {
      return null;
    }
  }

  async moderateComment(id: string, action: ModerationAction) {
    const comment = await this.getComment(id);
    if (!comment) return null;

    const nextStatus: CommentStatus = action === "approve"
      ? "published"
      : action === "reject"
        ? "rejected"
        : "deleted";
    const now = new Date().toISOString();
    const tokenHashes = await this.redis.smembers(moderationTokenSetKey(id));
    const transaction = this.redis.multi()
      .hset(commentKey(id), {
        status: nextStatus,
        moderatedAt: now,
        moderationReason: `discord_${action}`,
      })
      .zrem(PENDING_KEY, id)
      .zrem(REPORTED_KEY, id)
      .zrem(publishedKey(comment.postSlug), id);

    for (const tokenHash of tokenHashes) {
      transaction.del(moderationTokenKey(tokenHash));
    }
    transaction.del(moderationTokenSetKey(id));

    if (nextStatus === "published") {
      transaction.zadd(publishedKey(comment.postSlug), Date.parse(comment.createdAt), id);
    }

    await transaction.exec();
    return { ...comment, status: nextStatus, moderatedAt: now };
  }

  async queueNotification(commentId: string) {
    await this.redis.zadd(NOTIFICATIONS_KEY, Date.now(), commentId);
  }

  async clearNotification(commentId: string) {
    await this.redis.zrem(NOTIFICATIONS_KEY, commentId);
  }

  async getQueuedNotifications(limit = 3) {
    return this.redis.zrange(NOTIFICATIONS_KEY, 0, Math.max(0, limit - 1));
  }
}
