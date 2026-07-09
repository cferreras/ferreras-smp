import type { APIRoute } from "astro";
import {
  corsPreflightResponse,
  getClientIp,
  jsonResponse,
  serviceUnavailableResponse,
} from "../../../../lib/minecraft/http";
import { pollService } from "../../../../lib/minecraft/poll-service";

export const prerender = false;

type VoteRequestBody = {
  optionId?: unknown;
};

export const POST = (async ({ request }) => {
  let body: VoteRequestBody;

  try {
    body = (await request.json()) as VoteRequestBody;
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: "JSON no válido",
      },
      { status: 400 },
      request,
    );
  }

  if (typeof body.optionId !== "string") {
    return jsonResponse(
      {
        ok: false,
        error: "Falta optionId",
      },
      { status: 400 },
      request,
    );
  }

  let result;

  try {
    result = await pollService.vote(body.optionId, getClientIp(request));
  } catch (error) {
    return serviceUnavailableResponse(error, request);
  }

  if (!result.ok) {
    return jsonResponse(
      {
        ok: false,
        error: result.error,
      },
      { status: result.status },
      request,
    );
  }

  return jsonResponse(
    {
      ok: true,
      poll: result.poll,
    },
    {},
    request,
  );
}) satisfies APIRoute;

export const OPTIONS = (({ request }) => corsPreflightResponse(request)) satisfies APIRoute;
