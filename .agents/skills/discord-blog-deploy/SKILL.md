---
name: discord-blog-deploy
description: Deploy this Ferreras SMP site to Vercel and announce newly added Astro blog posts through a Discord webhook. Use when changing the pnpm deploy workflow, configuring DISCORD_BLOG_WEBHOOK_URL, testing blog announcement formatting, or deploying a newly published post.
---

# Discord Blog Deploy

Run deployment and Discord announcement logic through `scripts/deploy.mjs`.

## Workflow

1. Ensure new files under `src/content/blog` are committed.
2. Ensure `DISCORD_BLOG_WEBHOOK_URL` is exported or present in `.env.local`.
3. Run `pnpm deploy` from the repository root.
4. Treat Vercel failures as deployment failures. Treat Discord failures as warnings after a successful deployment.

The script compares `HEAD` with the private Git ref `refs/ferreras-smp/last-discord-blog-deploy`. On first use it compares with `HEAD^`. It announces only added, non-draft `.md` or `.mdx` files, then advances the ref after a successful Vercel deployment.

## Configure the secret

Add the production variable interactively without putting its value in shell history. Do not use `--sensitive`: Vercel cannot pull sensitive values for the local post-deploy step:

```bash
pnpm dlx vercel env add DISCORD_BLOG_WEBHOOK_URL production
```

Then make it available to the local post-deploy step:

```bash
pnpm dlx vercel env pull .env.local --environment=production
```

Never print or commit the webhook URL.

## Verify

Run the deterministic self-check without contacting Vercel or Discord:

```bash
node .agents/skills/discord-blog-deploy/scripts/deploy.mjs --self-test
```

Run `quick_validate.py` against this skill after changing its metadata or structure.
