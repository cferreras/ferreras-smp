import { getPublishedBlogPosts } from "../blog.ts";
import { getCommentsConfig } from "./config.ts";
import { notifyOrQueue, retryQueuedNotifications } from "./discord.ts";
import {
  getIdentityFromRequest,
  hashIdentity,
  hashNetworkAddress,
} from "./identity.ts";
import { assessCommentRisk } from "./risk.ts";
import {
  CommentRateLimitError,
  CommentStore,
} from "./store.ts";
import { verifyTurnstileToken } from "./turnstile.ts";
import type { PublicComment } from "./types.ts";
import { validateCommentEdit, validateSubmission } from "./validation.ts";

let publishedSlugsPromise: Promise<Set<string>> | undefined;

const getPublishedSlugs = () => {
  publishedSlugsPromise ??= getPublishedBlogPosts()
    .then((posts) => new Set(posts.map((post) => post.id)));
  return publishedSlugsPromise;
};

const getClientAddress = (request: Request) =>
  request.headers.get("cf-connecting-ip")
  || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  || "unknown";

const publicComment = (comment: {
  id: string;
  authorCode: string;
  avatar: PublicComment["avatar"];
  nickname: string;
  body: string;
  createdAt: string;
  editedAt: string;
  reportCount: number;
}, canDelete: boolean): PublicComment => ({
  id: comment.id,
  authorCode: comment.authorCode,
  avatar: comment.avatar,
  nickname: comment.nickname,
  body: comment.body,
  createdAt: comment.createdAt,
  editedAt: comment.editedAt,
  reportCount: comment.reportCount,
  canDelete,
});

export class UnknownBlogPostError extends Error {
  constructor() {
    super("Unknown blog post");
    this.name = "UnknownBlogPostError";
  }
}

export class TurnstileValidationError extends Error {
  constructor() {
    super("Turnstile validation failed");
    this.name = "TurnstileValidationError";
  }
}

export class IdempotencyInProgressError extends Error {
  constructor() {
    super("Idempotent request is still processing");
    this.name = "IdempotencyInProgressError";
  }
}

export class OwnCommentNotFoundError extends Error {
  constructor() {
    super("Own comment not found");
    this.name = "OwnCommentNotFoundError";
  }
}

export class CommentEditRejectedError extends Error {
  constructor() {
    super("Comment edit rejected");
    this.name = "CommentEditRejectedError";
  }
}

export class CommentsService {
  constructor(private readonly store = new CommentStore()) {}

  async assertPublishedSlug(slug: string) {
    if (!(await getPublishedSlugs()).has(slug)) throw new UnknownBlogPostError();
  }

  async list(request: Request, slug: string, cursor: string | null, limit: number | null) {
    const config = getCommentsConfig();
    await this.assertPublishedSlug(slug);
    const identity = getIdentityFromRequest(request, config.identitySecret);
    const identityHash = hashIdentity(config.identitySecret, identity.identityId);
    const page = await this.store.listPublished(slug, cursor, limit, identityHash);

    return {
      ...page,
      viewer: identity.viewer,
      cookie: identity.cookie,
    };
  }

