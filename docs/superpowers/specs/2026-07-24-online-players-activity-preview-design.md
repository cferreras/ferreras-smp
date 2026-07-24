# Actividad reciente desde la métrica de jugadores

## Objetivo

Permitir consultar la actividad reciente desde la celda `0 / 20 · JUGADORES ONLINE` del `live-status-strip`, sin eliminar todavía la tarjeta independiente de actividad reciente.

## Escritorio

- Convertir toda la primera celda del strip en un botón accesible.
- Abrir el panel al pasar el ratón o enfocar el botón.
- Mostrar el panel debajo de todo el ancho del strip, superpuesto sobre la sección siguiente.
- Mantenerlo abierto mientras el puntero o el foco permanezcan en el trigger o el panel.
- Permitir alternarlo mediante clic o teclado y cerrarlo al salir del conjunto.

## Móvil

- Abrir un modal nativo al tocar la primera celda.
- Mostrar el título, la lista de eventos y un botón de cierre.
- Permitir cerrar con el botón, tocando el fondo o pulsando Escape.
- Devolver el foco al trigger al cerrar.

## Componentes y datos

- Extraer el marcado de eventos a un componente compartido `ActivityFeed`.
- Reutilizarlo en `RecentActivity`, en el desplegable y en el modal.
- Pasar la actividad actual a `ServerStatusStrip` desde `Hero`.
- Actualizar todas las copias mediante el polling existente; no añadir peticiones.
- Mantener el mensaje vacío actual cuando no haya actividad.
- Conservar la tarjeta independiente `RecentActivity` en esta iteración.

## Layout y accesibilidad

- Envolver el strip y el desplegable en un contenedor común de ancho máximo `1000px`.
- Usar “Actividad reciente” como único encabezado visible, acompañado por su indicador; no mostrar “Lo último del mundo”.
- Mantener el strip alineado justo encima del divisor del hero.
- Mostrar el desplegable únicamente por encima de 720 px y el modal hasta 720 px.
- Usar un `<button>` real de superficie completa dentro de la primera métrica.
- Sincronizar `aria-expanded` y `aria-controls` con el estado del desplegable.
- Mantener el cierre nativo con Escape y respetar `prefers-reduced-motion`.

## Validación

- Comprobar apertura y cierre por hover, foco, clic y teclado en escritorio.
- Comprobar apertura y cierre del modal por toque, botón, fondo y Escape.
- Confirmar que el polling actualiza la tarjeta existente, el desplegable y el modal.
- Comprobar que el panel no desplaza el hero ni la sección siguiente.
- Ejecutar `pnpm build`.
