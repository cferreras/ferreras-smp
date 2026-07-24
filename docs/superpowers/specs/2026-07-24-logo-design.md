# Logo de Ferreras SMP

## Objetivo

Sustituir la letra «F» actual por el símbolo proporcionado, centrado dentro de un cuadro violeta, y usar la misma marca en la cabecera, el pie y el favicon.

## Diseño

- Crear un único recurso SVG en `public/logo.svg`.
- Usar un lienzo cuadrado con fondo `#8B5CF6` y esquinas redondeadas.
- Dibujar el símbolo proporcionado en blanco, escalado proporcionalmente y centrado ópticamente con margen interior uniforme.
- Mostrar el recurso dentro de los tamaños actuales de `.brand-mark`: 36 × 36 px y 40 × 40 px en pantallas grandes.
- Reutilizar `/logo.svg` como favicon.
- Mantener sin cambios el texto, la disposición y la accesibilidad de la marca.

## Implementación

Los componentes `Header.astro` y `Footer.astro` reemplazarán la letra por una imagen decorativa dentro de `.brand-mark`. `Layout.astro` apuntará el favicon al mismo recurso. Los estilos existentes conservarán el tamaño del contenedor y eliminarán las reglas tipográficas que ya no sean necesarias.

## Verificación

- Ejecutar la comprobación de Astro.
- Confirmar en el navegador que el símbolo queda centrado en cabecera y pie.
- Confirmar que el favicon carga el mismo logo.
