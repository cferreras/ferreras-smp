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
  CommentValidationError,
  normalizeCommentBody,
  normalizeNickname,
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

console.log("Comment security checks OK");
