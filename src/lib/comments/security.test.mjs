import assert from "node:assert/strict";
import {
  createIdentityToken,
  deriveViewerIdentity,
  getIdentityFromRequest,
  readIdentityToken,
} from "./identity.ts";
import {
  CommentsRequestError,
  commentsOptionsResponse,
  getTrustedClientAddress,
  isAllowedCommentsOrigin,
  readCommentsJson,
} from "./http.ts";
import { assessCommentRisk } from "./risk.ts";
import {
  CommentRateLimitError,
  CommentStore,
  decodeCommentCursor,
  encodeCommentCursor,
} from "./store.ts";
import { verifyTurnstileToken } from "./turnstile.ts";
import {
  CommentValidationError,
  normalizeCommentBody,
  normalizeNickname,
  validateCommentEdit,
  validateSubmission,
} from "./validation.ts";

const secret = "comments-test-secret-with-at-least-32-characters";
const token = createIdentityToken(secret, "fixed-identity");
const viewer = deriveViewerIdentity(secret, "fixed-identity");

assert.equal(readIdentityToken(secret, token), "fixed-identity");
assert.equal(readIdentityToken(secret, `${token}tampered`), null);
assert.deepEqual(deriveViewerIdentity(secret, "fixed-identity"), viewer);
assert.match(viewer.authorCode, /^[A-HJ-NP-Z2-9]{5}$/);

const request = new Request("https://mc-api.ferreras.dev/api/comments/example", {
  headers: { cookie: `ferreras_commenter=${encodeURIComponent(token)}` },
});
const identity = getIdentityFromRequest(request, secret);
assert.equal(identity.identityId, "fixed-identity");
assert.equal(identity.cookie, undefined);
assert.deepEqual(identity.viewer, viewer);
assert.doesNotThrow(() => getIdentityFromRequest(new Request(
  "https://mc-api.ferreras.dev/api/comments/example",
  { headers: { cookie: "ferreras_commenter=%E0%A4%A" } },
), secret));

assert.equal(normalizeNickname("  Jugador_7  "), "Jugador_7");
assert.throws(
  () => normalizeNickname("Admin"),
  (error) => error instanceof CommentValidationError && error.field === "nickname",
);
assert.throws(
  () => normalizeNickname("Jugador\u202e7"),
  (error) => error instanceof CommentValidationError,
);
assert.equal(
  normalizeCommentBody("<script>alert('xss')</script>"),
  "<script>alert('xss')</script>",
);
assert.throws(
  () => normalizeCommentBody(`Hola\u0000mundo`),
  (error) => error instanceof CommentValidationError && error.field === "body",
);

assert.deepEqual(validateSubmission({
  nickname: "Alex_2",
  body: "Una guía muy útil.",
  website: "",
  turnstileToken: "token",
  idempotencyKey: "abcdefghijklmnop",
}), {
  nickname: "Alex_2",
  body: "Una guía muy útil.",
  turnstileToken: "token",
  idempotencyKey: "abcdefghijklmnop",
});
assert.deepEqual(validateCommentEdit({
  body: "  Texto actualizado.  ",
}), {
  body: "Texto actualizado.",
});
assert.throws(
  () => validateCommentEdit({ body: "\u202e" }),
  (error) => error instanceof CommentValidationError && error.field === "body",
);

assert.equal(assessCommentRisk({
  body: "Gracias por la guía",
  duplicate: false,
  ratePressure: 0.2,
  blockedTerms: [],
}).decision, "publish");
assert.equal(assessCommentRisk({
  body: "Visita https://spam.invalid y https://spam2.invalid",
  duplicate: true,
  ratePressure: 1,
  blockedTerms: [],
}).decision, "reject");

const allowed = new Request("https://mc-api.ferreras.dev/api/comments/post", {
  headers: { origin: "https://mc.ferreras.dev" },
});
const denied = new Request("https://mc-api.ferreras.dev/api/comments/post", {
  headers: { origin: "https://example.invalid" },
});
assert.equal(isAllowedCommentsOrigin(allowed), true);
assert.equal(isAllowedCommentsOrigin(denied), false);
assert.equal(commentsOptionsResponse(allowed).status, 204);
assert.equal(commentsOptionsResponse(denied).status, 403);
assert.match(
  commentsOptionsResponse(allowed).headers.get("Access-Control-Allow-Methods") ?? "",
  /PATCH, DELETE/,
);

