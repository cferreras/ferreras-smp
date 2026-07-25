# Homepage polish and audit fixes

## Scope

Polish the Ferreras SMP homepage without redesigning its visual identity or restructuring its long-form sections. Resolve the four P1 critique findings and verified technical-audit defects. Leave the P2 proposal to condense rules and other homepage content for a separate change.

## User outcome

A visitor should immediately understand that they can join Minecraft directly, that Discord is optional, and that Ferreras SMP supports technical and semi-technical players interested in simple- to medium-complexity farms and automation. Live server information and IP-copy feedback must remain truthful when browser or network operations fail.

## Design

### Hero and joining path

- Keep the existing split hero, character art, palette, typography, and server-address component.
- Make the server address and its “Copiar IP” control the strongest action treatment.
- Keep “Cómo entrar” as the secondary action.
- Present Discord as an optional community/support link rather than the primary joining action.
- Add one concise, factual line about farms and automation; do not claim support for undocumented mechanics.
- Remove the duplicate `id="contenido"` from the hero so the page main remains the only skip-link target.

### Live status

- Make the player-count control reveal connected players.
- Render online/offline as noninteractive status.
- Give recent activity its own explicit “Actividad reciente” control.
- Show visible loading, current, stale, and unavailable messaging.
- Record the last successful update time.
- On a failed first request, replace placeholder metrics with unavailable values; after a later failure, retain the last successful data but label it stale.
- Provide a visible retry action while automatic polling continues.

### Copy feedback

- Report “Copiada” only after the Clipboard API or fallback copy operation confirms success.
- Report “No se pudo copiar” on failure and keep the server address selectable.
- Emit the copy analytics event only after successful copying.

### Accessibility and responsive behavior

- Give mobile theme, navigation, and copy controls a minimum 44×44px target.
- Preserve keyboard focus, dialog behavior, screen-reader announcements, reduced-motion behavior, and both themes.
- Status labels and controls must predict the content they reveal.

## Implementation boundaries

- Reuse existing components, tokens, dialogs, polling, and analytics.
- Do not add dependencies, a new design system, or new abstractions for one-off behavior.
- Do not change the worker, API contract, rules content, blog content, or long-form homepage section order.
- Treat the detector’s Geist and decorative-grid warnings as intentional existing identity choices, not defects in this pass.

## Verification

- Run `pnpm check` and `pnpm build`.
- Run the bundled Impeccable detector and verify findings in context.
- Exercise copy success/failure and live first-load/success/stale/retry branches with the smallest runnable focused check available.
- Inspect the final diff for unrelated churn and temporary artifacts.
