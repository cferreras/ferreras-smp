# Diseñar la sección en vivo dividida

Esta especificación sustituye la franja compacta de estado por una sección completa bajo el hero. Mantiene la API, los datos, la actualización automática y los estados actuales.

## Objetivo

La sección debe presentar jugadores conectados y actividad reciente con la misma jerarquía. El resultado debe integrarse con el sistema visual basado en Manrope, superficies redondeadas y acento violeta.

## Estructura

La sección aparece inmediatamente después del hero y contiene:

1. Una cabecera con “Ahora en Ferreras SMP”, estado online u offline y hora de actualización
2. Un resumen con jugadores conectados, día del mundo y TPS
3. Dos paneles de igual tamaño:
   - Jugadores conectados con avatares
   - Actividad reciente en forma de timeline
4. Un mensaje de actualización, error o reintento

## Comportamiento

En escritorio, jugadores y actividad permanecen visibles. No requieren dropdowns.

En móvil, los paneles se apilan con jugadores primero y actividad después. Los datos mantienen su orden semántico y objetivos táctiles de al menos 44 px.

La implementación conserva:

- Endpoints y selectores de actualización
- Lista de jugadores y avatares
- Agrupación de actividad
- Estados vacíos
- Estado online, offline y sin datos
- Carga, datos desactualizados, error y reintento
- Analítica y anuncios accesibles

## Criterios de aceptación

- Jugadores y actividad reciben el mismo espacio visual
- La sección no parece una franja ni una colección de métricas
- El contenido permanece visible en escritorio
- La composición se apila sin desbordamiento en móvil
- Los datos en vivo se actualizan sin cambiar contratos
- Los temas claro y oscuro mantienen contraste y jerarquía