const previousNodeEnvironment = process.env.NODE_ENV;
process.env.NODE_ENV = "production";
assert.equal(isAllowedCommentsOrigin(new Request(
  "https://mc-api.ferreras.dev/api/comments/post",
  { headers: { origin: "http://localhost:4321" } },
)), false);
if (previousNodeEnvironment === undefined) {
  delete process.env.NODE_ENV;
} else {
  process.env.NODE_ENV = previousNodeEnvironment;
}

assert.deepEqual(
  await readCommentsJson(new Request(
    "https://mc-api.ferreras.dev/api/comments/post",
    {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ body: "Seguro" }),
    },
  )),
  { body: "Seguro" },
);
await assert.rejects(
  readCommentsJson(new Request(
    "https://mc-api.ferreras.dev/api/comments/post",
    {
      method: "POST",
      headers: { "Content-Type": "application/jsonp" },
      body: "{}",
    },
  )),
  (error) => error instanceof CommentsRequestError && error.status === 415,
);
await assert.rejects(
  readCommentsJson(new Request(
    "https://mc-api.ferreras.dev/api/comments/post",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "x".repeat(8 * 1024 + 1),
    },
  )),
  (error) => error instanceof CommentsRequestError && error.status === 413,
);

const forwardedRequest = new Request(
  "https://mc-api.ferreras.dev/api/comments/post",
  {
    headers: {
      "cf-connecting-ip": "203.0.113.8",
      "x-forwarded-for": "198.51.100.4",
    },
  },
);
assert.equal(getTrustedClientAddress(forwardedRequest, "192.0.2.10"), "203.0.113.8");
assert.equal(
  getTrustedClientAddress(new Request(
    "https://mc-api.ferreras.dev/api/comments/post",
    { headers: { "x-forwarded-for": "198.51.100.4" } },
  ), "192.0.2.10"),
  "192.0.2.10",
);
assert.equal(
  getTrustedClientAddress(new Request(
    "https://mc-api.ferreras.dev/api/comments/post",
    { headers: { "cf-connecting-ip": "not-an-ip" } },
  ), "not-an-ip"),
  "unknown",
);

let turnstileBody;
const validTurnstile = await verifyTurnstileToken(
  "valid-token",
  "secret",
  {
    remoteIp: "203.0.113.8",
    expectedAction: "blog-comment",
    expectedHostnames: ["mc.ferreras.dev"],
  },
  async (_url, init) => {
    turnstileBody = new URLSearchParams(init.body);
    return Response.json({
      success: true,
      action: "blog-comment",
      hostname: "mc.ferreras.dev",
    });
  },
);
assert.equal(validTurnstile, true);
assert.equal(turnstileBody.get("remoteip"), "203.0.113.8");
assert.equal(await verifyTurnstileToken(
  "valid-token",
  "secret",
  { expectedHostnames: ["mc.ferreras.dev"] },
  async () => Response.json({ success: true, hostname: "example.invalid" }),
), false);

const cursor = encodeCommentCursor({
  score: 1_753_440_000_000,
  id: "5391b648-7603-4a4b-9444-5a838de7253e",
});
assert.deepEqual(decodeCommentCursor(cursor), {
  score: 1_753_440_000_000,
  id: "5391b648-7603-4a4b-9444-5a838de7253e",
});
assert.equal(decodeCommentCursor("invalid"), null);
assert.equal(decodeCommentCursor("a".repeat(257)), null);

const reportLimitKeys = [];
const reportLimitStore = new CommentStore({
  eval: async (_script, _keys, key) => {
    reportLimitKeys.push(key);
    return key.includes(":network:") ? [11, 120] : [1, 120];
  },
});
await assert.rejects(
  reportLimitStore.consumeReportLimit("identity-hash", "network-hash"),
  (error) => error instanceof CommentRateLimitError && error.retryAfter === 120,
);
assert.deepEqual(reportLimitKeys, [
  "comments:rate:report:identity:day:identity-hash",
  "comments:rate:report:network:day:network-hash",
]);

