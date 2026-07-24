# Logo de Ferreras SMP

## Objetivo

Sustituir la letra «F» actual por el símbolo proporcionado en la cabecera, el pie y el favicon.

## Diseño

- Usar `public/brand-mark.svg` para mostrar el símbolo sin fondo en la cabecera y el pie.
- Mostrarlo a 33 × 44 px y 36 × 48 px en pantallas grandes.
- Mantener el símbolo blanco en modo oscuro y negro en modo claro para conservar el contraste.
- Usar `public/logo.svg` como favicon, con fondo `#8B5CF6`, esquinas redondeadas y el símbolo blanco centrado.
- Mantener sin cambios el texto, la disposición y la accesibilidad de la marca.

## Interacción

- Al pasar el ratón sobre la marca, el símbolo subirá 2 px, girará 3 grados y crecerá un 6 % durante 150 ms.
- El movimiento se desactivará cuando el sistema solicite movimiento reducido.
- El símbolo no se podrá seleccionar ni arrastrar, pero el enlace completo seguirá siendo pulsable.

## Implementación

Los componentes `Header.astro` y `Footer.astro` mostrarán la imagen decorativa y desactivarán su arrastre nativo. Los estilos globales controlarán tamaño, contraste, selección y animación. `Layout.astro` apuntará el favicon al recurso con fondo.

## Verificación

- Ejecutar la comprobación de Astro.
- Confirmar que la cabecera y el pie muestran la marca transparente.
- Confirmar que el favicon conserva el fondo violeta.
- Confirmar que el hover funciona y que la imagen no se puede seleccionar ni arrastrar.
