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
api.mc.ferreras.dev  -> Dokploy/VPS, API Minecraft Live
DragonFly            -> privado en Dokploy/VPS
Worker RCON/logs     -> Dokploy/VPS
Minecraft            -> Dokploy/VPS
```

Vercel no se conecta a DragonFly/Redis. El frontend consume una API configurable.

Variables para Vercel/frontend:

```env
PUBLIC_MINECRAFT_API_URL=https://api.mc.ferreras.dev
```

Si no se define `PUBLIC_MINECRAFT_API_URL`, el frontend usa rutas relativas
`/api/minecraft/...`, que es lo cómodo en desarrollo local.

Variables para Dokploy/API:

```env
REDIS_URL=redis://default:PASSWORD@dragonfly:6379
IP_HASH_SALT=valor-secreto
```

DragonFly no debe exponerse públicamente. Solo la API en Dokploy/VPS debe tener
acceso a `REDIS_URL`.

#### API en Dokploy

La API pública `api.mc.ferreras.dev` se despliega como una aplicación diferente
al worker. Usa el `Dockerfile` de la raíz del repo.

Configuración recomendada en Dokploy:

```text
Repository: cferreras/ferreras-smp
Branch: main
Build type: Dockerfile
Dockerfile path: Dockerfile
Port: 4321
Domain: api.mc.ferreras.dev
```

Variables para esta aplicación:

```env
REDIS_URL=redis://default:PASSWORD@dragonfly:6379
IP_HASH_SALT=valor-secreto
```

Esta aplicación sí expone HTTP hacia Traefik/Dokploy, pero no habla con RCON.
Solo lee y escribe datos de DragonFly/Redis para los endpoints
`/api/minecraft/...`.

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

No guardes contraseñas reales en el repo. Para producción también conviene definir:

```env
IP_HASH_SALT=valor-secreto
```

El seed de desarrollo carga `mc:status`, `mc:activity:recent`, `mc:poll:weekend-plan:meta`
y `mc:poll:weekend-plan:votes`:

```bash
pnpm seed:minecraft-live
```

Comprobar endpoints:

```bash
curl http://localhost:4321/api/minecraft/live
curl http://localhost:4321/api/minecraft/status
curl http://localhost:4321/api/minecraft/activity
curl http://localhost:4321/api/minecraft/poll
curl -N http://localhost:4321/api/minecraft/stream
curl -X POST http://localhost:4321/api/minecraft/poll/vote \
  -H "Content-Type: application/json" \
  -d '{"optionId":"end"}'
```

### Worker RCON de Minecraft

El worker vive en `worker/` y se ejecuta como servicio separado en Dokploy/VPS.
No expone puertos, no recibe peticiones HTTP y es la única pieza que debe hablar
con RCON. Su trabajo es consultar Minecraft y escribir el estado en DragonFly/Redis
en la clave `mc:status`, que luego lee la API.

Variables necesarias para el worker:

```env
REDIS_URL=redis://default:PASSWORD@dragonfly:6379
RCON_HOST=minecraft
RCON_PORT=25575
RCON_PASSWORD=...
MINECRAFT_HOST_PUBLIC=mc.ferreras.dev
MINECRAFT_MAX_PLAYERS=20
MINECRAFT_POLL_INTERVAL_MS=10000
MINECRAFT_LOG_PATH=/srv/minecraft/logs/latest.log
```

Variables opcionales:

```env
RCON_CONNECT_TIMEOUT_MS=5000
RCON_COMMAND_TIMEOUT_MS=5000
MINECRAFT_LOG_POLL_INTERVAL_MS=2000
```

Para que `MINECRAFT_LOG_PATH` funcione, el contenedor del worker debe tener
montada la carpeta de logs del servidor Minecraft. Si el host usa
`/srv/minecraft/logs`, monta esa misma ruta en el worker como solo lectura:

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
