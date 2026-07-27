const MINECRAFT_HEAD_API_URL = "https://minotar.net/avatar";

export const STEVE_AVATAR_URL = "/images/comment-avatars/steve.png";

export const getPlayerAvatarUrl = (player: string) =>
  `${MINECRAFT_HEAD_API_URL}/${encodeURIComponent(player)}/64`;
