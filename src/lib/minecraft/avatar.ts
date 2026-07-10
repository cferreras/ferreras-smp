const MINECRAFT_HEAD_API_URL = "https://api.mcheads.org/head";

export const STEVE_AVATAR_URL = `${MINECRAFT_HEAD_API_URL}/MHF_Steve/64`;

export const getPlayerAvatarUrl = (player: string) =>
  `${MINECRAFT_HEAD_API_URL}/${encodeURIComponent(player)}/64`;
