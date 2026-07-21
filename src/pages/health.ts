import type { APIRoute } from "astro";

export const prerender = false;

export const GET = (() =>
  new Response(JSON.stringify({ ok: true, service: "minecraft-live-api" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })) satisfies APIRoute;
