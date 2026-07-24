import assert from "node:assert/strict";
import {
  corsPreflightResponse,
  isAllowedOrigin,
  serviceUnavailableResponse,
} from "./http.ts";

const request = (headers) => new Request("https://mc-api.ferreras.dev/api/minecraft/live", { headers });
const allowed = request({ origin: "https://mc.ferreras.dev" });
const denied = request({ origin: "https://example.invalid" });

assert.equal(isAllowedOrigin(allowed), true);
assert.equal(isAllowedOrigin(denied), false);
assert.equal(corsPreflightResponse(allowed).status, 204);
assert.equal(corsPreflightResponse(denied).status, 403);

assert.deepEqual(await serviceUnavailableResponse(new Error()).json(), {
  ok: false,
  error: "Servicio no disponible temporalmente",
});

console.log("Security checks OK");