let paginationEntries = [
  { id: "a", score: 1 },
  { id: "b", score: 2 },
  { id: "c", score: 3 },
  { id: "d", score: 4 },
];
const withScores = (entries) =>
  entries.flatMap(({ id, score }) => [id, String(score)]);
const paginationStore = new CommentStore({
  zrange: async (_key, start, end) =>
    withScores(paginationEntries.slice(start, end + 1)),
  zrangebyscore: async (_key, min, max, ...options) => {
    const exclusive = String(min).startsWith("(");
    const minimum = Number.parseFloat(String(min).replace("(", ""));
    const maximum = max === "+inf" ? Number.POSITIVE_INFINITY : Number(max);
    let entries = paginationEntries.filter(({ score }) =>
      (exclusive ? score > minimum : score >= minimum) && score <= maximum
    );
    const limitIndex = options.indexOf("LIMIT");
    if (limitIndex >= 0) {
      const offset = Number(options[limitIndex + 1]);
      const count = Number(options[limitIndex + 2]);
      entries = entries.slice(offset, offset + count);
    }
    return withScores(entries);
  },
  hgetall: async (_key) => ({
    postSlug: "post",
    authorIdentityHash: "viewer",
    authorCode: "ABCDE",
    avatar: "steve",
    nickname: "Jugador",
    body: "Comentario",
    status: "published",
    riskScore: "0",
    createdAt: new Date().toISOString(),
    editedAt: "",
    moderatedAt: "",
    moderationReason: "",
    reportCount: "0",
  }),
  zcard: async () => paginationEntries.length,
});
const firstPage = await paginationStore.listPublished("post", null, 2, "viewer");
assert.deepEqual(firstPage.comments.map(({ id }) => id), ["a", "b"]);
paginationEntries = paginationEntries.filter(({ id }) => id !== "a");
const secondPage = await paginationStore.listPublished(
  "post",
  firstPage.nextCursor,
  2,
  "viewer",
);
assert.deepEqual(secondPage.comments.map(({ id }) => id), ["c", "d"]);

const moderationToken = "a".repeat(32);
let moderationAvailable = true;
const moderationStore = new CommentStore({
  get: async () => JSON.stringify({
    commentId: "5391b648-7603-4a4b-9444-5a838de7253e",
    action: "approve",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  }),
  hgetall: async () => ({
    postSlug: "post",
    authorIdentityHash: "viewer",
    authorCode: "ABCDE",
    avatar: "steve",
    nickname: "Jugador",
    body: "Comentario",
    status: "pending",
    riskScore: "5",
    createdAt: new Date().toISOString(),
    editedAt: "",
    moderatedAt: "",
    moderationReason: "",
    reportCount: "0",
  }),
  eval: async () => {
    if (!moderationAvailable) return 0;
    moderationAvailable = false;
    return 1;
  },
});
const moderationResults = await Promise.all([
  moderationStore.moderateCommentWithToken(moderationToken),
  moderationStore.moderateCommentWithToken(moderationToken),
]);
assert.equal(moderationResults.filter(Boolean).length, 1);
assert.equal(moderationResults.find(Boolean)?.status, "published");

const blockedOwnerEditStore = new CommentStore({
  hgetall: async () => ({
    postSlug: "post",
    authorIdentityHash: "viewer",
    authorCode: "ABCDE",
    avatar: "steve",
    nickname: "Jugador",
    body: "Comentario",
    status: "published",
    riskScore: "0",
    createdAt: new Date().toISOString(),
    editedAt: "",
    moderatedAt: "",
    moderationReason: "",
    reportCount: "0",
  }),
  eval: async () => 0,
});
assert.equal(await blockedOwnerEditStore.updateOwnComment(
  "5391b648-7603-4a4b-9444-5a838de7253e",
  "viewer",
  { body: "Intento tardío", status: "published", riskScore: 0 },
), null);
assert.equal(
  await blockedOwnerEditStore.createModerationTokens(
    "5391b648-7603-4a4b-9444-5a838de7253e",
  ),
  null,
);

console.log("Comment security checks OK");
