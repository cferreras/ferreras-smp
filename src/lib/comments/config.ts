export class MissingCommentsConfigError extends Error {
  constructor(name: string) {
    super(`Missing ${name} environment variable`);
    this.name = "MissingCommentsConfigError";
  }
}

const required = (name: string, minimumLength = 1) => {
  const value = process.env[name]?.trim();
  if (!value || value.length < minimumLength) throw new MissingCommentsConfigError(name);
  return value;
};

export const getCommentsConfig = () => ({
  identitySecret: required("COMMENTS_IDENTITY_SECRET", 32),
  turnstileSecret: required("TURNSTILE_SECRET_KEY"),
  discordWebhookUrl: required("COMMENTS_DISCORD_WEBHOOK_URL"),
  publicApiUrl: process.env.COMMENTS_PUBLIC_API_URL?.trim() || "https://mc-api.ferreras.dev",
  allowedOrigin: process.env.COMMENTS_ALLOWED_ORIGIN?.trim() || "https://mc.ferreras.dev",
  blockedTerms: (process.env.COMMENTS_BLOCKED_TERMS ?? "")
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean),
});
