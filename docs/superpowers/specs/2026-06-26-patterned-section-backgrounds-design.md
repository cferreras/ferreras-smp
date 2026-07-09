# Fondos de patrones para Ferreras SMP

## Objetivo

Integrar los dos patrones de iconos inspirados en Minecraft como un detalle decorativo sutil en las secciones «Normas» y «Cuando quieras», manteniendo la legibilidad y la dirección visual sobria del sitio.

## Alcance

- «Normas» usará el patrón oscuro de iconos de convivencia sobre el fondo oscuro actual.
- «Cuando quieras» usará el patrón claro de iconos de aventura sobre su fondo verde claro actual.
- Cada sección aplicará una capa de color translúcida sobre la imagen para reducir su contraste.
- El contenido conservará su jerarquía, colores y comportamiento responsive actuales.

## Implementación

Los dos PNG se copiarán a `public/images/` y se referenciarán desde CSS. Las secciones usarán una imagen de fondo centrada y con cobertura completa. Un pseudo-elemento absoluto proporcionará la capa tonal y el contenido se elevará con `position: relative` para que permanezca siempre legible.

No se añadirá JavaScript, no cambiará el HTML semántico ni se modificará el flujo de teclado.

## Verificación

- Comprobar las secciones a ancho móvil y escritorio.
- Confirmar que texto, botones y bordes tienen contraste suficiente sobre el patrón.
- Verificar que no hay desbordamiento horizontal ni pérdida de interacción en los enlaces.
