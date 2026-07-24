---
name: Ferreras SMP
description: Supervivencia técnica, calmada y cercana a vanilla.
colors:
  background: "#000000"
  foreground: "#fafafa"
  surface: "#050505"
  muted: "#a1a1aa"
  muted-strong: "#d4d4d8"
  border: "#27272a"
  border-soft: "#18181b"
  violet: "#8b5cf6"
  violet-strong: "#7c3aed"
  violet-soft: "#2e1065"
  on-violet: "#ffffff"
  success: "#22c55e"
  danger: "#ef4444"
  focus: "#a78bfa"
typography:
  display:
    fontFamily: "Geist Pixel Square, Geist Mono, monospace"
    fontSize: "clamp(3.25rem, 5vw, 5.1rem)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "-0.065em"
  body:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  supporting:
    fontFamily: "Geist Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "0.12em"
rounded:
  flat: "0"
  control: "2px"
spacing:
  section-edge: "24px"
  content-edge: "72px"
  header: "72px"
components:
  button-primary:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.on-violet}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "46px"
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "46px"
  copy-server-address:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.on-violet}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "44px"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.flat}"
    padding: "26px"
---

# Design System: Ferreras SMP

## Overview

**Creative North Star: "El panel técnico del mundo"**

Ferreras SMP combina la legibilidad directa de una consola con la presencia material de Minecraft. La interfaz es sobria, modular y tranquila: superficies negras o blancas, líneas finas, tipografía monoespaciada y un violeta reservado para acciones y datos relevantes.

La densidad es informativa, no recargada. La cuadrícula, los bordes rectos y los estados explícitos hacen que el sitio se sienta fiable para jugadores técnicos sin exigir conocimientos avanzados. La imagen oficial aporta el carácter del juego; la interfaz evita decoración ajena a esa identidad.

**Key Characteristics:**

- Geometría recta y modular, casi sin redondeo.
- Alto contraste con un único acento violeta.
- Titulares pixelados y texto funcional monoespaciado.
- Profundidad mediante capas tonales y bordes, no mediante sombras.
- Movimiento breve, opcional y respetuoso con reducción de movimiento.

## Colors

La paleta parte de negro puro y blancos fríos, con grises zinc para jerarquía y un violeta técnico como única voz de acción.

### Primary

- **Violeta de redstone**: identifica acciones principales, palabras clave, indicadores y foco; se intensifica en hover y dispone de una variante oscura para fondos tonales.

### Neutral

- **Vacío**: fondo principal del tema oscuro y base de las superficies.
- **Luz fría**: texto de máximo contraste.
- **Zinc de interfaz**: texto secundario, bordes y separadores que estructuran sin competir.
- **Papel técnico**: el tema claro invierte la base a blanco frío y mantiene la misma jerarquía funcional.

### Named Rules

**The One Signal Rule.** El violeta es la única señal cromática de acción; verde y rojo se reservan para éxito, disponibilidad y error.

**The Theme Parity Rule.** Los temas claro y oscuro conservan las mismas relaciones semánticas, no colores idénticos a costa del contraste.

## Typography

**Display Font:** Geist Pixel Square (con Geist Mono como alternativa)
**Body Font:** Geist Mono (con monoespaciadas del sistema)
**Supporting Font:** Geist Sans (con sans-serif del sistema)

**Character:** Los titulares pixelados conectan con Minecraft sin imitar su interfaz. Geist Mono mantiene datos, instrucciones y navegación precisos; Geist Sans aparece solo cuando una explicación necesita una lectura más suave.

### Hierarchy

- **Display** (400, escala fluida, 0.92): titulares `h1` y `h2`, compactos y de alto impacto.
- **Title** (700, 18–22px): nombres de tarjetas, pasos y bloques funcionales.
- **Body** (400, 16px, 1.6): contenido general e instrucciones.
- **Supporting** (400, 15px, 1.55): proposiciones y explicaciones de lectura continua.
- **Label** (500, 11px, espaciado 0.12em, mayúsculas): categorías, estados y cejas.

### Named Rules

**The Pixel Headline Rule.** Geist Pixel Square se limita a titulares, marca y valores destacados; no se usa para párrafos.

## Layout

El sitio vive dentro de un marco central de hasta 1320px, ampliado a 1680px en pantallas muy grandes. Las secciones usan 24px de borde exterior y 72px de margen interior, con separación vertical fluida de 90–148px. Los layouts principales alternan dos columnas asimétricas y cuadrículas de tres columnas; a 980px se convierten en una sola columna y priorizan las acciones de conexión.

La retícula decorativa de 64px aparece con opacidad mínima en el fondo. Los bordes compartidos unen tarjetas y listas como módulos de un mismo panel. Los controles táctiles críticos mantienen al menos 44px de alto en móvil.

## Elevation & Depth

El sistema es plano por defecto. La profundidad procede de cambios tonales, bordes de 1px y, de forma puntual, halos violetas muy difusos o sombras bajo arte superpuesto. Las superficies de contenido y los controles normales no flotan.

### Named Rules

**The Flat-by-Default Rule.** Una tarjeta en reposo se separa con borde o tono; la sombra queda reservada para elementos físicamente superpuestos.

## Shapes

La forma dominante es rectangular y precisa. Contenedores y tarjetas usan esquinas cuadradas; botones y controles admiten un radio casi imperceptible de 2px. Los círculos quedan para puntos de estado y halos ambientales.

**The Two-Pixel Ceiling Rule.** Ningún control de interfaz supera 2px de radio salvo que su significado sea circular.

## Components

### Buttons

- **Shape:** rectangular con radio mínimo (2px), altura principal de 46px y peso 700.
- **Primary:** violeta de redstone con texto blanco; el hover usa el violeta fuerte.
- **Secondary:** superficie neutra, borde zinc y texto de alto contraste; el hover mezcla el borde con violeta.
- **Hover / Focus:** transiciones de color de 150ms y contorno visible de 2px con offset de 3px.

### Cards / Containers

- **Corner Style:** esquinas cuadradas.
- **Background:** superficie base o ligeramente elevada.
- **Shadow Strategy:** sin sombra en reposo.
- **Border:** 1px, a menudo compartido entre módulos contiguos.
- **Internal Padding:** 26px en tarjetas principales y 20–30px en módulos compactos.

### Navigation

La cabecera permanece fija, con marca a la izquierda, enlaces compactos y acciones a la derecha. Los estados activo y hover se expresan por tono y color, nunca por animaciones expansivas. En móvil, la navegación pasa a un menú de 200px con filas separadas y objetivos táctiles de 44px.

### Server Address

La dirección es un dato seleccionable y su botón “Copiar IP” es la acción principal. El éxito y el error se anuncian en el mismo control sin afirmar éxito antes de confirmarlo.

### Live Status

El estado del servidor se presenta como una tira de cuatro módulos. Los datos interactivos predicen exactamente el contenido que revelan; disponibilidad es un estado estático, mientras jugadores y actividad tienen controles explícitos.

## Do's and Don'ts

### Do:

- **Do** usar bordes, ritmo y contraste para estructurar antes de añadir sombras.
- **Do** reservar el violeta para acciones, foco y datos que merecen atención.
- **Do** mantener texto de estado visible, factual y accesible.
- **Do** preservar objetivos táctiles mínimos de 44px y foco de teclado claro.

### Don't:

- **Don't** redondear tarjetas o convertir la interfaz en una colección de píldoras.
- **Don't** introducir más colores de acento para decorar.
- **Don't** usar la fuente pixelada en texto largo.
- **Don't** fabricar métricas, disponibilidad o confirmaciones de acción.
