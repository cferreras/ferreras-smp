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
