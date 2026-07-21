import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

const isNodeAdapter = process.env.ASTRO_ADAPTER === "node" || process.env.npm_lifecycle_event === "build:dokploy";

export default defineConfig({
  site: "https://mc.ferreras.dev",
  output: "server",
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
