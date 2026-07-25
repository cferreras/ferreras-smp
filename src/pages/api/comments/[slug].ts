import type { APIRoute } from "astro";
import { MissingRedisUrlError } from "../../../lib/redis";
import { MissingCommentsConfigError } from "../../../lib/comments/config";
import {
  commentsErrorResponse,
  commentsJsonResponse,
  commentsOptionsResponse,
  requireCommentsWriteOrigin,
} from "../../../lib/comments/http";
import {
  CommentRateLimitError,
  CommentsService,
  IdempotencyInProgressError,
  TurnstileValidationError,
  UnknownBlogPostError,
} from "../../../lib/comments/service";
import { CommentValidationError } from "../../../lib/comments/validation";

export const prerender = false;

const service = new CommentsService();

const errorResponse = (request: Request, error: unknown, cookie?: string) => {
  if (error instanceof Response) return error;
  if (error instanceof UnknownBlogPostError) {
    return commentsErrorResponse(request, 404, "Artículo no encontrado.", { cookie });
  }
  if (error instanceof CommentValidationError) {
    return commentsJsonResponse(
      request,
      { ok: false, error: error.message, field: error.field },
      { status: 400, cookie },
    );
  }
  if (error instanceof TurnstileValidationError) {
    return commentsErrorResponse(
      request,
      400,
      "No pudimos validar la comprobación anti-spam. Inténtalo de nuevo.",
      { cookie },
    );
  }
  if (error instanceof IdempotencyInProgressError) {
    return commentsErrorResponse(
      request,
      409,
      "El comentario todavía se está procesando.",
      { cookie },
    );
  }
  if (error instanceof CommentRateLimitError) {
    return commentsErrorResponse(
      request,
      429,
      "Has enviado varios comentarios seguidos. Espera un poco antes de continuar.",
      {
        cookie,
        headers: { "Retry-After": String(Math.max(error.retryAfter, 1)) },
      },
    );
  }
  if (error instanceof MissingCommentsConfigError || error instanceof MissingRedisUrlError) {
    return commentsErrorResponse(
      request,
      503,
      "Los comentarios no están disponibles temporalmente.",
      { cookie },
    );
  }

  console.error("Comments API error", error);
  return commentsErrorResponse(
    request,
    503,
    "Los comentarios no están disponibles temporalmente.",
    { cookie },
  );
};

export const GET = (async ({ params, request, url }) => {
  try {
    const slug = params.slug ?? "";
    const requestedLimit = url.searchParams.has("limit")
      ? Number.parseInt(url.searchParams.get("limit") ?? "", 10)
      : null;
    const result = await service.list(
      request,
      slug,
      url.searchParams.get("cursor"),
      Number.isFinite(requestedLimit) ? requestedLimit : null,
    );

    return commentsJsonResponse(
      request,
      {
        ok: true,
        comments: result.comments,
        nextCursor: result.nextCursor,
        count: result.count,
        viewer: result.viewer,
      },
      {
        cookie: result.cookie,
        cache: "private, max-age=0, must-revalidate",
      },
    );
  } catch (error) {
    return errorResponse(request, error);
  }
}) satisfies APIRoute;

export const POST = (async ({ params, request }) => {
  try {
    requireCommentsWriteOrigin(request);

    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return commentsErrorResponse(request, 415, "El formato de la solicitud no es válido.");
    }

    const declaredLength = Number.parseInt(request.headers.get("content-length") ?? "0", 10);
    if (declaredLength > 8 * 1024) {
      return commentsErrorResponse(request, 413, "El comentario es demasiado grande.");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return commentsErrorResponse(request, 400, "La solicitud no contiene JSON válido.");
    }

    const submission = await service.submit(request, params.slug ?? "", body);
    return commentsJsonResponse(request, submission.result, {
      status: submission.replayed ? 200 : 201,
      cookie: submission.cookie,
    });
  } catch (error) {
    return errorResponse(request, error);
  }
}) satisfies APIRoute;

export const OPTIONS = (({ request }) => commentsOptionsResponse(request)) satisfies APIRoute;
