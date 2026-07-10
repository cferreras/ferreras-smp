import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL("sitemap-index.xml", site ?? "https://mc.ferreras.dev");
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl.href}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
