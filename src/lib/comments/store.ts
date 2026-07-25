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
const MODERATE_SCRIPT = `
  if redis.call("EXISTS", KEYS[1]) == 0 then return 0 end

  local storedSlug = redis.call("HGET", KEYS[2], "postSlug")
  if not storedSlug or storedSlug ~= ARGV[6] then
    redis.call("DEL", KEYS[1])
    redis.call("SREM", KEYS[3], ARGV[8])
    return -1
  end

  redis.call("DEL", KEYS[1])
  local tokenHashes = redis.call("SMEMBERS", KEYS[3])
  for _, tokenHash in ipairs(tokenHashes) do
    redis.call("DEL", ARGV[1] .. tokenHash)
  end
  redis.call("DEL", KEYS[3])

  redis.call(
    "HSET",
    KEYS[2],
    "status", ARGV[2],
    "moderatedAt", ARGV[3],
    "moderationReason", ARGV[4]
  )
  redis.call("ZREM", KEYS[4], ARGV[5])
  redis.call("ZREM", KEYS[5], ARGV[5])
  redis.call("ZREM", KEYS[6], ARGV[5])
  redis.call("ZREM", KEYS[7], ARGV[5])

  if ARGV[2] == "published" then
    redis.call("ZADD", KEYS[6], ARGV[7], ARGV[5])
  end

  return 1
`;
const UPDATE_OWN_COMMENT_SCRIPT = `
  local identityHash = redis.call("HGET", KEYS[1], "authorIdentityHash")
  local currentStatus = redis.call("HGET", KEYS[1], "status")
  if identityHash ~= ARGV[3] or currentStatus == "deleted" or currentStatus == "rejected" then
    return 0
  end

  local tokenHashes = redis.call("SMEMBERS", KEYS[2])
  for _, tokenHash in ipairs(tokenHashes) do
    redis.call("DEL", ARGV[1] .. tokenHash)
  end
  redis.call("DEL", KEYS[2])

  redis.call(
    "HSET",
    KEYS[1],
    "body", ARGV[4],
    "status", ARGV[5],
    "riskScore", ARGV[6],
    "editedAt", ARGV[7],
    "moderatedAt", "",
    "moderationReason", "owner_edit"
  )
  redis.call("ZREM", KEYS[3], ARGV[2])
  redis.call("ZREM", KEYS[4], ARGV[2])
  redis.call("ZREM", KEYS[5], ARGV[2])
  redis.call("ZREM", KEYS[6], ARGV[2])

  if ARGV[5] == "published" then
    redis.call("ZADD", KEYS[6], ARGV[8], ARGV[2])
  else
    redis.call("ZADD", KEYS[3], ARGV[8], ARGV[2])
  end

  return 1
`;
const CREATE_MODERATION_TOKENS_SCRIPT = `
  local status = redis.call("HGET", KEYS[1], "status")
  local reportCount = tonumber(redis.call("HGET", KEYS[1], "reportCount") or "0")
  if status ~= "pending" and not (status == "published" and reportCount >= 2) then
    return 0
  end

  for index = 3, #ARGV, 2 do
    redis.call("SET", ARGV[1] .. ARGV[index], ARGV[index + 1], "EX", ARGV[2])
    redis.call("SADD", KEYS[2], ARGV[index])
  end
  redis.call("EXPIRE", KEYS[2], ARGV[2])
  return 1
`;

const commentKey = (id: string) => `${COMMENT_PREFIX}${id}`;
const publishedKey = (slug: string) => `${PUBLISHED_PREFIX}${slug}:published`;
const moderationTokenKey = (hash: string) => `comments:moderation-token:${hash}`;
const moderationTokenSetKey = (commentId: string) => `comments:moderation-tokens:${commentId}`;

interface CommentCursor {
  score: number;
  id: string;
}

export const encodeCommentCursor = (cursor: CommentCursor) =>
  Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");

export const decodeCommentCursor = (cursor: string | null): CommentCursor | null => {
  if (!cursor || cursor.length > 256) return null;

  try {
    const value = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as Partial<CommentCursor>;
    return Number.isFinite(value.score)
      && typeof value.id === "string"
      && value.id.length > 0
      ? { score: value.score as number, id: value.id }
      : null;
  } catch {
    return null;
  }
};

const scoredEntries = (values: string[]) => {
  const entries: CommentCursor[] = [];
  for (let index = 0; index < values.length; index += 2) {
    const id = values[index];
    const score = Number.parseFloat(values[index + 1]);
    if (id && Number.isFinite(score)) entries.push({ id, score });
  }
  return entries;
};

const parseComment = (id: string, data: Record<string, string>): CommentRecord | null => {
  if (!data.postSlug || !data.authorCode || !data.avatar || !data.status) return null;

  return {
    id,
    postSlug: data.postSlug,
    authorIdentityHash: data.authorIdentityHash ?? "",
    authorCode: data.authorCode,
    avatar: data.avatar as DefaultSkin,
    nickname: data.nickname ?? "",
    body: data.body ?? "",
    status: data.status as CommentStatus,
    riskScore: Number.parseInt(data.riskScore || "0", 10),
    createdAt: data.createdAt,
    editedAt: data.editedAt ?? "",
    moderatedAt: data.moderatedAt ?? "",
    moderationReason: data.moderationReason ?? "",
    reportCount: Number.parseInt(data.reportCount || "0", 10),
  };
};

