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
