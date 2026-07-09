const ALLOWED_ORIGINS = new Set([
  "https://mc.ferreras.dev",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:4321",
  "http://127.0.0.1:4321",
]);

export const corsHeaders = (request: Request): HeadersInit => {
  const origin = request.headers.get("origin");

  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return {
      Vary: "Origin",
    };
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    Vary: "Origin",
  };
};

export const corsPreflightResponse = (request: Request) =>
  new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });

export const jsonResponse = (body: unknown, init: ResponseInit = {}, request?: Request) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...(request ? corsHeaders(request) : {}),
      ...init.headers,
    },
  });

export const getClientIp = (request: Request): string => {
  const cloudflareIp = request.headers.get("cf-connecting-ip");
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const requestWithIp = request as Request & { ip?: string };

  return (
    cloudflareIp?.trim() ||
    realIp?.trim() ||
    forwardedFor?.split(",")[0]?.trim() ||
    requestWithIp.ip ||
    "unknown"
  );
};

export const serviceUnavailableResponse = (error: unknown, request?: Request) =>
  jsonResponse(
    {
      ok: false,
      error:
        error instanceof Error && error.name === "MissingRedisUrlError"
          ? "REDIS_URL no configurada"
          : "DragonFly/Redis no disponible temporalmente",
    },
    { status: 503 },
    request,
  );
