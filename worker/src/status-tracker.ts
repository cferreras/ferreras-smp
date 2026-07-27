import type { WorkerConfig } from "./config.js";
import type { MinecraftLogStateEvent, MinecraftStatus } from "./types.js";

export class MinecraftStatusTracker {
  private readonly players = new Map<string, string>();
  private online = false;
  private version: string | null = null;
  private worldDay: number | null = null;

  constructor(private readonly config: WorkerConfig) {}

  reset() {
    this.players.clear();
    this.online = false;
    this.version = null;
    this.worldDay = null;
  }

  apply(event: MinecraftLogStateEvent): boolean {
    switch (event.type) {
      case "server_starting":
        this.reset();
        this.version = event.version;
        return true;
      case "server_ready":
        this.online = true;
        return true;
      case "server_stopped":
        this.players.clear();
        this.online = false;
        return true;
      case "world_day":
        this.worldDay = event.day;
        return true;
      case "player_join":
        this.players.set(event.player.toLocaleLowerCase("en"), event.player);
        this.online = true;
        return true;
      case "player_leave":
        return this.players.delete(event.player.toLocaleLowerCase("en"));
    }
  }

  snapshot(): MinecraftStatus {
    const players = [...this.players.values()];

    return {
      online: this.online,
      host: this.config.minecraftHostPublic,
      playersOnline: players.length,
      maxPlayers: this.config.minecraftMaxPlayers,
      players,
      worldDay: this.worldDay,
      tps: null,
      mspt: null,
      version: this.version,
      lastUpdated: new Date().toISOString(),
    };
  }
}
