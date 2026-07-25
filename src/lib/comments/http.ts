const LOCAL_ORIGINS = new Set([
  "http://localhost:4321",
  "http://127.0.0.1:4321",
]);

export const getAllowedCommentsOrigin = () =>
  process.env.COMMENTS_ALLOWED_ORIGIN?.trim() || "https://mc.ferreras.dev";

export const isAllowedCommentsOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === getAllowedCommentsOrigin() || LOCAL_ORIGINS.has(origin);
};
export const commentsCorsHeaders = (request: Request) => {
  const headers = new Headers({ Vary: "Origin" });
  const origin = request.headers.get("origin");

  if (origin && isAllowedCommentsOrigin(request)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept, X-Idempotency-Key",
    );
  }

  return headers;
};

export const commentsOptionsResponse = (request: Request) =>
  new Response(null, {
    status: isAllowedCommentsOrigin(request) ? 204 : 403,
    headers: commentsCorsHeaders(request),
  });

interface CommentsJsonOptions extends ResponseInit {
  cookie?: string;
  cache?: string;
}

export const commentsJsonResponse = (
  request: Request,
  body: unknown,
  { cookie, cache = "no-store", ...init }: CommentsJsonOptions = {},
) => {
  const headers = commentsCorsHeaders(request);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", cache);

  if (cookie) headers.append("Set-Cookie", cookie);
  if (init.headers) {
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  }

  return new Response(JSON.stringify(body), { ...init, headers });
};

export const commentsErrorResponse = (
  request: Request,
  status: number,
  error: string,
  options: CommentsJsonOptions = {},
) => commentsJsonResponse(request, { ok: false, error }, { ...options, status });

export const requireCommentsWriteOrigin = (request: Request) => {
  if (!isAllowedCommentsOrigin(request)) {
    throw new Response(null, { status: 403 });
  }
};
