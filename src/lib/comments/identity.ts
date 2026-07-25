import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import {
  COMMENT_COOKIE_MAX_AGE,
  COMMENT_COOKIE_NAME,
  DEFAULT_SKINS,
} from "./constants.ts";
import type { ViewerIdentity } from "./types.ts";

const COOKIE_VERSION = "v1";
const PUBLIC_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const hmac = (secret: string, purpose: string, value: string) =>
  createHmac("sha256", secret).update(`${purpose}\0${value}`).digest();

const encodeSignature = (value: Buffer) => value.toString("base64url");

const signaturesMatch = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

export const createIdentityToken = (secret: string, identityId = randomBytes(16).toString("base64url")) => {
  const signature = encodeSignature(hmac(secret, "cookie", identityId));
  return `${COOKIE_VERSION}.${identityId}.${signature}`;
};

export const readIdentityToken = (secret: string, token: string | undefined) => {
  if (!token) return null;

  const [version, identityId, signature, extra] = token.split(".");
  if (version !== COOKIE_VERSION || !identityId || !signature || extra) return null;

  const expected = encodeSignature(hmac(secret, "cookie", identityId));
  return signaturesMatch(signature, expected) ? identityId : null;
};

export const deriveViewerIdentity = (secret: string, identityId: string): ViewerIdentity => {
  const digest = hmac(secret, "public-identity", identityId);
  let authorCode = "";

  for (let index = 0; index < 5; index += 1) {
    authorCode += PUBLIC_CODE_ALPHABET[digest[index] % PUBLIC_CODE_ALPHABET.length];
  }

  return {
    authorCode,
    avatar: DEFAULT_SKINS[digest[5] % DEFAULT_SKINS.length],
  };
};

export const hashNetworkAddress = (secret: string, address: string) =>
  hmac(secret, "network-rate-limit", address).toString("base64url");

export const hashIdentity = (secret: string, identityId: string) =>
  hmac(secret, "identity-rate-limit", identityId).toString("base64url");

export const parseCookies = (header: string | null) =>
  Object.fromEntries(
    (header ?? "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf("=");
        if (separator < 0) return [part, ""];
        return [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
      }),
  );

export const identityCookie = (token: string, secure: boolean) => [
  `${COMMENT_COOKIE_NAME}=${encodeURIComponent(token)}`,
  "Path=/api/comments",
  `Max-Age=${COMMENT_COOKIE_MAX_AGE}`,
  "HttpOnly",
  "SameSite=Lax",
  secure ? "Secure" : "",
].filter(Boolean).join("; ");

export const getIdentityFromRequest = (request: Request, secret: string) => {
  const token = parseCookies(request.headers.get("cookie"))[COMMENT_COOKIE_NAME];
  const existingId = readIdentityToken(secret, token);

  if (existingId) {
    return {
      identityId: existingId,
      cookie: undefined,
      viewer: deriveViewerIdentity(secret, existingId),
    };
  }

  const nextToken = createIdentityToken(secret);
  const identityId = readIdentityToken(secret, nextToken);
  if (!identityId) throw new Error("No se pudo crear la identidad anónima");

  return {
    identityId,
    cookie: identityCookie(nextToken, new URL(request.url).protocol === "https:"),
    viewer: deriveViewerIdentity(secret, identityId),
  };
};