  async submit(request: Request, slug: string, input: unknown) {
    const config = getCommentsConfig();
    await this.assertPublishedSlug(slug);
    const submission = validateSubmission(input);
    const identity = getIdentityFromRequest(request, config.identitySecret);
    const existing = await this.store.beginIdempotentRequest(submission.idempotencyKey);

    if (existing && existing !== "processing") {
      try {
        return {
          result: JSON.parse(existing) as Record<string, unknown>,
          cookie: identity.cookie,
          replayed: true,
        };
      } catch {
        await this.store.clearIdempotentRequest(submission.idempotencyKey);
      }
    } else if (existing === "processing") {
      throw new IdempotencyInProgressError();
    }

    try {
      const turnstileValid = await verifyTurnstileToken(
        submission.turnstileToken,
        config.turnstileSecret,
      );
      if (!turnstileValid) throw new TurnstileValidationError();

      const identityHash = hashIdentity(config.identitySecret, identity.identityId);
      const networkHash = hashNetworkAddress(
        config.identitySecret,
        getClientAddress(request),
      );
      const [ratePressure, duplicate] = await Promise.all([
        this.store.consumeRateLimits(identityHash, networkHash),
        this.store.markDuplicate(identityHash, submission.body),
      ]);
      const risk = assessCommentRisk({
        body: submission.body,
        duplicate,
        ratePressure,
        blockedTerms: config.blockedTerms,
      });

      if (risk.decision === "reject") {
        const result = {
          ok: true,
          state: "received",
          message: "Hemos recibido el comentario para revisión.",
          viewer: identity.viewer,
        };
        await this.store.completeIdempotentRequest(submission.idempotencyKey, result);
        return { result, cookie: identity.cookie, replayed: false };
      }

      const comment = await this.store.createComment({
        postSlug: slug,
        authorIdentityHash: identityHash,
        authorCode: identity.viewer.authorCode,
        avatar: identity.viewer.avatar,
        nickname: submission.nickname,
        body: submission.body,
        status: risk.decision === "publish" ? "published" : "pending",
        riskScore: risk.score,
      });
      const result = comment.status === "published"
        ? {
            ok: true,
            state: "published",
            message: "Comentario publicado.",
            comment: publicComment(comment, true),
            viewer: identity.viewer,
          }
        : {
            ok: true,
            state: "pending",
            message: "Comentario recibido y pendiente de revisión.",
            viewer: identity.viewer,
          };

      await this.store.completeIdempotentRequest(submission.idempotencyKey, result);

      if (comment.status === "pending") {
        await notifyOrQueue(
          this.store,
          comment,
          config.discordWebhookUrl,
          config.publicApiUrl,
        );
      } else {
        void retryQueuedNotifications(
          this.store,
          config.discordWebhookUrl,
          config.publicApiUrl,
        ).catch(() => undefined);
      }

      return { result, cookie: identity.cookie, replayed: false };
    } catch (error) {
      await this.store.clearIdempotentRequest(submission.idempotencyKey);
      throw error;
    }
  }

  async report(request: Request, id: string) {
    const config = getCommentsConfig();
    const identity = getIdentityFromRequest(request, config.identitySecret);
    const identityHash = hashIdentity(config.identitySecret, identity.identityId);
    const networkHash = hashNetworkAddress(
      config.identitySecret,
      getClientAddress(request),
    );
    await this.store.consumeReportLimit(identityHash, networkHash);
    const result = await this.store.reportComment(id, identityHash);

    if (result?.comment && !result.duplicate && result.thresholdCrossed) {
      await notifyOrQueue(
        this.store,
        result.comment,
        config.discordWebhookUrl,
        config.publicApiUrl,
      );
    }

    return {
      result: {
        ok: true,
        message: result?.duplicate
          ? "Ya habías denunciado este comentario."
          : "Gracias. Revisaremos el comentario.",
      },
      cookie: identity.cookie,
    };
  }

  async deleteOwn(request: Request, id: string) {
    const config = getCommentsConfig();
    const identity = getIdentityFromRequest(request, config.identitySecret);
    const identityHash = hashIdentity(config.identitySecret, identity.identityId);
    const deleted = await this.store.deleteOwnComment(id, identityHash);
    if (!deleted) throw new OwnCommentNotFoundError();

    return {
      result: {
        ok: true,
        message: "Comentario eliminado.",
      },
      cookie: identity.cookie,
    };
  }

  async editOwn(request: Request, id: string, input: unknown) {
    const config = getCommentsConfig();
    const edit = validateCommentEdit(input);
    const identity = getIdentityFromRequest(request, config.identitySecret);
    const identityHash = hashIdentity(config.identitySecret, identity.identityId);
    const ratePressure = await this.store.consumeEditLimit(identityHash);
    const risk = assessCommentRisk({
      body: edit.body,
      duplicate: false,
      ratePressure,
      blockedTerms: config.blockedTerms,
    });

    if (risk.decision === "reject") {
      throw new CommentEditRejectedError();
    }

    const comment = await this.store.updateOwnComment(id, identityHash, {
      body: edit.body,
      status: risk.decision === "publish" ? "published" : "pending",
      riskScore: risk.score,
    });
    if (!comment) throw new OwnCommentNotFoundError();

    if (comment.status === "pending") {
      await notifyOrQueue(
        this.store,
        comment,
        config.discordWebhookUrl,
        config.publicApiUrl,
      );
    }

    return {
      result: comment.status === "published"
        ? {
            ok: true,
            state: "published",
            message: "Comentario actualizado.",
            comment: publicComment(comment, true),
          }
        : {
            ok: true,
            state: "pending",
            message: "El cambio ha quedado pendiente de revisión.",
          },
      cookie: identity.cookie,
    };
  }

  get moderationStore() {
    return this.store;
  }
}

export { CommentRateLimitError };
