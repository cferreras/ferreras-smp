# Ferreras SMP

Landing estática para el servidor de Minecraft `mc.ferreras.dev`, construida
con Astro.

## Desarrollo

```bash
pnpm install
pnpm dev
```

### Ferreras SMP en directo: frontend, API y Redis

La arquitectura objetivo separa la web pública de la API que habla con DragonFly:

```text
mc.ferreras.dev      -> Vercel, frontend/web pública
mc-api.ferreras.dev  -> Dokploy/VPS, API Minecraft Live
DragonFly            -> privado en Dokploy/VPS
Worker latest.log    -> Dokploy/VPS
Minecraft            -> Dokploy/VPS
```

Vercel no se conecta a DragonFly/Redis. El frontend consume una API configurable.

Variables para Vercel/frontend:

```env
PUBLIC_MINECRAFT_API_URL=https://mc-api.ferreras.dev
PUBLIC_COMMENTS_API_URL=https://mc-api.ferreras.dev
PUBLIC_TURNSTILE_SITE_KEY=<site-key-de-turnstile>
```

Si no se define `PUBLIC_MINECRAFT_API_URL`, el frontend usa rutas relativas
`/api/minecraft/...`, que es lo cómodo en desarrollo local.

Variables para Dokploy/API:

```env
REDIS_URL=redis://default:PASSWORD@dragonfly:6379
MINECRAFT_API_ONLY=true
COMMENTS_ALLOWED_ORIGIN=https://mc.ferreras.dev
COMMENTS_PUBLIC_API_URL=https://mc-api.ferreras.dev
COMMENTS_IDENTITY_SECRET=<secreto-aleatorio-de-al-menos-32-caracteres>
TURNSTILE_SECRET_KEY=<secret-key-de-turnstile>
COMMENTS_DISCORD_WEBHOOK_URL=<webhook-privado-de-discord>
COMMENTS_BLOCKED_TERMS=
```

DragonFly no debe exponerse públicamente. Solo la API en Dokploy/VPS debe tener
acceso a `REDIS_URL`.

#### API en Dokploy

La API pública `mc-api.ferreras.dev` se despliega como una aplicación diferente
al worker. Usa el `Dockerfile` de la raíz del repo.

Configuración recomendada en Dokploy:

```text
Repository: cferreras/ferreras-smp
Branch: main
Build type: Dockerfile
Dockerfile path: Dockerfile
Port: 4321
Domain: mc-api.ferreras.dev
Path: /
Internal Path: /
```

Variables para esta aplicación:

```env
REDIS_URL=redis://default:PASSWORD@dragonfly:6379
MINECRAFT_API_ONLY=true
```

Esta aplicación sí expone HTTP hacia Traefik/Dokploy, pero no habla con RCON.
Solo lee y escribe datos de DragonFly/Redis para los endpoints
`/api/minecraft/...` y `/api/comments/...`. Con `MINECRAFT_API_ONLY=true`,
cualquier ruta fuera de esos prefijos responde 404 y `/health` responde un JSON ligero para
checks de salud; así la instancia de Dokploy no sirve la landing completa en
`/`.

#### Comentarios del blog

Los artículos siguen prerenderizados y cargan sus comentarios desde
`PUBLIC_COMMENTS_API_URL`. La API usa Dragonfly para comentarios, índices,
moderación y límites temporales. Turnstile se valida siempre en el servidor y
los comentarios sospechosos se envían al webhook de Discord con enlaces de
moderación de un solo uso.

La cookie anónima se firma con `COMMENTS_IDENTITY_SECRET`; genera un código y
un avatar estables para ese navegador. El código visible permite distinguir a
dos personas aunque hayan elegido el mismo nick. No reutilices ese secreto en
otros servicios.

Dragonfly debe tener un volumen persistente en `/data` y snapshots periódicos,
por ejemplo:

```yaml
environment:
  - "DFLY_snapshot_cron=*/15 * * * *"
  - DFLY_dir=/data
```

Dokploy realiza además un backup diario del volumen a Cloudflare R2. El backup
debe detener temporalmente el contenedor para no copiar un snapshot mientras
se está escribiendo.

