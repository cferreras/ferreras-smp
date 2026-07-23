const MINECRAFT_HEAD_API_URL = "https://minotar.net/avatar";

export const STEVE_AVATAR_URL = `${MINECRAFT_HEAD_API_URL}/MHF_Steve/64`;

export const getPlayerAvatarUrl = (player: string) =>
  `${MINECRAFT_HEAD_API_URL}/${encodeURIComponent(player)}/64`;
