import type { APIRoute } from "astro";
import { MissingCommentsConfigError } from "../../../../lib/comments/config";
import {
  commentsErrorResponse,
  commentsJsonResponse,
  commentsOptionsResponse,
  requireCommentsWriteOrigin,
} from "../../../../lib/comments/http";
import {
  CommentEditRejectedError,
  CommentRateLimitError,
  CommentsService,
  OwnCommentNotFoundError,
} from "../../../../lib/comments/service";
import { CommentValidationError } from "../../../../lib/comments/validation";
import { MissingRedisUrlError } from "../../../../lib/redis";

export const prerender = false;

const service = new CommentsService();
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validId = (request: Request, id: string) =>
  ID_PATTERN.test(id)
    ? null
    : commentsErrorResponse(request, 404, "Comentario no encontrado.");

const errorResponse = (request: Request, error: unknown) => {
  if (error instanceof Response) return error;
  if (error instanceof OwnCommentNotFoundError) {
    return commentsErrorResponse(request, 404, "Comentario no encontrado.");
  }
  if (error instanceof CommentValidationError) {
    return commentsJsonResponse(
      request,
      { ok: false, error: error.message, field: error.field },
      { status: 400 },
    );
  }
  if (error instanceof CommentEditRejectedError) {
    return commentsErrorResponse(
      request,
      400,
      "No pudimos guardar ese texto. Revisa el contenido e inténtalo de nuevo.",
    );
  }
  if (error instanceof CommentRateLimitError) {
    return commentsErrorResponse(
      request,
      429,
      "Has realizado varios cambios seguidos. Espera un poco antes de continuar.",
      { headers: { "Retry-After": String(Math.max(error.retryAfter, 1)) } },
    );
  }
  if (error instanceof MissingCommentsConfigError || error instanceof MissingRedisUrlError) {
    return commentsErrorResponse(
      request,
      503,
      "No pudimos modificar el comentario temporalmente.",
    );
  }

  console.error("Own comment mutation error", error);
  return commentsErrorResponse(
    request,
    503,
    "No pudimos modificar el comentario temporalmente.",
  );
};

export const PATCH = (async ({ params, request }) => {
  try {
    requireCommentsWriteOrigin(request);
    const id = params.id ?? "";
    const invalid = validId(request, id);
    if (invalid) return invalid;

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

    const response = await service.editOwn(request, id, body);
    return commentsJsonResponse(request, response.result, { cookie: response.cookie });
  } catch (error) {
    return errorResponse(request, error);
  }
}) satisfies APIRoute;

export const DELETE = (async ({ params, request }) => {
  try {
    requireCommentsWriteOrigin(request);
    const id = params.id ?? "";
    const invalid = validId(request, id);
    if (invalid) return invalid;

    const response = await service.deleteOwn(request, id);
    return commentsJsonResponse(request, response.result, { cookie: response.cookie });
  } catch (error) {
    return errorResponse(request, error);
  }
}) satisfies APIRoute;

export const OPTIONS = (({ request }) => commentsOptionsResponse(request)) satisfies APIRoute;
