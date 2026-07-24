# Retirada de la sección en directo y la encuesta

## Objetivo

Eliminar de la portada la sección `Ferreras SMP en directo · El mundo, ahora mismo` y retirar completamente la encuesta comunitaria del frontend y la API, conservando el estado, los jugadores y la actividad en directo de la franja del hero.

## Frontend

- Quitar `LiveServerSection` de la portada.
- Eliminar los componentes exclusivos de esa sección: `LiveServerSection`, `OnlinePlayers`, `RecentActivity`, `CommunityPoll` y `PollOption`.
- Mantener `PlayerList` y `ActivityFeed`, ya que los paneles de la franja los reutilizan.
- Mover la inicialización del polling al hero para que `/api/minecraft/live` siga actualizando estado, jugadores y actividad.
- Retirar del script toda la renderización y el envío de votos.
- Eliminar estilos que solo pertenecían a la sección y la encuesta.

## API y datos

- Eliminar las rutas `/api/minecraft/poll` y `/api/minecraft/poll/vote`; responderán 404.
- Eliminar `poll-service` y las utilidades de seguridad exclusivas de los votos.
- Quitar los tipos, constantes, claves y valores predeterminados de la encuesta.
- Hacer que `/api/minecraft/live` devuelva únicamente `status` y `activity`.
- Quitar la encuesta del seed y del mock local.
- No borrar claves ya almacenadas en Redis; quedarán sin lectores ni escritores.

## Documentación

- Quitar de README las variables, recomendaciones, claves y ejemplos de endpoints exclusivos de la encuesta.
- Conservar especificaciones históricas en `docs/superpowers/specs`.

## Validación

- Confirmar que la portada no contiene la sección ni textos de la encuesta.
- Confirmar que no quedan rutas o referencias ejecutables de la encuesta.
- Confirmar que la franja sigue recibiendo `status`, `players` y `activity`.
- Ejecutar `pnpm check`, `pnpm test:security` y `pnpm build`.
