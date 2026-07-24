# Jugadores conectados desde el estado del servidor

## Objetivo

Mostrar los jugadores conectados al interactuar con la celda `Online/Offline` del `live-status-strip`, reutilizando las cabezas, nombres y estados vacíos de la tarjeta existente.

## Interacción

- Mantener la actividad reciente vinculada a `0 / 20 · JUGADORES ONLINE`.
- Convertir toda la celda `Online/Offline` en un botón accesible.
- En escritorio, abrir el panel de jugadores mediante hover o foco y cerrarlo al abandonar el botón y el panel.
- En móvil, abrir un diálogo nativo al tocar la celda.
- Permitir cerrar el diálogo con su botón, el fondo o Escape y devolver después el foco al trigger.

## Componentes y datos

- Extraer el listado visual de jugadores a un componente compartido.
- Reutilizarlo en la tarjeta `Jugadores conectados`, el desplegable y el diálogo.
- Mostrar cabeza y nombre para cada jugador.
- Conservar el mensaje vacío actual cuando no haya jugadores o el servidor esté offline.
- Hacer que el polling existente actualice todas las copias sin añadir peticiones.

## Layout y accesibilidad

- Mostrar el desplegable bajo todo el ancho del strip, sin desplazar la siguiente sección.
- Usar `Jugadores conectados` como único encabezado visible con su indicador.
- Sincronizar `aria-expanded`, `aria-controls` y `aria-hidden`.
- Mantener separados los dos triggers y sus respectivos paneles.

## Validación

- Comprobar hover, foco, clic, Escape y cambio entre escritorio y móvil.
- Confirmar que las cabezas usan el fallback de Steve si falla la imagen.
- Confirmar que el polling actualiza tarjeta, desplegable y diálogo.
- Ejecutar `pnpm build`.
