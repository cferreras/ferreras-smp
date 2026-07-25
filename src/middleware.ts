import { defineMiddleware } from "astro:middleware";

const API_PREFIXES = ["/api/minecraft", "/api/comments"];
const isApiOnly = import.meta.env.MINECRAFT_API_ONLY === "true";
const isProduction = import.meta.env.PROD;
const REQUIRED_CSP_DIRECTIVES = [
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
];

const addSecurityHeaders = (response: Response) => {
  const generatedCsp = response.headers.get("Content-Security-Policy");
  const directives = generatedCsp
    ?.split(";")
    .map((directive) => directive.trim())
    .filter(Boolean) ?? [];
  const directiveNames = new Set(
    directives.map((directive) => directive.split(/\s+/, 1)[0].toLowerCase()),
  );

  for (const directive of REQUIRED_CSP_DIRECTIVES) {
    const name = directive.split(/\s+/, 1)[0];
    if (!directiveNames.has(name)) {
      directives.push(directive);
    }
  }

  response.headers.set("Content-Security-Policy", directives.join("; "));
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );

  if (isProduction) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  }

  return response;
};

const json = (body: unknown, init: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...init.headers,
    },
  });

export const onRequest = defineMiddleware(async (context, next) => {
  if (!isApiOnly) {
    return addSecurityHeaders(await next());
  }

  const { pathname } = context.url;

  if (pathname === "/health") {
    return addSecurityHeaders(json({ ok: true, service: "minecraft-live-api" }, { status: 200 }));
  }

  if (API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return addSecurityHeaders(await next());
  }

  return addSecurityHeaders(json(
    {
      ok: false,
      error: "Esta instancia solo sirve la API de Minecraft Live.",
    },
    { status: 404 },
  ));
});
