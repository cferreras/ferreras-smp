import assert from "node:assert/strict";
import {
  createIdentityToken,
  deriveViewerIdentity,
  getIdentityFromRequest,
  readIdentityToken,
} from "./identity.ts";
import {
  commentsOptionsResponse,
  isAllowedCommentsOrigin,
} from "./http.ts";
import { assessCommentRisk } from "./risk.ts";
import {
  CommentRateLimitError,
  CommentStore,
  decodeCommentCursor,
  encodeCommentCursor,
} from "./store.ts";
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

const cursor = encodeCommentCursor({
  score: 1_753_440_000_000,
  id: "5391b648-7603-4a4b-9444-5a838de7253e",
});
assert.deepEqual(decodeCommentCursor(cursor), {
  score: 1_753_440_000_000,
  id: "5391b648-7603-4a4b-9444-5a838de7253e",
});
assert.equal(decodeCommentCursor("invalid"), null);

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

console.log("Comment security checks OK");
