import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getBlogPostPath, getPublishedBlogPosts } from "../lib/blog";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site ?? new URL("https://mc.ferreras.dev");
  const posts = await getPublishedBlogPosts();

  return rss({
    title: "Blog de Ferreras SMP",
    description: "Guías de Minecraft Java, survival, servidores y comunidad.",
    site: siteUrl,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: new URL(getBlogPostPath(post), siteUrl).href,
      author: post.data.author,
      categories: post.data.tags,
    })),
    customData: "<language>es</language>",
  });
};
