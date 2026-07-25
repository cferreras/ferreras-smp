# Ferreras SMP homepage: four visual directions

## Objective

Raise the homepage to a polished, professional standard by presenting four
clearly differentiated visual directions in Impeccable Live. Preserve the
site's Minecraft identity, purple accent, existing content, and current
functionality. Only the direction selected by the user becomes permanent.

## Scope

This work redesigns the homepage presentation and responsive behavior. It does
not add product functionality, change editorial content, alter data sources, or
redesign the secondary guide and blog routes.

The homepage continues to include:

- A compact site header and navigation.
- A hero with the value proposition, server address copy action, and Discord
  call to action.
- Live server status, player count, and recent activity.
- Benefits, rules, recommended mods, and recent posts.
- A full-width final join call to action and the existing footer.

## Shared design foundation

All four directions retain Minecraft and pixel-art cues without sacrificing
legibility. Purple remains the identifying accent. Geist Sans, Geist Mono, and
Geist Pixel Square retain distinct roles for readable copy, technical data,
and expressive display text.

Every direction must provide:

- A clear primary action and an immediately discoverable server address.
- A live-status treatment that feels native to the composition.
- Consistent type, spacing, alignment, border, and interaction systems.
- Dark and light themes with WCAG AA text contrast.
- Keyboard-visible focus states and touch targets of at least 44 by 44 pixels.
- Responsive layouts from 320-pixel mobile screens through wide desktop
  displays without horizontal overflow or truncated essential content.
- Restrained motion that respects `prefers-reduced-motion`.

## Direction 1: Editorial premium

This direction uses a disciplined editorial grid, generous negative space, and
large pixel-display headlines. The server image and live data act as carefully
placed supporting elements rather than competing focal points.

Sections use strong typographic hierarchy and quiet dividers. Cards are sparse
and aligned to the same columns. The result should feel mature, calm, and
high-value while still visibly belonging to a Minecraft community.

## Direction 2: Live server dashboard

This is the recommended direction. Server availability, player count, activity,
and the address become the visual center of the hero. The page feels active and
current, using modular data surfaces and clear operational states.

The dashboard treatment must remain welcoming rather than looking like an
administration console. Community language, pixel typography, and the server
art balance the structured information. Subsequent sections continue the
modular rhythm with compact evidence-driven blocks.

## Direction 3: Cinematic survival

This direction gives the server artwork and world atmosphere greater visual
weight. Layered depth, controlled gradients, and large-scale composition create
an immersive opening while maintaining readable text and fast access to the
server address.

Content sections follow a narrative sequence: discover the world, understand
the community, review the rules and mods, then join. Effects must remain
lightweight, decorative, and nonessential to comprehension.

## Direction 4: Pixel brutalism

This direction embraces Minecraft's block language through strong outlines,
hard divisions, deliberate asymmetry, and assertive contrast. It is the most
expressive option, but must remain coherent and usable rather than becoming a
novelty theme.

Pixel display text is used selectively. Dense visual moments alternate with
quiet reading areas. Interaction feedback is direct, with crisp color changes
and minimal movement.

## Component and data behavior

The existing Astro component boundaries and server-data flow remain intact.
Temporary Impeccable wrappers and variant styles may compose those components
differently for comparison, but variants must not duplicate API requests or
change live-status logic.

The following states must remain clear in every direction:

- Server online and offline.
- Live data loading or unavailable.
- Empty player and activity lists.
- Successful, pending, and failed address-copy actions.
- Open and closed navigation menus.
- Dark and light themes.

## Variant delivery

Impeccable Live will expose four temporary variants on the homepage. Each
variant represents a complete direction rather than a minor color or spacing
variation. The user can cycle through them in the real page and accept or
discard the result.

Before acceptance, variant code is temporary and isolated. After acceptance,
the chosen direction is carbonized into the existing components and stylesheet.
All Impeccable markers, wrappers, and unused variant rules are removed.

## Verification and acceptance criteria

The accepted direction is complete when:

- Visual hierarchy, spacing, and alignment are internally consistent.
- Copying the server address, navigation, theme switching, player previews, and
  activity interactions still work.
- Online, offline, loading, unavailable, empty, success, and error states are
  legible.
- The page works at mobile, tablet, desktop, and wide-screen breakpoints.
- There is no horizontal overflow at a 320-pixel viewport.
- Text contrast meets WCAG AA and focus states are visible.
- Motion is disabled or reduced when the user requests reduced motion.
- `pnpm check` and `pnpm build` pass.
- No temporary Impeccable variant markers remain after carbonization.
