# Design QA

source visual truth path: `C:\Users\carlo\AppData\Local\Temp\codex-clipboard-be4da309-de3c-4d57-a3a1-af3357ebbcd0.png`
implementation screenshot path: `D:\code\ferreras-smp\design-qa-homepage.jpg`
responsive implementation screenshot path: `D:\code\ferreras-smp\design-qa-mobile.jpg`
server route implementation screenshot path: `D:\code\ferreras-smp\design-qa-server.jpg`
server route illustration screenshot path: `D:\code\ferreras-smp\design-qa-server-art.jpg`
viewport: desktop CSS 1525x1016, mobile CSS 406x823, homepage, light theme
source and implementation pixel dimensions: source 1536x1024 PNG; desktop implementation 1525x1017 JPEG; mobile implementation 1186x1695 JPEG
density normalization: source is 1x; browser capture reports devicePixelRatio 0.59. Comparison used the desktop CSS viewport and DOM geometry as the normalized layout reference.
state: homepage at scroll top, light theme, mobile menu closed

## Comparison evidence

The source and the final browser-rendered implementation were opened together and compared at the same desktop composition. The implementation now follows the reference hierarchy: 128px header, off-white paper surface, inset hero copy, right-anchored Minecraft scene with a soft fade, four-line heading, purple accent word, CTA/status rhythm, grid decoration, and the lower wheat/block statement mark.

Focused regions were reviewed for the header/hero and the first statement section. Normalized desktop measurements are close to the source: hero starts at y=130, heading starts at x=105/y=249, the visual starts at x=540/y=130, the CTA starts at x=105/y=639, the online status starts at x=105/y=732, and the statement heading starts at x=307/y=865. The mobile capture confirms the desktop navigation collapses, the hero stacks, and the page has no horizontal overflow.

The `/servidor/` browser-comment pass was also captured. Its page-hero image now renders at 1.6:1 instead of inheriting the source asset's 1200x800 height attribute, and the prose CTA explicitly keeps white text over the violet background.

The homepage annotation pass removes the secondary `Conoce el servidor` link from the hero so Discord remains the single primary action. The live browser check confirms one hero CTA with no layout or console regression.

The philosophy-section annotation pass replaces the text-only left rail with a transparent voxel adventurer cutout. The final PNG has an RGBA channel, transparent corners, and a 286px visual desktop render from a 220px layout box, so the prose column keeps its original top position.

The same transparent adventurer now replaces the text-only rail on `/como-entrar/`, keeping the access page visually consistent with `/servidor/` and preserving the prose column position.

The homepage and `/estado/` now use the first-party `/api/server-status` endpoint. The server-side check resolves `_minecraft._tcp.mc.ferreras.dev`, uses the lightweight MIT `minecraft-status` pnpm package to query Java status directly over TCP, caches the result briefly, and updates the UI without a third-party status API.

## Findings

- No actionable P0, P1, or P2 findings remain.
- [P3] The repository hero artwork includes a slightly different foreground character crop than the supplied mockup. The existing Minecraft asset is retained because it matches the mockup's palette, structure, tower, river, mountains, and lighting; this is a source-art variation rather than a layout or interaction blocker.

## Primary interactions tested

- Theme toggle: passed for light, dark, and system preferences; the system state resolves through `prefers-color-scheme` and shows the standard Font Awesome `circle-half-stroke` icon.
- Mobile menu: passed; the native details menu opened with five links and closed again.
- Header and hero Discord CTAs: rendered with the Font Awesome Discord SVG and retained the configured external destination.
- Server status: passed; the browser receives a 200 response from `/api/server-status`, and the hero/status card reflect the direct ping result. A real TCP check through `minecraft-status` returned `26.2` and `0/20`; this local preview reports unavailable only because its process cannot open outbound TCP port `25565`, so the UI shows the offline state instead of stale player counts.
- Static navigation and blog routes: present in the DOM and included in the successful Astro build.
- Browser console: passed; no error or warning entries were emitted during the final check.

## Comparison history

1. Initial comparison was blocked because the dev server was unavailable; no visual handoff was made.
2. Reopened the live local Astro page, moved status below the hero CTA, removed non-reference hero/statement chrome, aligned the copy/visual grid, and recaptured the desktop view.
3. Replaced the purple rounded lower icon with a backgroundless pixel-art wheat/block mark, replaced the temporary raster controls with Font Awesome SVG icons, matched the reference statement copy, and recaptured desktop and mobile views.
4. Final comparison found no actionable P0/P1/P2 differences; the remaining art-crop variance is documented as P3 follow-up polish.
5. Browser comments on `/servidor/` identified an inherited link color and an over-tall page-hero image; `.prose .button` now forces white text and `.page-hero-aside img` now uses `height: auto` with the intended 1.6:1 ratio. The corrected route was recaptured in `design-qa-server.jpg`.
6. Homepage browser comment identified a redundant secondary hero CTA; `Conoce el servidor` was removed so the hero now focuses on entering Discord.
7. Philosophy-section browser comment identified an overly text-heavy index rail; it now uses the generated transparent voxel adventurer in `design-qa-server-art.jpg`.
8. The access-page browser comment requested the same treatment; `/como-entrar/` now reuses the transparent adventurer asset in its content rail.
9. The homepage status comment requested a direct server ping; the Vercel server output now exposes `/api/server-status`, resolves the Minecraft SRV record, uses `minecraft-status` for the direct Java query, and refreshes the homepage and status page every 60 seconds.

## Implementation checklist

- [x] Desktop header and hero composition match the selected reference.
- [x] Typography, wrapping, color tokens, spacing, CTA/status placement, and decorative grid were checked.
- [x] Source image, statement artwork, and Font Awesome SVG output were inspected.
- [x] Mobile layout, three-state theme toggle, mobile menu, and console state were verified in the browser.
- [x] Homepage hero keeps a single primary Discord CTA after the annotation pass.
- [x] `/servidor/` CTA contrast and page-hero image proportion were verified in the browser.
- [x] `/servidor/` philosophy rail uses a validated transparent image asset and keeps the content grid aligned.
- [x] `/como-entrar/` access rail reuses the transparent image asset and keeps the content grid aligned.
- [x] Homepage and `/estado/` server status use the `minecraft-status` Java ping package with offline fallback and short caching.
- [x] `pnpm build` passed and `git diff --check` reported no whitespace errors.

final result: passed
