interface TurnstileResponse {
  success?: boolean;
  "error-codes"?: string[];
  action?: string;
  hostname?: string;
}

export const verifyTurnstileToken = async (
  token: string,
  secret: string,
  {
    remoteIp,
    expectedAction,
    expectedHostnames = [],
  }: {
    remoteIp?: string;
    expectedAction?: string;
    expectedHostnames?: string[];
  } = {},
  fetcher: typeof fetch = fetch,
) => {
  if (!token || token.length > 2_048) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

  const response = await fetcher(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(6_000),
    },
  );

  if (!response.ok) return false;
  const result = await response.json() as TurnstileResponse;
  return result.success === true
    && (!expectedAction || result.action === expectedAction)
    && (
      expectedHostnames.length === 0
      || Boolean(result.hostname && expectedHostnames.includes(result.hostname))
    );
};
