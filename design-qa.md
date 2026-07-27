# Design QA — sección «En directo»

- source visual truth path: `C:/Users/carlo/.codex/generated_images/019fa2d0-2462-76b2-affe-82c3116d0fc0/call_GA0qWPz3DtkfscNRDXJT7Eep.png`
- implementation screenshot path: `C:/Users/carlo/.codex/visualizations/2026/07/27/019fa2d0-2462-76b2-affe-82c3116d0fc0/live-section-implementation-final.png`
- combined comparison path: `C:/Users/carlo/.codex/visualizations/2026/07/27/019fa2d0-2462-76b2-affe-82c3116d0fc0/live-section-comparison-final.png`
- viewport: referencia 1727 × 911 px; implementación 1728 × 891 CSS px
- source pixels: 1727 × 911
- implementation pixels: 1713 × 883, normalizados únicamente para la comparación lado a lado
- CSS size and density normalization: DPR 1; captura de implementación reescalada un 0,8 % para compartir lienzo con la referencia
- state: tema claro; servidor online; jugadores, día del mundo y actividad reciente con datos de muestra realistas
- browser-rendered evidence: escritorio 1728 × 891 y móvil 390 × 844
- primary interactions tested: botón «Reintentar» presente y accesible; estados dinámicos conservan la misma estructura
- console errors checked: sí; sin errores, solo mensajes de conexión de Vite

## Full-view comparison evidence

La referencia y la implementación se compararon juntas en un lienzo de 3454 × 911 px. Coinciden la jerarquía editorial, el ancho útil, el fondo de retícula y halo violeta, el título, la franja informativa con cuatro zonas, la división 36/64 y el tratamiento destacado del primer evento.

## Focused region comparison evidence

Se revisaron específicamente la franja de estado, la lista de jugadores y el feed de actividad. Los iconos proceden de Phosphor, las filas mantienen el ritmo y los avatares conservan el tratamiento pixelado. La implementación adapta el contenido variable del servidor sin depender de textos o cantidades fijas de la maqueta.

## Findings

- No quedan incidencias P0, P1 o P2.
- Diferencia intencional: la maqueta muestra tres jugadores y un evento con subtítulo promocional; la implementación usa los jugadores y mensajes reales disponibles en el modelo de datos.

## Comparison history

1. Primera implementación: estructura general correcta, pero sin iconos y con anchura y espaciado distintos.
2. Segunda comparación: se añadieron iconos, franja editorial, columnas 36/64 y evento principal destacado.
3. Comparación final: se amplió el ancho del bloque al 89,25 %, se igualaron avatares, alturas de fila y densidad del feed; escritorio y móvil quedaron sin desbordes.

## Follow-up polish

Ninguno requerido.

final result: passed

---

# Design QA — comentarios editoriales

- source visual truth path: `C:/Users/carlo/.codex/generated_images/019fa30c-43f9-7ce2-b013-a7ca547b07e6/call_rVZps1SsIyJOUP7yCIb79xlt.png`
- implementation screenshot path: `C:/Users/carlo/.codex/visualizations/2026/07/27/019fa30c-43f9-7ce2-b013-a7ca547b07e6/comments-option2-implementation-desktop-loaded2.png`
- combined comparison path: `C:/Users/carlo/.codex/visualizations/2026/07/27/019fa30c-43f9-7ce2-b013-a7ca547b07e6/comments-option2-comparison-loaded.png`
- responsive evidence: `C:/Users/carlo/.codex/visualizations/2026/07/27/019fa30c-43f9-7ce2-b013-a7ca547b07e6/comments-option2-implementation-mobile-pass3.png`
- viewport: escritorio 1313 × 1272 CSS px; móvil 360 × 900 CSS px
- source pixels: 1274 × 1235
- implementation pixels: 1298 × 1257 en escritorio; captura responsive de 345 × 885
- CSS size and density normalization: DPR 1; comparación lado a lado sin reescalado, con recortes verticales para alinear el inicio de la sección
- state: tema claro; vista de desarrollo con tres comentarios de muestra; vista normal sin Redis verificada en estado «Conversación en pausa»
- browser-rendered evidence: escritorio cargado, escritorio sin Redis, formulario móvil y lista editorial
- primary interactions tested: edición de Nick, escritura en el comentario, contador de 34 caracteres y control «Reintentar»
- console errors checked: sí; sin errores ni avisos

## Full-view comparison evidence

La referencia y la implementación se abrieron juntas en `comments-option2-comparison-loaded.png`. Coinciden el folio superior, el gran titular a una línea en escritorio, el contador alineado a la derecha, el formulario horizontal, el acento violeta y la lista continua con números de margen.

## Focused region comparison evidence

Se revisaron el encabezado, la identidad anónima, el área de escritura, el CTA y las filas de conversación. Manrope e IBM Plex Mono proceden de los tokens existentes; los avatares reutilizan las imágenes pixeladas del producto; el formulario mide 1200 × 345 px, el avatar principal 80 × 80 px y el área de texto 1154 × 128 px.

## Required fidelity surfaces

- Fonts and typography: familias, pesos, escala, interlineado y tracking coinciden con el sistema editorial del sitio y la referencia.
- Spacing and layout rhythm: folio, formulario, márgenes, divisores y numeración reproducen la composición seleccionada sin desbordes en 360 px.
- Colors and visual tokens: se reutilizan fondo, texto, bordes, foco y violeta del tema; no se introducen gradientes ni sombras ajenas al producto.
- Image quality and asset fidelity: todos los avatares son assets raster reales ya existentes, con `image-rendering: pixelated`; no hay sustitutos dibujados con CSS o SVG.
- Copy and content: el contenido está en español, conserva la identidad anónima y diferencia el estado real sin Redis de la muestra exclusiva de desarrollo.

## Findings

- No quedan incidencias P0, P1 o P2.
- Diferencia intencional: se omitieron «Responder» y cualquier hilo porque el alcance aprobado no incluye comentar comentarios.
- Diferencia intencional: la etiqueta de staff de la maqueta no se añade porque el contrato real de comentarios no expone ese atributo.

## Comparison history

1. Primera captura: el titular partía en dos líneas y la separación con el artículo era excesiva.
2. Segunda captura: se redujo la escala del titular, se acercó la sección al contenido y se integró el estado sin Redis.
3. Tercera captura: se corrigieron dos P2 de proporción —avatar principal demasiado pequeño y textarea demasiado alto—, pasando a 80 px y 128 px respectivamente.
4. Comparación final: se añadió una vista de muestra exclusiva de desarrollo para validar la lista cargada frente a la referencia; la URL normal conserva el `503` visualmente controlado.

## Follow-up polish

- P3 opcional: añadir una marca de staff cuando el backend incorpore un campo verificable para ese rol.

final result: passed
