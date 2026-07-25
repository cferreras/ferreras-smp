import type { APIRoute } from "astro";
import { MissingRedisUrlError } from "../../../../lib/redis";
import { MissingCommentsConfigError } from "../../../../lib/comments/config";
import {
  commentsErrorResponse,
  commentsJsonResponse,
  commentsOptionsResponse,
  requireCommentsWriteOrigin,
} from "../../../../lib/comments/http";
import {
  CommentRateLimitError,
  CommentsService,
} from "../../../../lib/comments/service";

export const prerender = false;

const service = new CommentsService();
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const POST = (async ({ params, request }) => {
  try {
    requireCommentsWriteOrigin(request);
    const id = params.id ?? "";
    if (!ID_PATTERN.test(id)) {
      return commentsErrorResponse(request, 404, "Comentario no encontrado.");
    }

    const response = await service.report(request, id);
    return commentsJsonResponse(request, response.result, { cookie: response.cookie });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof MissingCommentsConfigError || error instanceof MissingRedisUrlError) {
      return commentsErrorResponse(
        request,
        503,
        "No pudimos registrar la denuncia temporalmente.",
      );
    }
    if (error instanceof CommentRateLimitError) {
      return commentsErrorResponse(
        request,
        429,
        "Has enviado varias denuncias seguidas. Espera antes de continuar.",
        { headers: { "Retry-After": String(Math.max(error.retryAfter, 1)) } },
      );
    }

    console.error("Comment report error", error);
    return commentsErrorResponse(
      request,
      503,
      "No pudimos registrar la denuncia temporalmente.",
    );
  }
}) satisfies APIRoute;

export const OPTIONS = (({ request }) => commentsOptionsResponse(request)) satisfies APIRoute;
