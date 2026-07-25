# Diseño de interfaz en cajas

> **Estado: dirección descartada.** La fuente de verdad actual es [`DESIGN.md`](../../../DESIGN.md), con superficies redondeadas, sombras suaves y controles de 8–10 px de radio. La encuesta comunitaria descrita más abajo fue retirada.

## Objetivo

Aplicar a toda la web un lenguaje visual de paneles contiguos inspirado en la referencia proporcionada, conservando la identidad de Ferreras SMP: paleta negra y violeta, tipografías, contenido, logo y modos claro y oscuro.

## Sistema visual

- El contenido vive dentro de un marco central con bordes verticales finos.
- Cabecera, secciones, páginas interiores y pie se conectan mediante separadores horizontales de `1px`.
- Las tarjetas dejan de flotar: sin sombras decorativas, con radios mínimos y bordes compartidos cuando estén agrupadas.
- Botones, navegación, menús, etiquetas, campos y controles adoptan una forma rectangular, compacta y delimitada.
- El violeta sigue reservado para acciones, estados activos y énfasis.
- El espaciado interior mantiene la legibilidad; las cajas se pegan entre sí, no su contenido.

## Alcance

El cambio se aplica mediante los estilos globales y las clases compartidas existentes a:

- cabecera, navegación de escritorio y móvil;
- portada y todas sus secciones;
- páginas de guía, preguntas, normas y mods;
- listado y detalle del blog;
- tarjetas de estado, actividad, votación y jugadores;
- pie de página;
- modos claro, oscuro, móvil y escritorio.

No se modificarán el contenido, la jerarquía de páginas, la funcionalidad, los datos ni los componentes salvo que una envoltura mínima sea imprescindible para conseguir bordes continuos.

## Implementación

Se reutilizarán `.shell`, los tokens CSS y los componentes actuales. El cambio se concentrará en `src/styles/global.css`; solo se editará marcado Astro cuando CSS no pueda expresar correctamente una unión entre paneles.

Los cambios locales existentes del logo y favicon se conservarán.

## Verificación

- Ejecutar la compilación de Astro.
- Revisar portada, una página interior y una entrada del blog en escritorio y móvil.
- Comprobar navegación, menús, botones, foco visible y ambos temas.
- Confirmar que no aparecen bordes dobles, desbordamientos horizontales ni separaciones accidentales entre paneles.
