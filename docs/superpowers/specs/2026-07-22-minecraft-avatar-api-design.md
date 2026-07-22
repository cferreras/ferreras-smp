# Cambio de proveedor de avatares de Minecraft

## Objetivo

Sustituir `api.mcheads.org`, que está fallando con frecuencia, por Minotar sin
cambiar el formato visual de las cabezas ni el comportamiento de la interfaz.

## Diseño aprobado

- `src/lib/minecraft/avatar.ts` será la única pieza modificada.
- El proveedor será `https://minotar.net/avatar`.
- Los nombres de jugador seguirán codificándose con `encodeURIComponent` y se
  solicitarán a 64 px.
- `MHF_Steve` seguirá siendo la imagen por defecto y el fallback existente del
  navegador permanecerá sin cambios.
- Tanto el HTML inicial como los jugadores añadidos por polling seguirán usando
  `getPlayerAvatarUrl`.

## Verificación

Ejecutar `pnpm check` y comprobar que las URLs generadas tienen el formato
`https://minotar.net/avatar/<jugador>/64`.
