export const COMMENT_COOKIE_NAME = "ferreras_commenter";
export const COMMENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
export const COMMENT_BODY_MAX_LENGTH = 800;
export const COMMENT_NICKNAME_MAX_LENGTH = 16;
export const COMMENT_NICKNAME_MIN_LENGTH = 2;
export const COMMENT_PAGE_DEFAULT = 20;
export const COMMENT_PAGE_MAX = 50;

export const DEFAULT_SKINS = [
  "steve",
  "alex",
  "noor",
  "sunny",
  "ari",
  "zuri",
  "makena",
  "kai",
  "efe",
] as const;

export type DefaultSkin = (typeof DEFAULT_SKINS)[number];

export const DEFAULT_SKIN_LABELS: Record<DefaultSkin, string> = {
  steve: "Steve",
  alex: "Alex",
  noor: "Noor",
  sunny: "Sunny",
  ari: "Ari",
  zuri: "Zuri",
  makena: "Makena",
  kai: "Kai",
  efe: "Efe",
};