El origen de `mc-api.ferreras.dev` debe aceptar tráfico público únicamente desde
las redes de Cloudflare. Configura también rate limiting en Cloudflare para
`/api/minecraft/*`.

#### Desarrollo local

En desarrollo local, la misma app puede servir frontend + API y leer Redis/DragonFly
desde `REDIS_URL`.

Desarrollo local con Redis/DragonFly local:

```env
REDIS_URL=redis://127.0.0.1:6379
```

Desarrollo local usando DragonFly/Redis en un VPS por túnel SSH:

```bash
ssh -L 6379:127.0.0.1:6379 usuario@IP_DEL_VPS
```

Luego usa en local:

```env
REDIS_URL=redis://127.0.0.1:6379
```

Producción en Dokploy/red Docker:

```env
REDIS_URL=redis://dragonfly:6379
```

Producción con password:

```env
REDIS_URL=redis://default:PASSWORD@dragonfly:6379
```

No guardes contraseñas reales en el repo.

El seed de desarrollo carga `mc:status` y `mc:activity:recent`:

```bash
pnpm seed:minecraft-live
```

Comprobar endpoints:

```bash
curl http://localhost:4321/api/minecraft/live
curl http://localhost:4321/api/minecraft/status
curl http://localhost:4321/api/minecraft/activity
```

### Worker de eventos de Minecraft

El worker vive en `worker/` y se ejecuta como servicio separado en Dokploy/VPS.
No expone puertos ni recibe peticiones HTTP. Sigue `latest.log` en tiempo real
mediante eventos del sistema de archivos, reconstruye al arrancar los jugadores,
el día del mundo y el estado del servidor, y lo escribe en DragonFly/Redis.
Al arrancar, el worker usa RCON una vez para reconciliar el estado actual y el
día del mundo; después sigue `latest.log` en tiempo real para los cambios.
La conexión RCON se reutiliza y también queda disponible para comandos
administrativos.

Variables necesarias para el worker:

```env
REDIS_URL=redis://default:PASSWORD@dragonfly:6379
RCON_HOST=minecraft
RCON_PORT=25575
RCON_PASSWORD=...
MINECRAFT_HOST_PUBLIC=mc.ferreras.dev
MINECRAFT_MAX_PLAYERS=20
MINECRAFT_LOG_PATH=/srv/minecraft/logs/latest.log
```

Variables opcionales:

```env
RCON_CONNECT_TIMEOUT_MS=5000
RCON_COMMAND_TIMEOUT_MS=5000
```

El contenedor del worker debe tener montada la carpeta de logs del servidor
Minecraft. Si el host usa `/srv/minecraft/logs`, monta esa misma ruta en el
worker como solo lectura:

```text
/srv/minecraft/logs:/srv/minecraft/logs:ro
```

Ejecutar en local:

```bash
pnpm --filter @ferreras/minecraft-live-worker dev
```

Compilar y arrancar como en producción:

```bash
pnpm --filter @ferreras/minecraft-live-worker build
pnpm --filter @ferreras/minecraft-live-worker start
```

Probar los parsers sin Minecraft ni Redis:

```bash
pnpm --filter @ferreras/minecraft-live-worker test:parsers
```

Verificar que el worker escribe en Redis/DragonFly:

```bash
redis-cli GET mc:status
```

En Dokploy, despliega `worker/Dockerfile` como servicio aparte, en la misma red
que DragonFly y Minecraft. No publiques puertos para este servicio. Si
`RCON_HOST=minecraft` no resuelve, usa el host o IP alcanzable desde la red del
worker.

En los volúmenes del servicio añade el bind mount de logs en modo solo lectura.
La ruta de destino debe coincidir con `MINECRAFT_LOG_PATH`; por ejemplo:

```text
Host: /srv/minecraft/logs
Container: /srv/minecraft/logs
Read only: sí
```

RCON y las conexiones `redis://` no cifran el tráfico. Mantén ambos puertos en
esa red privada; si el tráfico cruza hosts o una red no confiable, protégelo con
WireGuard/Tailscale y usa `rediss://` para Redis cuando esté disponible.

Configuración recomendada en Dokploy:

```text
Repository: cferreras/ferreras-smp
Branch: main
Build type: Dockerfile
Dockerfile path: worker/Dockerfile
Domain: ninguno
Ports: ninguno público
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
