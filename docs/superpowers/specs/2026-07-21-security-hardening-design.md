# Endurecimiento de seguridad de Ferreras SMP

## Objetivo

Corregir los riesgos detectados en la web, la API y los contenedores sin cambiar
la arquitectura de despliegue ni eliminar la actividad pública de Minecraft.

## Arquitectura conservada

Los tres procesos continúan separados:

```text
Worker (Dokploy) -> Redis <- API (Dokploy) <- Web (Vercel)
```

- El worker consulta RCON y los logs, y escribe estado y actividad en Redis.
- La API es el único servicio público con acceso a Redis.
- Vercel sirve la web y consulta la API pública.
- Los nombres y eventos recientes de jugadores siguen visibles.

## Actualización en directo

Se elimina el endpoint SSE y el cliente `EventSource`. El navegador reutiliza el
polling existente y solicita `/api/minecraft/live` cada diez segundos. Esto
elimina conexiones persistentes y consultas periódicas a Redis por cada socket,
manteniendo una actualización suficientemente rápida para entradas y salidas.

## Protección de la API

- El adaptador Node limita los cuerpos HTTP a unos pocos KiB.
- El endpoint de voto exige `application/json`, un cuerpo pequeño y un origen
  permitido. Las peticiones de otros sitios se rechazan, no solo se ocultan por
  CORS.
- La IP del cliente procede de `CF-Connecting-IP` validada cuando esté presente.
  Se eliminan los fallbacks manipulables `X-Real-IP` y `X-Forwarded-For`; la
  dirección proporcionada por Astro queda como fallback local.
- El origen de la API debe quedar cerrado a las redes de Cloudflare para que la
  cabecera confiable no pueda falsificarse accediendo directamente al servidor.
- `IP_HASH_SALT` es obligatorio en producción y se usa como clave HMAC. En
  desarrollo se conserva un valor local para no añadir configuración innecesaria.
- Las respuestas de error no revelan Redis, DragonFly ni nombres de variables.

## Cabeceras HTTP

El middleware añade a las respuestas:

- `Content-Security-Policy` con `frame-ancestors 'none'`, `base-uri 'self'` y
  `object-src 'none'`.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- Una `Permissions-Policy` restrictiva para capacidades no utilizadas.
- HSTS en producción HTTPS, también para la API.

La política no restringirá scripts todavía porque la web usa scripts inline y
analítica configurable; esa ampliación requiere nonces o hashes y queda fuera de
este endurecimiento.

## Dependencias y cadena de suministro

- Astro se actualiza a una versión corregida igual o posterior a 7.1.0.
- SVGO se actualiza a una versión corregida igual o posterior a 4.0.2.
- Vercel CLI se fija a una versión exacta como dependencia de desarrollo y el
  despliegue usa `pnpm exec vercel` en lugar de descargar la última versión con
  `pnpm dlx`.

## Contenedores

Los Dockerfiles usan etapas separadas de compilación y ejecución. La imagen final
incluye solo los artefactos y dependencias necesarios y ejecuta tanto la API como
el worker con el usuario sin privilegios `node`. Los tres despliegues y sus redes
no cambian.

## Manejo de errores

Los fallos de validación devuelven `400`, los orígenes no permitidos `403`, los
cuerpos o tipos no aceptados `413` o `415`, y los fallos internos `503` sin
detalles de infraestructura. El frontend mantiene el último estado disponible y
muestra el error temporal sin abrir otro canal de transporte.

## Verificación

La implementación se considerará completa cuando pasen:

1. Una comprobación específica de validación de origen, tipo y tamaño del voto.
2. `pnpm check`.
3. Los tests de parsers del worker.
4. El self-test del despliegue de Discord.
5. `pnpm build` y `pnpm build:dokploy`.
6. La construcción de ambos Dockerfiles cuando Docker esté disponible.
7. `pnpm audit --prod` sin los avisos de Astro y SVGO identificados.

No se realizarán pruebas de carga ni votos reales contra producción.
