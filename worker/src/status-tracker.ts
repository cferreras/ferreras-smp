import type { WorkerConfig } from "./config.js";
import type { MinecraftLogStateEvent, MinecraftStatus } from "./types.js";

export class MinecraftStatusTracker {
  private readonly players = new Map<string, string>();
  private online = false;
  private version: string | null = null;
  private worldDay: number | null = null;

  constructor(private readonly config: WorkerConfig) {}

  hydrate(status?: Partial<MinecraftStatus> | null) {
    if (!status) {
      return;
    }

    this.players.clear();

    if (Array.isArray(status.players)) {
      for (const player of status.players) {
        if (typeof player === "string" && player.trim()) {
          this.players.set(player.toLocaleLowerCase("en"), player);
        }
      }
    }

    if (typeof status.online === "boolean") {
      this.online = status.online;
    }

    if (typeof status.version === "string" && status.version.trim()) {
      this.version = status.version;
    }

    if (typeof status.worldDay === "number" && Number.isFinite(status.worldDay) && status.worldDay >= 0) {
      this.worldDay = status.worldDay;
    }
  }

  reset(options: { preserveWorldDay?: boolean; preserveVersion?: boolean } = {}) {
    const previousWorldDay = this.worldDay;
    const previousVersion = this.version;

    this.players.clear();
    this.online = false;
    this.version = options.preserveVersion ? previousVersion : null;
    this.worldDay = options.preserveWorldDay ? previousWorldDay : null;
  }

  apply(event: MinecraftLogStateEvent): boolean {
    switch (event.type) {
      case "server_starting":
        this.reset({ preserveWorldDay: true, preserveVersion: true });
        this.version = event.version ?? this.version;
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
        this.online = true;
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
