import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://mc.ferreras.dev",
  output: "static",
  adapter: vercel(),
});
