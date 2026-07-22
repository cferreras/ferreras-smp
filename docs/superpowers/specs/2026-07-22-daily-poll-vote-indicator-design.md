# Indicador de votación diaria

## Objetivo

Mostrar en la tarjeta de votación que cada visitante puede votar una vez al día.

## Diseño

Añadir un texto estático bajo el título de la votación:

> Puedes votar una vez al día.

El texto formará parte del HTML inicial de `CommunityPoll.astro`, usando el
estilo existente de texto secundario. No se añade estado de cliente, endpoint
ni componente nuevo.

## Flujo y límites

El backend ya aplica el límite de 24 horas por IP antes de registrar el voto.
Esta tarea solo hace visible esa regla; la respuesta de error existente sigue
informando cuando se intenta votar antes de que expire el límite.

## Verificación

- Ejecutar `pnpm check`.
- Revisar que la tarjeta muestre el aviso y que la votación siga funcionando.
