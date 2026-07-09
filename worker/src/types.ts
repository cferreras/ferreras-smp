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
