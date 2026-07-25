# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Spanish-speaking technical and semi-technical Minecraft Java players who want a calm survival world where they can build simple- to medium-complexity farms and automations.

## Product Purpose

Ferreras SMP helps players join and understand a Minecraft Java survival server, then directs them to the game and its Discord community. Success means a player can evaluate the server, connect without a required modpack, and build at their own pace.

## Positioning

A survival experience close to vanilla for technical and semi-technical builders, with discreet server-side improvements, land protection, and a connected Discord community instead of a mandatory client modpack or unnecessary progression systems.

## Operating Context

Players connect through `mc.ferreras.dev`, use Discord for community and support, and may install the documented optional client mods for maps and easier land-claim management. The public website provides joining instructions, rules, server information, live status, recommended mods, and educational articles.

## Capabilities and Constraints

- Minecraft Java survival in Spanish.
- No mandatory client modpack.
- Supports simple- to medium-complexity farms and automations; specific supported mechanics remain an open product decision unless documented elsewhere.
- Server-side performance, administration, security, community, and quality-of-life mods are documented in `src/data/server.ts`.
- Land protection is available through Open Parties and Claims.
- Public live status is supplied through a separate API backed by private Redis/DragonFly and a worker with RCON/log access.
- The website is an Astro application; the Minecraft live worker is a separate child app.

## Brand Commitments

- Name: Ferreras SMP.
- Server address and canonical site: `mc.ferreras.dev`.
- Primary language: Spanish.
- Voice: direct, calm, practical, and free of unnecessary complexity.
- Preserve the official logo, brand mark, fonts, imagery, rules, and server facts already present in the repository unless the owner changes them.

## Evidence on Hand

- Central server description, rules, mod list, address, and Discord link: `src/data/server.ts`.
- Joining guide, FAQ, rules, recommended mods, live server status, and blog content under `src/pages`, `src/components`, and `src/content/blog`.
- Official logo and brand assets under `public` and `src/assets/images`.
- Analytics event contract and SEO planning under `docs`.
- No repository evidence currently establishes testimonials, uptime guarantees, player-count claims, or performance benchmarks; future work must not fabricate them.

## Product Principles

- Make joining and understanding the server straightforward.
- Serve technical building without turning survival into a system-heavy experience.
- Keep client setup optional and server-side complexity discreet.
- Protect players’ builds and support calm, respectful coexistence.
- Prefer verified server facts over promotional claims.

## Accessibility & Inclusion

Use semantic, keyboard-accessible web interfaces and clear Spanish instructions. Do not assume advanced technical knowledge merely because the primary audience enjoys technical Minecraft.
