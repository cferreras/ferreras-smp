interface TurnstileResponse {
  success?: boolean;
  "error-codes"?: string[];
}

export const verifyTurnstileToken = async (
  token: string,
  secret: string,
  fetcher: typeof fetch = fetch,
) => {
  const body = new URLSearchParams({
    secret,
    response: token,
  });
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
  return result.success === true;
};