const toPublicComment = (
  comment: CommentRecord,
  viewerIdentityHash: string,
): PublicComment => ({
  id: comment.id,
  authorCode: comment.authorCode,
  avatar: comment.avatar,
  nickname: comment.nickname,
  body: comment.body,
  createdAt: comment.createdAt,
  editedAt: comment.editedAt,
  reportCount: comment.reportCount,
  canDelete: Boolean(
    comment.authorIdentityHash
    && comment.authorIdentityHash === viewerIdentityHash
  ),
});

export class CommentRateLimitError extends Error {
  readonly retryAfter: number;

  constructor(retryAfter: number) {
    super("Comment rate limit exceeded");
    this.name = "CommentRateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class CommentStore {
  private readonly redis: Redis;

  constructor(redis: Redis = getRedis()) {
    this.redis = redis;
  }

  async listPublished(
    slug: string,
    cursor: string | null,
    requestedLimit: number | null,
    viewerIdentityHash: string,
  ) {
    const decodedCursor = decodeCommentCursor(cursor);
    const limit = Math.min(
      Math.max(requestedLimit || COMMENT_PAGE_DEFAULT, 1),
      COMMENT_PAGE_MAX,
    );
    const key = publishedKey(slug);
    let entries: CommentCursor[];

    if (!decodedCursor) {
      entries = scoredEntries(
        await this.redis.zrange(key, 0, limit, "WITHSCORES"),
      );
    } else {
      const sameScore = scoredEntries(
        await this.redis.zrangebyscore(
          key,
          decodedCursor.score,
          decodedCursor.score,
          "WITHSCORES",
        ),
      ).filter((entry) => entry.id > decodedCursor.id);
      const remaining = Math.max(0, limit + 1 - sameScore.length);
      const later = remaining
        ? scoredEntries(
            await this.redis.zrangebyscore(
              key,
              `(${decodedCursor.score}`,
              "+inf",
              "WITHSCORES",
              "LIMIT",
              0,
              remaining,
            ),
          )
        : [];
      entries = [...sameScore, ...later].slice(0, limit + 1);
    }

    const hasMore = entries.length > limit;
    const pageEntries = entries.slice(0, limit);
    const pageIds = pageEntries.map((entry) => entry.id);
    const rows = pageIds.length
      ? await Promise.all(pageIds.map((id) => this.redis.hgetall(commentKey(id))))
      : [];
    const comments = rows
      .map((row, index) => parseComment(pageIds[index], row))
      .filter((comment): comment is CommentRecord => comment?.status === "published")
      .map((comment) => toPublicComment(comment, viewerIdentityHash));

    return {
      comments,
      nextCursor: hasMore && pageEntries.length
        ? encodeCommentCursor(pageEntries.at(-1) as CommentCursor)
        : null,
      count: await this.redis.zcard(key),
    };
  }

  async getComment(id: string) {
    return parseComment(id, await this.redis.hgetall(commentKey(id)));
  }

  async createComment(input: Omit<CommentRecord, "id" | "createdAt" | "editedAt" | "moderatedAt" | "moderationReason" | "reportCount">) {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const record: CommentRecord = {
      ...input,
      id,
      createdAt,
      editedAt: "",
      moderatedAt: "",
      moderationReason: "",
      reportCount: 0,
    };
    const values = {
      postSlug: record.postSlug,
      authorIdentityHash: record.authorIdentityHash,
      authorCode: record.authorCode,
      avatar: record.avatar,
      nickname: record.nickname,
      body: record.body,
      status: record.status,
      riskScore: String(record.riskScore),
      createdAt,
      editedAt: "",
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

  async deleteOwnComment(id: string, identityHash: string) {
    const comment = await this.getComment(id);
    if (
      !comment
      || !comment.authorIdentityHash
      || comment.authorIdentityHash !== identityHash
    ) {
      return false;
    }

    const tokenHashes = await this.redis.smembers(moderationTokenSetKey(id));
    const transaction = this.redis.multi()
      .del(commentKey(id))
      .zrem(publishedKey(comment.postSlug), id)
      .zrem(PENDING_KEY, id)
      .zrem(REPORTED_KEY, id)
      .zrem(NOTIFICATIONS_KEY, id);

    for (const tokenHash of tokenHashes) {
      transaction.del(moderationTokenKey(tokenHash));
    }
    transaction.del(moderationTokenSetKey(id));

    await transaction.exec();
    return true;
  }

  async updateOwnComment(
    id: string,
    identityHash: string,
    input: {
      body: string;
      status: "published" | "pending";
      riskScore: number;
    },
  ) {
    const comment = await this.getComment(id);
    if (
      !comment
      || !comment.authorIdentityHash
      || comment.authorIdentityHash !== identityHash
      || comment.status === "deleted"
      || comment.status === "rejected"
    ) {
      return null;
    }

    const editedAt = new Date().toISOString();
    const updated = await this.redis.eval(
      UPDATE_OWN_COMMENT_SCRIPT,
      6,
      commentKey(id),
      moderationTokenSetKey(id),
      PENDING_KEY,
      REPORTED_KEY,
      NOTIFICATIONS_KEY,
      publishedKey(comment.postSlug),
      "comments:moderation-token:",
      id,
      identityHash,
      input.body,
      input.status,
      String(input.riskScore),
      editedAt,
      Date.parse(comment.createdAt),
    );
    if (Number(updated) !== 1) return null;

    return {
      ...comment,
      body: input.body,
      status: input.status,
      riskScore: input.riskScore,
      editedAt,
      moderatedAt: "",
      moderationReason: "owner_edit",
    };
  }

  async consumeEditLimit(identityHash: string) {
    const [count, ttl] = await this.redis.eval(
      RATE_SCRIPT,
      1,
      `comments:rate:edit:hour:${identityHash}`,
      60 * 60,
    ) as [number, number];
    if (count > 10) throw new CommentRateLimitError(Math.max(ttl, 1));
    return Math.min(count / 10, 1);
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
    return {
      comment,
      duplicate: false,
      thresholdCrossed: count === 2,
    };
  }

  async consumeReportLimit(identityHash: string, networkHash: string) {
    const results = await Promise.all([
      this.redis.eval(
        RATE_SCRIPT,
        1,
        `comments:rate:report:identity:day:${identityHash}`,
        60 * 60 * 24,
      ),
      this.redis.eval(
        RATE_SCRIPT,
        1,
        `comments:rate:report:network:day:${networkHash}`,
        60 * 60 * 24,
      ),
    ]) as [number, number][];
    const retryAfter = results.reduce(
      (current, [count, ttl]) => count > 10 ? Math.max(current, ttl) : current,
      0,
    );
    if (retryAfter > 0) {
      throw new CommentRateLimitError(Math.max(retryAfter, 1));
    }
  }

  async createModerationTokens(commentId: string) {
    const actions = ["approve", "reject", "delete"] as const;
    const ttl = 24 * 60 * 60;
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
    const values = actions.map((action) => {
      const token = randomBytes(24).toString("base64url");
      const tokenHash = createHash("sha256").update(token).digest("base64url");
      const record: ModerationTokenRecord = { commentId, action, expiresAt };
      return { token, tokenHash, record: JSON.stringify(record) };
    });
    const created = await this.redis.eval(
      CREATE_MODERATION_TOKENS_SCRIPT,
      2,
      commentKey(commentId),
      moderationTokenSetKey(commentId),
      "comments:moderation-token:",
      ttl,
      ...values.flatMap(({ tokenHash, record }) => [tokenHash, record]),
    );

    return Number(created) === 1 ? values.map(({ token }) => token) : null;
  }

  async deleteModerationToken(token: string) {
    const tokenHash = createHash("sha256").update(token).digest("base64url");
    const record = await this.readModerationToken(token);
    const transaction = this.redis.multi().del(moderationTokenKey(tokenHash));
    if (record) transaction.srem(moderationTokenSetKey(record.commentId), tokenHash);
    await transaction.exec();
  }

  async readModerationToken(token: string) {
    if (!/^[A-Za-z0-9_-]{32}$/.test(token)) return null;

    const tokenHash = createHash("sha256").update(token).digest("base64url");
    const key = moderationTokenKey(tokenHash);
    const value = await this.redis.get(key);
    if (typeof value !== "string") return null;

    try {
      const record = JSON.parse(value) as ModerationTokenRecord;
      return typeof record.commentId === "string"
        && ["approve", "reject", "delete"].includes(record.action)
        && Date.parse(record.expiresAt) > Date.now()
        ? record
        : null;
    } catch {
      return null;
    }
  }

  async moderateCommentWithToken(token: string) {
    const record = await this.readModerationToken(token);
    if (!record) return null;

    const comment = await this.getComment(record.commentId);
    if (!comment) {
      await this.deleteModerationToken(token);
      return null;
    }

    const nextStatus: CommentStatus = record.action === "approve"
      ? "published"
      : record.action === "reject"
        ? "rejected"
        : "deleted";
    const now = new Date().toISOString();
    const tokenHash = createHash("sha256").update(token).digest("base64url");
    const result = await this.redis.eval(
      MODERATE_SCRIPT,
      7,
      moderationTokenKey(tokenHash),
      commentKey(comment.id),
      moderationTokenSetKey(comment.id),
      PENDING_KEY,
      REPORTED_KEY,
      publishedKey(comment.postSlug),
      NOTIFICATIONS_KEY,
      "comments:moderation-token:",
      nextStatus,
      now,
      `discord_${record.action}`,
      comment.id,
      comment.postSlug,
      Date.parse(comment.createdAt),
      tokenHash,
    );
    if (Number(result) !== 1) return null;

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
