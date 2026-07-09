import assert from "node:assert/strict";
import {
  parseActivityLogLine,
  parseListResponse,
  parsePerformanceResponse,
  parseTpsResponse,
  parseWorldDayResponse,
} from "./parsers.js";

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
assert.deepEqual(
  parsePerformanceResponse(
    "[TabTPS] Server Tick InformationTPS: 20.00 (5s), 20.00 (1m), 20.00 (5m), 20.00 (15m)MSPT - Average, Minimum, Maximum ├─ 5s - 0.89, 0.72, 1.67 ├─ 10s - 0.96, 0.72, 1.90 └─ 60s - 1.80, 0.72, 137.27",
  ),
  {
    tps: 20,
    mspt: 0.89,
  },
);
assert.equal(
  parseActivityLogLine("[19:20:10] [Server thread/INFO]: Carlos joined the game")?.message,
  "Carlos ha entrado al servidor",
);
assert.equal(
  parseActivityLogLine("[19:21:10] [Server thread/INFO]: Akawonder has made the advancement [Diamonds!]")?.message,
  "Akawonder consiguió Diamonds!",
);
assert.equal(
  parseActivityLogLine("[19:22:10] [Server thread/INFO]: Laura was blown up by Creeper")?.type,
  "death",
);
assert.equal(parseActivityLogLine("[19:23:10] [Server thread/INFO]: Nothing interesting"), null);

console.info("Parser tests OK");
