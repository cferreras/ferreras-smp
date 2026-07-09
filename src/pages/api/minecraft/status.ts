import type { APIRoute } from "astro";
import {
  corsPreflightResponse,
  jsonResponse,
  serviceUnavailableResponse,
} from "../../../lib/minecraft/http";
import { minecraftLiveService } from "../../../lib/minecraft/minecraft-live-service";

export const prerender = false;

export const GET = (async ({ request }) => {
  try {
    return jsonResponse(await minecraftLiveService.getStatus(), {}, request);
  } catch (error) {
    return serviceUnavailableResponse(error, request);
  }
}) satisfies APIRoute;

export const OPTIONS = (({ request }) => corsPreflightResponse(request)) satisfies APIRoute;
