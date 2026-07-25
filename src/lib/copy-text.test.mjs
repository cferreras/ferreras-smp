import assert from "node:assert/strict";
import { copyText } from "./copy-text.ts";

assert.equal(await copyText("mc.ferreras.dev", [async () => undefined]), true);
assert.equal(
  await copyText("mc.ferreras.dev", [async () => { throw new Error("blocked"); }, () => true]),
  true,
);
assert.equal(await copyText("mc.ferreras.dev", [() => false, () => false]), false);
