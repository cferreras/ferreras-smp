import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

const isNodeAdapter = process.env.ASTRO_ADAPTER === "node" || process.env.npm_lifecycle_event === "build:dokploy";

export default defineConfig({
  site: "https://mc.ferreras.dev",
  output: "server",
  markdown: {
    syntaxHighlight: false,
  },
  security: {
    allowedDomains: [
      { protocol: "https", hostname: "mc.ferreras.dev" },
      { protocol: "https", hostname: "mc-api.ferreras.dev" },
    ],
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "img-src 'self' data: https://minotar.net",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://mc-api.ferreras.dev https://challenges.cloudflare.com https://plausible.carlosferreras.com https://www.google-analytics.com https://region1.google-analytics.com",
        "frame-src https://challenges.cloudflare.com",
        "worker-src 'self' blob:",
      ],
      styleDirective: {
        resources: ["'self'", "https://fonts.googleapis.com"],
      },
      scriptDirective: {
        resources: [
          "'self'",
          "https://challenges.cloudflare.com",
          "https://plausible.carlosferreras.com",
          "https://www.googletagmanager.com",
        ],
      },
    },
  },
  adapter: isNodeAdapter
    ? node({ mode: "standalone", bodySizeLimit: 8 * 1024 })
    : vercel({ imageService: true }),
  integrations: [
    sitemap({
      namespaces: {
        news: false,
        video: false,
        xhtml: false,
      },
    }),
  ],
});
