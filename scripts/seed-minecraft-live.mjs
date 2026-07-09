import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error("Missing REDIS_URL environment variable.");
  process.exit(1);
}

const keys = {
  status: "mc:status",
  activityRecent: "mc:activity:recent",
  pollVotes: "mc:poll:server-feedback:votes",
  pollMeta: "mc:poll:server-feedback:meta",
};

const now = "2026-07-09T10:00:00.000Z";

const status = {
  online: true,
  host: "mc.ferreras.dev",
  playersOnline: 2,
  maxPlayers: 20,
  players: ["Carlos", "Akawonder"],
  worldDay: 431,
  tps: 20.0,
  mspt: 12.4,
  version: "1.21.2",
  lastUpdated: now,
};

const activity = [
  {
    id: "evt_001",
    type: "join",
    player: "Carlos",
    message: "Carlos ha entrado al servidor",
    createdAt: now,
  },
  {
    id: "evt_002",
    type: "advancement",
    player: "Akawonder",
    message: "Akawonder consiguió Diamantes",
    createdAt: "2026-07-09T09:54:00.000Z",
  },
  {
    id: "evt_003",
    type: "death",
    player: "Laura",
    message: "Laura murió por un Creeper",
    createdAt: "2026-07-09T09:39:00.000Z",
  },
  {
    id: "evt_004",
    type: "backup",
    message: "El servidor ha hecho backup correctamente",
    createdAt: "2026-07-09T09:18:00.000Z",
  },
];

const votes = {
  great: 12,
  good: 8,
  improve: 6,
  issues: 2,
};

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,
});

try {
  const pipeline = redis.pipeline();

  pipeline.set(keys.status, JSON.stringify(status));
  pipeline.set(
    keys.pollMeta,
    JSON.stringify({
      id: "server-feedback",
      question: "¿Qué te parece el servidor?",
    }),
  );

  pipeline.del(keys.activityRecent);
  for (const event of [...activity].reverse()) {
    pipeline.lpush(keys.activityRecent, JSON.stringify(event));
  }
  pipeline.ltrim(keys.activityRecent, 0, 49);

  pipeline.del(keys.pollVotes);
  for (const [optionId, voteCount] of Object.entries(votes)) {
    pipeline.zincrby(keys.pollVotes, voteCount, optionId);
  }

  await pipeline.exec();
  console.log("Seeded Minecraft live data in Redis/DragonFly.");
} finally {
  redis.disconnect();
}
