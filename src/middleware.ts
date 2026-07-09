import { defineMiddleware } from "astro:middleware";

const API_PREFIX = "/api/minecraft";
const isApiOnly = import.meta.env.MINECRAFT_API_ONLY === "true";

const json = (body: unknown, init: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...init.headers,
    },
  });

export const onRequest = defineMiddleware((context, next) => {
  if (!isApiOnly) {
    return next();
  }

  const { pathname } = context.url;

  if (pathname === "/health") {
    return json({ ok: true, service: "minecraft-live-api" }, { status: 200 });
  }

  if (pathname === API_PREFIX || pathname.startsWith(`${API_PREFIX}/`)) {
    return next();
  }

  return json(
    {
      ok: false,
      error: "Esta instancia solo sirve la API de Minecraft Live.",
    },
    { status: 404 },
  );
});
