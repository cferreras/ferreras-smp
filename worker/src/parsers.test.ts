import assert from "node:assert/strict";
import { parseListResponse, parseTpsResponse, parseWorldDayResponse } from "./parsers.js";

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
assert.equal(parseWorldDayResponse("Current day count: 466"), 466);
assert.equal(parseWorldDayResponse("Timeline minecraft:day is at 1253 tick(s) TICKS!"), null);
assert.equal(parseWorldDayResponse("Respuesta rara"), null);
assert.equal(
  parseTpsResponse("[⚡] TPS from last 5s, 10s, 1m, 5m, 15m:[⚡]  20.0, *20.0, *20.0, *20.0, *20.0"),
  20,
);
assert.equal(parseTpsResponse("TPS: 19.84"), 19.84);
assert.equal(parseTpsResponse("No TPS here"), null);

console.info("Parser tests OK");
