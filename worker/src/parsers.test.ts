import assert from "node:assert/strict";
import {
  parseActivityLogLine,
  parseListResponse,
  parseMinecraftLogLine,
  parsePerformanceResponse,
  parseTpsResponse,
  parseWorldDayResponse,
} from "./parsers.js";
import { MinecraftStatusTracker } from "./status-tracker.js";
import type { WorkerConfig } from "./config.js";

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
assert.deepEqual(
  parseMinecraftLogLine("[19:20:10] [Server thread/INFO]: Carlos joined the game").state,
  { type: "player_join", player: "Carlos" },
);
assert.deepEqual(
  parseMinecraftLogLine("[19:20:10] [Server thread/INFO]: Carlos se ha unido a la partida").state,
  { type: "player_join", player: "Carlos" },
);
assert.deepEqual(
  parseMinecraftLogLine("[19:20:09] [Server thread/INFO]: Done (4.120s)! For help, type \"help\"").state,
  { type: "server_ready" },
);
assert.deepEqual(
  parseMinecraftLogLine("[19:20:08] [Server thread/INFO]: Starting minecraft server version 1.21.8").state,
  { type: "server_starting", version: "1.21.8" },
);
assert.deepEqual(
  parseMinecraftLogLine("[19:30:00] [Server thread/INFO]: Stopping server").state,
  { type: "server_stopped" },
);
assert.deepEqual(
  parseMinecraftLogLine("[17:11:33] [Server thread/INFO]: ¡Un nuevo día comienza! Día 633.").state,
  { type: "world_day", day: 633 },
);
assert.deepEqual(
  parseMinecraftLogLine("[00:05:22] [Server thread/INFO]: A new day has begun! Day: 307").state,
  { type: "world_day", day: 307 },
);
assert.equal(
  parseActivityLogLine("[19:21:10] [Server thread/INFO]: Akawonder has made the advancement [Diamonds!]")?.message,
  "Akawonder consiguió Diamonds!",
);
assert.equal(
  parseActivityLogLine("[19:22:10] [Server thread/INFO]: Laura was blown up by Creeper")?.type,
  "death",
);
assert.equal(
  parseActivityLogLine("[19:22:10] [Server thread/INFO]: Laura murió por culpa de Creeper")?.type,
  "death",
);
assert.equal(parseActivityLogLine("[19:23:10] [Server thread/INFO]: Nothing interesting"), null);

const tracker = new MinecraftStatusTracker({
  redisUrl: "redis://example",
  rconHost: "minecraft",
  rconPort: 25_575,
  rconPassword: "secret",
  minecraftHostPublic: "mc.example.com",
  minecraftMaxPlayers: 20,
  rconConnectTimeoutMs: 5_000,
  rconCommandTimeoutMs: 5_000,
  minecraftLogPath: "/logs/latest.log",
} satisfies WorkerConfig);
tracker.apply({ type: "server_ready" });
tracker.apply({ type: "world_day", day: 633 });
tracker.apply({ type: "player_join", player: "Carlos" });
tracker.apply({ type: "player_join", player: "Akawonder" });
tracker.apply({ type: "player_leave", player: "Carlos" });
assert.deepEqual(
  {
    online: tracker.snapshot().online,
    worldDay: tracker.snapshot().worldDay,
    players: tracker.snapshot().players,
  },
  {
    online: true,
    worldDay: 633,
    players: ["Akawonder"],
  },
);

console.info("Parser tests OK");
