export type MinecraftStatus = {
  online: boolean;
  host: string;
  playersOnline: number;
  maxPlayers: number;
  players: string[];
  worldDay: number | null;
  tps: number | null;
  mspt?: number | null;
  version?: string | null;
  lastUpdated: string;
};

export type ListStatus = {
  playersOnline: number;
  maxPlayers: number | null;
  players: string[];
};

export type PerformanceStatus = {
  tps: number | null;
  mspt: number | null;
};

export type MinecraftActivityEventType =
  | "join"
  | "leave"
  | "death"
  | "advancement"
  | "backup"
  | "system";

export type MinecraftActivityEvent = {
  id: string;
  type: MinecraftActivityEventType;
  player?: string;
  message: string;
  createdAt: string;
};

export type MinecraftLogStateEvent =
  | { type: "server_starting"; version: string | null }
  | { type: "server_ready" }
  | { type: "server_stopped" }
  | { type: "world_day"; day: number }
  | { type: "player_join"; player: string }
  | { type: "player_leave"; player: string };

export type ParsedMinecraftLogLine = {
  activity: MinecraftActivityEvent | null;
  state: MinecraftLogStateEvent | null;
};
