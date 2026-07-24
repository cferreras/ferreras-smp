# Actividad reciente desde jugadores online

## Objetivo

Permitir consultar “Lo último del mundo” desde la tarjeta “Jugadores online” sin eliminar todavía la tarjeta independiente de actividad reciente.

## Escritorio

- Al pasar el ratón sobre la tarjeta o enfocarla con teclado, desplegar un panel debajo de los jugadores.
- Hacer el `<article>` enfocable mediante `tabindex="0"` para ofrecer el mismo contenido sin depender del ratón.
- El panel forma parte del flujo y hace crecer la tarjeta hacia abajo.
- Mostrar el título “Lo último del mundo” y los mismos eventos agrupados de la sección independiente.
- Ocultar el panel al retirar el puntero o el foco.

## Móvil

- Toda la superficie visible de la tarjeta abre un modal nativo al tocarla.
- El modal muestra el título, la lista de eventos y un botón de cierre.
- Permitir cerrar con el botón, tocando el fondo o pulsando Escape.
- Mantener el foco gestionado por `<dialog>` y devolverlo al activador al cerrar.

## Componentes y datos

- Extraer el marcado de la lista a un componente compartido `ActivityFeed`.
- Reutilizarlo en `RecentActivity`, en el panel de escritorio y en el modal móvil.
- Pasar los eventos actuales a `OnlinePlayers`.
- Actualizar todas las copias visibles mediante el polling existente; no añadir peticiones.
- Mantener el mensaje vacío actual cuando no haya actividad.

## Responsive y accesibilidad

- Mostrar el panel inline únicamente por encima de 720 px.
- Mostrar la zona táctil y el modal únicamente hasta 720 px.
- Usar un botón transparente que cubra la tarjeta en móvil para que toda la superficie sea activable sin convertir el `<article>` en un control.
- Permitir abrir el modal con teclado y conservar el cierre nativo con Escape.
- Respetar `prefers-reduced-motion`.

## Validación

- Comprobar apertura y cierre por hover y teclado en escritorio.
- Comprobar apertura y cierre del modal por toque, botón, fondo y Escape.
- Confirmar que el polling actualiza la sección independiente, el panel y el modal.
- Ejecutar `pnpm build`.
