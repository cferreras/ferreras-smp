import type { MinecraftLiveSnapshot } from "../types/minecraft-live";

export const liveServerSnapshot: MinecraftLiveSnapshot = {
  status: {
    online: true,
    host: "mc.ferreras.dev",
    playersOnline: 2,
    maxPlayers: 20,
    players: ["Carlos", "Akawonder"],
    worldDay: 431,
    tps: 20.0,
    mspt: null,
    version: null,
    lastUpdated: "2026-07-09T10:00:00.000Z",
  },
  activity: [
    {
      id: "activity-1",
      type: "join",
      player: "Carlos",
      message: "Carlos ha entrado al servidor",
      createdAt: "2026-07-09T10:00:00.000Z",
    },
    {
      id: "activity-2",
      type: "advancement",
      player: "Akawonder",
      message: "Akawonder consiguió Diamantes",
      createdAt: "2026-07-09T09:54:00.000Z",
    },
    {
      id: "activity-3",
      type: "death",
      player: "Laura",
      message: "Laura murió por un Creeper",
      createdAt: "2026-07-09T09:39:00.000Z",
    },
    {
      id: "activity-4",
      type: "backup",
      message: "El servidor ha hecho backup correctamente",
      createdAt: "2026-07-09T09:18:00.000Z",
    },
  ],
};
