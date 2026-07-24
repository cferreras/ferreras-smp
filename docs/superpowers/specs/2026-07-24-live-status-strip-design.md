# Banda de estado en directo

## Objetivo

Reemplazar la tarjeta “Servidor en marcha” por una banda horizontal de métricas, inspirada en la referencia proporcionada, situada antes del encabezado “El mundo, ahora mismo”.

## Diseño

- Crear un componente `ServerStatusStrip` con cuatro celdas: jugadores conectados, día del mundo, TPS y estado.
- Mostrar los valores centrados a 14 px en Geist Pixel y las etiquetas en mayúsculas pequeñas.
- Usar los bordes finos, colores y espaciado del sistema visual existente.
- Distribuir las celdas en cuatro columnas en escritorio y en una cuadrícula de dos por dos en móvil.
- Representar el estado Online/Offline con el color semántico actual.

## Integración

- Renderizar la banda dentro de `Hero`, anclada justo encima del divisor con `LiveServerSection`. La banda se alinea además con una línea divisoria superior de ancho completo.
- Reutilizar los selectores `data-status-*` y el polling existente desde el documento; no añadir peticiones ni otra fuente de estado.
- Eliminar `ServerStatusCard` de la cuadrícula.
- Distribuir `OnlinePlayers`, `RecentActivity` y `CommunityPoll` en tres columnas iguales en escritorio y apilarlas en pantallas estrechas.

## Estados y accesibilidad

- Mantener “No disponible” cuando día del mundo o TPS no tengan datos.
- Mantener el estado inicial y el anuncio accesible de actualización existente.
- Conservar etiquetas semánticas mediante una lista de descripción.

## Validación

- Confirmar la actualización de las cuatro métricas con una respuesta del endpoint en directo.
- Comprobar las disposiciones de cuatro columnas y dos por dos.
- Ejecutar `pnpm build` y la comprobación visual contra la captura.
