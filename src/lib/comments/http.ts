import { isIP } from "node:net";

const LOCAL_ORIGINS = new Set([
  "http://localhost:4321",
  "http://127.0.0.1:4321",
]);
const COMMENTS_JSON_BODY_LIMIT = 8 * 1024;

export class CommentsRequestError extends Error {
  readonly status: number;

  constructor(
    status: number,
    message: string,
  ) {
    super(message);
    this.name = "CommentsRequestError";
    this.status = status;
  }
}

export const getAllowedCommentsOrigin = () =>
  process.env.COMMENTS_ALLOWED_ORIGIN?.trim() || "https://mc.ferreras.dev";

export const isAllowedCommentsOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === getAllowedCommentsOrigin()
    || (process.env.NODE_ENV !== "production" && LOCAL_ORIGINS.has(origin));
};

export const getTrustedClientAddress = (
  _request: Request,
  trustedRuntimeAddress?: string,
) => {
  const serverAddress = trustedRuntimeAddress?.trim();
  return serverAddress && isIP(serverAddress) ? serverAddress : "unknown";
};

export const readCommentsJson = async (
  request: Request,
  maximumBytes = COMMENTS_JSON_BODY_LIMIT,
) => {
  const mediaType = request.headers.get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();

  if (mediaType !== "application/json") {
    throw new CommentsRequestError(415, "El formato de la solicitud no es válido.");
  }

  const declaredLength = request.headers.get("content-length");
  if (
    declaredLength
    && /^\d+$/.test(declaredLength)
    && Number.parseInt(declaredLength, 10) > maximumBytes
  ) {
    throw new CommentsRequestError(413, "El comentario es demasiado grande.");
  }

  if (!request.body) {
    throw new CommentsRequestError(400, "La solicitud no contiene JSON válido.");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    totalBytes += value.byteLength;
    if (totalBytes > maximumBytes) {
      await reader.cancel();
      throw new CommentsRequestError(413, "El comentario es demasiado grande.");
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body)) as unknown;
  } catch {
    throw new CommentsRequestError(400, "La solicitud no contiene JSON válido.");
  }
};

export const commentsCorsHeaders = (request: Request) => {
  const headers = new Headers({ Vary: "Origin" });
  const origin = request.headers.get("origin");

  if (origin && isAllowedCommentsOrigin(request)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
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
