# Diseño de la web de Ferreras SMP

## Objetivo

Crear una web estática, rápida y responsive para `mc.ferreras.dev` que explique qué es Ferreras SMP y permita encontrar inmediatamente la IP, el Discord, las normas y los mods instalados.

El servidor se presenta como una experiencia de supervivencia sencilla y cercana a vanilla. Los jugadores no necesitan instalar mods para entrar.

## Dirección visual

La web tendrá una estética contemporánea, clara y sobria. No utilizará tipografías pixeladas, bloques, texturas de césped ni otros recursos visuales típicos de las webs de Minecraft.

- Fondo cálido casi blanco.
- Texto oscuro de alto contraste.
- Verde natural como acento discreto.
- Tipografía con personalidad para titulares y una sans serif muy legible para el cuerpo.
- Mucho espacio en blanco, líneas finas y tarjetas contenidas.
- Animaciones breves y sutiles, respetando `prefers-reduced-motion`.

El resultado debe sentirse profesional, tranquilo y accesible, no corporativo ni excesivamente elaborado.

## Arquitectura

La primera versión se construirá con Astro y se generará como una web completamente estática. Astro aporta componentes y una estructura ampliable sin enviar JavaScript innecesario al navegador.

Estructura prevista:

- `src/pages/index.astro`: composición de la página principal.
- `src/layouts/Layout.astro`: documento base, metadatos y estructura compartida.
- `src/components/`: cabecera, portada, información, normas, listado de mods, llamada final y pie.
- `src/data/server.ts`: IP, Discord, normas, categorías y nombres de mods.
- `src/styles/global.css`: variables visuales, layout, componentes y responsive.
- `public/`: iconos y recursos estáticos, si fueran necesarios.

El proyecto no incorporará React, Vue ni otras capas de cliente. El JavaScript se limitará al menú móvil y a copiar la IP, manteniendo la página ligera.

Los datos que probablemente cambien —IP, Discord, normas y agrupaciones de mods— estarán centralizados en un único módulo para poder editarlos sin rediseñar la página.

## Jerarquía y secciones

### Cabecera

Cabecera compacta con el nombre Ferreras SMP, navegación por anclas y acceso destacado a Discord. En móvil se convertirá en un menú accesible.

### Portada

Será la sección principal e incluirá:

- Nombre: Ferreras SMP.
- Descripción breve de la experiencia.
- Etiqueta: “Supervivencia · Sin mods requeridos”.
- IP `mc.ferreras.dev`, visible y copiable.
- Botón para entrar al Discord: `https://discord.gg/pDTYt64tFm`.

La acción de copiar confirmará visualmente el resultado sin depender únicamente del color.

### Información

Explicará que es un servidor de supervivencia sencillo, con mejoras técnicas del lado servidor y contenido adicional que no obliga al jugador a modificar su cliente.

Mostrará tres ideas clave:

- Supervivencia cercana a vanilla.
- Entrada directa sin instalar mods.
- Comunidad y soporte mediante Discord.

No se inventarán versión de Minecraft, número de jugadores, disponibilidad permanente ni otras características no confirmadas.

### Normas

Lista breve, clara y numerada:

1. No utilizar trampas, clientes modificados o ventajas injustas.
2. No atacar, saturar, explotar errores ni intentar perjudicar el servidor.
3. No romper, robar o modificar construcciones y pertenencias ajenas.
4. No construir excesivamente cerca de otros jugadores sin su permiso.
5. No acosar, provocar, hacer spam ni molestar deliberadamente.
6. Seguir las indicaciones del equipo y avisar de problemas por Discord.

Se indicará que prima el sentido común y que las normas pueden ampliarse cuando sea necesario.

### Mods y datapacks

La lista se mostrará con nombres legibles y agrupada para evitar una pared de identificadores:

**Rendimiento y estabilidad**

- Alternate Current
- C2ME
- Clumps
- FerriteCore
- Lithium
- ModernFix
- Noisium Forked
- ScalableLux
- ServerCore
- VMP
- View Distance Fix

**Administración, seguridad y diagnóstico**

- Anti-Xray
- BanHammer
- BlueMap
- Carpet
- Chunky
- EasyAuth
- Ledger y Ledger Databases
- LuckPerms
- Proxy Protocol Support
- Spark

**Experiencia y comunidad**

- Almanac
- Armed Stands
- Collective
- Discord MC Chat
- RightClickHarvest
- Server Day Counter
- Villager Names

**Dependencias técnicas**

- Cloth Config
- Fabric API
- Fabric Language Kotlin
- Fabric Loader / LMD

**Datapacks**

- Tectonic
- Explorify
- Vanilla Structure Update
- AMH
- ServerSleep
- Craft Elytra
- SMP Starter

Los mods se presentarán inicialmente en grupos desplegables para mantener la página limpia. Se añadirá una nota indicando que son mejoras del servidor y que el visitante no necesita instalarlos.

### Cierre y pie

Última invitación a copiar la IP o entrar al Discord. El pie mostrará el nombre del servidor, el dominio y el año actual.

## Comportamiento responsive y accesibilidad

- Diseño fluido desde móvil hasta escritorio.
- Navegación y controles utilizables con teclado.
- Foco visible.
- Contraste suficiente.
- HTML semántico con títulos en orden lógico.
- Botones y enlaces con etiquetas claras.
- Soporte para movimiento reducido.
- La información esencial seguirá disponible si JavaScript está desactivado.

## Extensibilidad

La estructura permitirá añadir nuevas secciones sin rehacer la portada, por ejemplo:

- Estado en tiempo real y jugadores conectados.
- Mapa BlueMap.
- Noticias o actualizaciones.
- Equipo y formas de contacto.
- Preguntas frecuentes.
- Galería.

Cada sección será un componente Astro independiente y reutilizará los mismos componentes visuales y variables CSS.

## Verificación

Antes de entregar se comprobará:

- Visualización en anchos de móvil y escritorio.
- Navegación por anclas y menú móvil.
- Copia de la IP y mensaje de confirmación.
- Enlace correcto de Discord.
- Navegación con teclado.
- Ausencia de desbordamiento horizontal.
- Contenido legible sin JavaScript.
- Compilación estática de Astro sin errores.

## Fuera de alcance en esta versión

- Backend o panel de administración.
- Consulta automática del estado del servidor.
- Integración embebida de BlueMap.
- Sistema de noticias dinámico.
- Analítica, cuentas o formularios.
