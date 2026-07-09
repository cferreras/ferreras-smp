# Ferreras SMP

Landing estática para el servidor de Minecraft `mc.ferreras.dev`, construida
con Astro.

## Desarrollo

```bash
pnpm install
pnpm dev
```

## Generar la web

```bash
pnpm build
```

Astro guardará la versión lista para publicar en `dist/`.

## Editar el contenido

La IP, Discord, normas y lista de mods están centralizados en:

```text
src/data/server.ts
```

Las secciones de la página están separadas en `src/components/`, de modo que se
puedan añadir futuras áreas como estado del servidor, BlueMap o noticias sin
rehacer la landing.
