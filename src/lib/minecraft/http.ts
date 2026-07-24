const ALLOWED_ORIGINS = new Set([
  "https://mc.ferreras.dev",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:4321",
  "http://127.0.0.1:4321",
  "http://100.104.46.124:4321",
]);

export const isAllowedOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  return Boolean(origin && ALLOWED_ORIGINS.has(origin));
};

export const corsHeaders = (request: Request): HeadersInit => {
  const origin = request.headers.get("origin");

  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return {
      Vary: "Origin",
    };
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    Vary: "Origin",
  };
};

export const corsPreflightResponse = (request: Request) =>
  new Response(null, {
    status: isAllowedOrigin(request) ? 204 : 403,
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

export const serviceUnavailableResponse = (_error: unknown, request?: Request) =>
  jsonResponse(
    {
      ok: false,
      error: "Servicio no disponible temporalmente",
    },
    { status: 503 },
    request,
  );
