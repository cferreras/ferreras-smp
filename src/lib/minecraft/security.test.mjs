import assert from "node:assert/strict";
import {
  corsPreflightResponse,
  getClientIp,
  isAllowedOrigin,
  isJsonRequest,
  MAX_REQUEST_BODY_BYTES,
  serviceUnavailableResponse,
} from "./http.ts";
import { hashIp } from "./security.ts";

const request = (headers) => new Request("https://mc-api.ferreras.dev/api/minecraft/poll/vote", { headers });
const allowed = request({ origin: "https://mc.ferreras.dev", "content-type": "application/json; charset=utf-8" });
const denied = request({ origin: "https://example.invalid", "content-type": "text/plain" });

assert.equal(isAllowedOrigin(allowed), true);
assert.equal(isAllowedOrigin(denied), false);
assert.equal(isJsonRequest(allowed), true);
assert.equal(isJsonRequest(denied), false);
assert.equal(corsPreflightResponse(allowed).status, 204);
assert.equal(corsPreflightResponse(denied).status, 403);
assert.equal(MAX_REQUEST_BODY_BYTES, 8 * 1024);

assert.equal(
  getClientIp(request({ "cf-connecting-ip": "203.0.113.9" }), "127.0.0.1"),
  "203.0.113.9",
);
assert.equal(
  getClientIp(request({ "cf-connecting-ip": "invalid", "x-forwarded-for": "198.51.100.4" }), "127.0.0.1"),
  "127.0.0.1",
);

const originalNodeEnv = process.env.NODE_ENV;
const originalSalt = process.env.IP_HASH_SALT;

process.env.NODE_ENV = "production";
process.env.IP_HASH_SALT = "test-secret";
assert.equal(hashIp("203.0.113.9"), hashIp("203.0.113.9"));
assert.notEqual(hashIp("203.0.113.9"), hashIp("203.0.113.10"));

delete process.env.IP_HASH_SALT;
assert.throws(() => hashIp("203.0.113.9"), /IP_HASH_SALT/);

if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
else process.env.NODE_ENV = originalNodeEnv;
if (originalSalt === undefined) delete process.env.IP_HASH_SALT;
else process.env.IP_HASH_SALT = originalSalt;

assert.deepEqual(await serviceUnavailableResponse(new Error()).json(), {
  ok: false,
  error: "Servicio no disponible temporalmente",
});

console.log("Security checks OK");
