---
name: Ferreras SMP
description: Supervivencia clara, tranquila y cercana a vanilla.
colors:
  background-dark: "#000000"
  background-light: "#fafafa"
  foreground-dark: "#fafafa"
  foreground-light: "#09090b"
  surface-dark: "#050505"
  surface-light: "#ffffff"
  muted-dark: "#a1a1aa"
  muted-light: "#71717a"
  violet: "#8b5cf6"
  violet-strong: "#7c3aed"
  success: "#22c55e"
  danger: "#ef4444"
typography:
  display:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.065em"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  data:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontWeight: 500
rounded:
  control: "8px"
  card: "12px"
  large: "18px"
spacing:
  shell: "1200px"
  header: "72px"
---

# Sistema visual de Ferreras SMP

## Dirección

Ferreras SMP usa el lenguaje visual anterior a la migración a Geist. La interfaz combina una base clara o AMOLED, superficies redondeadas, sombras suaves y un acento violeta reconocible.

La prioridad es presentar un servidor tranquilo y accesible. Las ilustraciones de Minecraft aportan personalidad, mientras Manrope mantiene la lectura limpia y profesional.

## Tipografía

Manrope se usa en navegación, titulares, cuerpo, botones y tarjetas. Los titulares emplean pesos 700 u 800 y un interletrado compacto.

IBM Plex Mono se reserva para la IP, datos en vivo, etiquetas técnicas y marcas temporales. Ningún texto usa Geist o Geist Pixel.

## Color y temas

El tema oscuro usa negro puro, blanco frío y superficies casi negras. El tema claro usa blanco zinc, texto casi negro y tarjetas blancas. El violeta identifica acciones, enlaces importantes y foco.

Verde y rojo se reservan para disponibilidad, éxito y error.

## Forma y profundidad

Las tarjetas usan radios de 12 px y bordes finos. Los botones usan radios de 8 a 10 px. Las sombras aparecen en acciones principales, menús y elementos superpuestos.

La cuadrícula tenue del fondo y los halos violetas pueden aportar profundidad sin competir con el contenido.

## Componentes

- La cabecera usa navegación compacta dentro de una superficie redondeada
- El hero combina titular, personajes de Minecraft, IP y acciones
- El estado en vivo ocupa una sección editorial propia: resumen superior y dos paneles equilibrados para jugadores y actividad reciente
- Las secciones informativas usan tarjetas amplias, listas y separadores
- El tema claro y oscuro conservan la misma jerarquía

## Accesibilidad

Los controles mantienen foco visible, estados anunciados y objetivos táctiles de al menos 44 px en móvil. Los datos en vivo se leen directamente, sin depender de desplegables o diálogos.
