import assert from "node:assert/strict";
import { getLiveFailureFeedback } from "./live-feedback.ts";

assert.deepEqual(getLiveFailureFeedback(""), {
  state: "error",
  message: "Estado no disponible temporalmente",
});
assert.deepEqual(getLiveFailureFeedback("22:15"), {
  state: "stale",
  message: "Sin conexión · Últimos datos 22:15",
});
