import assert from "node:assert/strict";
import { parseListResponse, parseWorldDayResponse } from "./parsers.js";

const twoPlayers = parseListResponse("There are 2 of a max of 20 players online: Carlos, Akawonder", 20);
assert.deepEqual(twoPlayers, {
  playersOnline: 2,
  maxPlayers: 20,
  players: ["Carlos", "Akawonder"],
});

const zeroPlayers = parseListResponse("There are 0 of a max of 20 players online:", 20);
assert.deepEqual(zeroPlayers, {
  playersOnline: 0,
  maxPlayers: 20,
  players: [],
});

assert.equal(parseListResponse("No entiendo esta respuesta", 20), null);
assert.equal(parseWorldDayResponse("The time is 431"), 431);
assert.equal(parseWorldDayResponse("Respuesta rara"), null);

console.info("Parser tests OK");
