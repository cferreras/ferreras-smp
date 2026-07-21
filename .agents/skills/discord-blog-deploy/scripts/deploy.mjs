import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../../", import.meta.url));
const deployRef = "refs/ferreras-smp/last-discord-blog-deploy";
const git = (args, cwd = root, input) => execFileSync("git", args, { cwd, encoding: "utf8", input }).trim();

const tryGit = (args, cwd = root) => {
  try { return git(args, cwd); } catch { return undefined; }
};

const addedBlogFiles = (base, head = "HEAD", cwd = root) => git([
  "diff", "--name-only", "--diff-filter=A", "-z", base, head, "--", "src/content/blog",
], cwd).split("\0").filter((file) => /\.(?:md|mdx)$/.test(file));

const scalar = (value) => {
  const trimmed = value.trim();
  if (trimmed.startsWith('"')) return JSON.parse(trimmed);
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1).replaceAll("''", "'");
  return trimmed;
};

const parsePost = (source) => {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  if (!frontmatter) throw new Error("frontmatter ausente");
  const field = (name) => {
    const value = frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, "m"))?.[1];
    if (!value) throw new Error(`${name} ausente`);
    return scalar(value);
  };
  return { title: field("title"), description: field("description"), draft: /^draft:\s*true\s*$/m.test(frontmatter) };
};

const formatMessage = ({ title, description }, slug) => {
  const safeTitle = title.replaceAll("[", "\\[").replaceAll("]", "\\]");
  const prefix = `[${safeTitle}](https://mc.ferreras.dev/blog/${slug})\n\n`;
  const available = 2000 - prefix.length;
  const body = description.length <= available ? description : `${description.slice(0, available - 1).trimEnd()}…`;
  return `${prefix}${body}`;
};

const announcements = (files, cwd = root) => files.flatMap((file) => {
  const post = parsePost(readFileSync(path.join(cwd, file), "utf8"));
  if (post.draft) return [];
  const slug = path.relative("src/content/blog", file).replace(/\.(?:md|mdx)$/, "").split(path.sep).map(encodeURIComponent).join("/");
  return [{ file, message: formatMessage(post, slug) }];
});

const webhookUrl = () => {
  if (!process.env.DISCORD_BLOG_WEBHOOK_URL && existsSync(path.join(root, ".env.local"))) process.loadEnvFile(path.join(root, ".env.local"));
  const value = process.env.DISCORD_BLOG_WEBHOOK_URL;
  if (!value) throw new Error("falta DISCORD_BLOG_WEBHOOK_URL");
  const url = new URL(value);
  const hosts = new Set(["discord.com", "canary.discord.com", "ptb.discord.com", "discordapp.com"]);
  if (url.protocol !== "https:" || !hosts.has(url.hostname) || !/^\/api(?:\/v\d+)?\/webhooks\/\d+\/[^/]+\/?$/.test(url.pathname)) {
    throw new Error("DISCORD_BLOG_WEBHOOK_URL no es un webhook oficial válido");
  }
  return value;
};

const notify = async (items) => {
  if (!items.length) return;
  const url = webhookUrl();
  for (const item of items) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: item.message, allowed_mentions: { parse: [] } }),
    });
    if (!response.ok) throw new Error(`Discord respondió ${response.status}`);
    console.log(`Discord: anunciado ${item.file}`);
  }
};

const selfTest = () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "discord-blog-deploy-"));
  const blog = path.join(cwd, "src/content/blog");
  mkdirSync(blog, { recursive: true });
  git(["init", "-q"], cwd);
  writeFileSync(path.join(blog, "existing.md"), "---\ntitle: Existing\ndescription: Existing\ndraft: false\n---\n");
  git(["add", "."], cwd);
  git(["-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", "base"], cwd);
  const base = git(["rev-parse", "HEAD"], cwd);
  writeFileSync(path.join(blog, "existing.md"), "---\ntitle: Changed\ndescription: Changed\ndraft: false\n---\n");
  writeFileSync(path.join(blog, "draft.md"), "---\ntitle: Draft\ndescription: Hidden\ndraft: true\n---\n");
  writeFileSync(path.join(blog, "new.md"), '---\ntitle: "Nuevo [blog]"\ndescription: "Mensaje breve."\ndraft: false\n---\n');
  git(["add", "."], cwd);
  git(["-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-qm", "posts"], cwd);
  const files = addedBlogFiles(base, "HEAD", cwd);
  assert.deepEqual(files.sort(), ["src/content/blog/draft.md", "src/content/blog/new.md"]);
  assert.deepEqual(announcements(files, cwd), [{ file: "src/content/blog/new.md", message: "[Nuevo \\[blog\\]](https://mc.ferreras.dev/blog/new)\n\nMensaje breve." }]);
  console.log("discord-blog-deploy: self-test correcto");
};

const deploy = async () => {
  const pending = git(["status", "--porcelain", "--untracked-files=all", "--", "src/content/blog"])
    .split("\n").filter((line) => line.startsWith("??") || line.slice(0, 2).includes("A"));
  if (pending.length) throw new Error("confirma los blogs nuevos en Git antes de desplegar");
  const base = tryGit(["rev-parse", "--verify", deployRef]) ?? tryGit(["rev-parse", "HEAD^"]) ?? git(["mktree"], root, "");
  const files = addedBlogFiles(base);
  const result = spawnSync("pnpm", ["exec", "vercel", "deploy", "--prod", "--yes"], { cwd: root, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
  try { await notify(announcements(files)); } catch (error) {
    console.warn(`Discord: ${error instanceof Error ? error.message : "error desconocido"}`);
  }
  try { git(["update-ref", deployRef, "HEAD"]); } catch {
    console.warn("Discord: no se pudo guardar la referencia del deploy");
  }
};

if (process.argv.includes("--self-test")) selfTest();
else await deploy();
