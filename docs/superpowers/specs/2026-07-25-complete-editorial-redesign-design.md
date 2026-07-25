# Rediseñar Ferreras SMP con una dirección editorial

Esta especificación define el rediseño visual completo de Ferreras SMP. Conserva las rutas, el contenido factual, la integración en vivo y las acciones existentes. Sustituye el sistema visual actual por una identidad editorial, profesional y centrada en entrar al servidor.

## Plan del documento

- **Objetivo**: definir una interfaz coherente que permita copiar la IP y entender el servidor desde la primera pantalla
- **Audiencia**: jugadores de Minecraft Java hispanohablantes, con experiencia técnica básica o intermedia
- **Tipo de contenido**: especificación conceptual
- **Alcance**: portada, páginas informativas, blog, componentes globales, temas, estados interactivos y comportamiento responsive
- **Pregunta cerrada**: el rediseño conserva el violeta como acento y reemplaza el resto del lenguaje visual

## Objetivo del rediseño

El sitio debe transmitir profesionalidad y claridad. La primera pantalla debe permitir copiar `mc.ferreras.dev`, comprobar el estado del servidor y abrir la guía de acceso sin recorrer la página.

El rediseño debe mantener estos principios:

- La interfaz prioriza la IP y la entrada al servidor
- Las imágenes de Minecraft reciben tratamiento editorial y ocupan superficies amplias
- El espacio, la escala tipográfica y la composición crean jerarquía
- El violeta identifica acciones, foco y estados relevantes
- Los temas claro y oscuro ofrecen el mismo nivel de acabado
- Los elementos pixelados funcionan como detalle de marca, no como tipografía principal

## Dirección visual

La dirección aprobada se llama «editorial técnico». Combina fotografía de Minecraft a gran escala con una interfaz sobria y precisa.

El tema claro utiliza un blanco cálido, texto casi negro y superficies neutras. El tema oscuro utiliza negro carbón, texto blanco suave y superficies ligeramente elevadas. Ambos temas comparten un violeta reconocible como acento. Los colores verde y rojo se reservan para disponibilidad y error.

Manrope organiza la marca, los titulares, la navegación y la lectura. IBM Plex Mono identifica la IP, los datos en vivo y las etiquetas funcionales.

Las composiciones alternan imagen y texto con proporciones asimétricas. Las imágenes pueden ocupar el ancho completo o sobrepasar la cuadrícula de contenido cuando esto refuerce el ritmo editorial. Los bordes, radios y sombras deben ser discretos.

## Arquitectura de la portada

La portada sigue una secuencia de decisión:

1. **Entrada inmediata**: imagen editorial, propuesta breve, IP, acción para copiarla, estado en vivo y enlace a la guía
2. **Propuesta del servidor**: tres ideas esenciales explican la experiencia, la protección de terrenos y la ausencia de modpack obligatorio
3. **Normas principales**: resumen escaneable con acceso a las normas completas
4. **Mods opcionales**: presentación clara que no comunica un requisito de instalación
5. **Guías recientes**: selección del blog basada en imágenes y títulos
6. **Cierre de conversión**: IP, guía de acceso y Discord

Discord actúa como canal secundario de comunidad y soporte. No compite con copiar la IP en la primera pantalla.

## Primera pantalla

El primer viewport combina una imagen de Minecraft de gran escala con un bloque funcional compacto. Este bloque incluye:

- Nombre y propuesta del servidor
- IP seleccionable
- Botón «Copiar IP»
- Estado online u offline
- Número de jugadores conectados
- Acción «Cómo entrar»
- Acceso secundario a Discord

En escritorio, la imagen y el bloque funcional forman una composición asimétrica. En móvil, la IP, el estado y «Cómo entrar» aparecen antes de cualquier detalle secundario.

## Estado del servidor y actividad reciente

El rediseño conserva la integración actual con la API y sus contratos de datos. No cambia los endpoints, la actualización automática ni la instrumentación analítica.

El resumen visible muestra:

- Estado online u offline
- Jugadores conectados y capacidad máxima
- Marca temporal de actualización cuando sea relevante

Un control explícito abre un panel con:

- Lista de jugadores conectados
- Avatares de Minecraft
- Actividad reciente
- Mensajes para listas vacías

El panel aparece junto al bloque de conexión en escritorio. En móvil, usa el ancho disponible y mantiene objetivos táctiles de 44 px.

Los estados de la integración son:

- **Carga**: comunica que el sitio está actualizando los datos
- **Disponible**: muestra los datos recibidos
- **Servidor offline**: diferencia la indisponibilidad del servidor de un fallo de red
- **Datos desactualizados**: conserva el último dato válido y comunica su antigüedad
- **Error**: explica que no se pudo actualizar e incluye «Reintentar»

El sitio no confirma una actualización o una copia de IP antes de recibir la confirmación correspondiente.

## Páginas internas

Todas las páginas comparten cabecera, pie, tokens, controles, anchuras y estados de interacción. Cada página conserva su función:

- `/como-entrar`: guía secuencial con IP visible y pasos de conexión
- `/normas`: lectura estructurada de las seis normas y sus ejemplos
- `/mods-recomendados`: catálogo de mods opcionales con enlaces externos
- `/preguntas-frecuentes`: acordeones accesibles y enlace a la guía
- `/blog`: índice editorial de publicaciones
- `/blog/[slug]`: lectura cómoda, metadatos, imagen principal, conversión y contenido relacionado
- `/404`: recuperación clara mediante enlaces a la portada y a la guía

Las páginas mantienen sus títulos, descripciones, datos estructurados, canonicales, Open Graph, analítica y migas de pan.

## Sistema de componentes

El rediseño debe centralizar las decisiones visuales globales. Los componentes conservan responsabilidades específicas:

- `Layout`: metadatos, tema, analítica, estructura del documento y acceso al contenido
- `Header`: marca, navegación, selector de tema y acción principal
- `ServerAddress`: IP, selección, copia y confirmación accesible
- `ServerStatusStrip`: resumen en vivo y controles para jugadores y actividad
- `PlayerList`: jugadores conectados y estados vacíos
- `ActivityFeed`: actividad reciente y estados vacíos
- Componentes de portada: narrativa y enlaces a las páginas completas
- Layout de blog: jerarquía de lectura, metadatos y conversión

Los tokens globales definen color, tipografía, espacio, anchuras, radios, movimiento y foco. Los estilos específicos de página solo resuelven composiciones propias.

## Interacción y movimiento

Las transiciones deben comunicar respuesta y jerarquía. Se permiten:

- Cambios breves de color y contraste
- Confirmación visual al copiar la IP
- Apertura y cierre del menú y del panel en vivo
- Aparición sutil de imágenes cuando entran en el viewport

No se permiten animaciones constantes, desplazamientos decorativos ni efectos que oculten contenido. `prefers-reduced-motion` desactiva el movimiento no esencial.

## Diseño responsive

El diseño móvil adapta la composición en lugar de apilar sin criterio la versión de escritorio.

- La IP y el estado aparecen en el primer viewport
- La navegación usa un control accesible y objetivos táctiles de 44 px
- Las imágenes conservan un recorte editorial definido
- Los titulares reducen escala y longitud de línea
- Las tablas visuales se convierten en listas cuando pierden legibilidad
- Los paneles desplegables ocupan el ancho disponible
- Los artículos mantienen una anchura de lectura y un tamaño de texto cómodos

Los puntos de control principales son 360 px, 768 px, 1024 px y 1440 px.

## Accesibilidad

La implementación debe conservar HTML semántico y navegación por teclado. Cada control necesita nombre accesible, foco visible y estado anunciado cuando cambie.

El sistema debe cumplir estos requisitos:

- Contraste WCAG AA para texto y controles
- Orden de foco equivalente al orden visual
- Enlace «Saltar al contenido»
- Estado `aria-expanded` en menús, acordeones y paneles
- Mensajes `aria-live` para copia de IP y actualización en vivo
- Texto alternativo descriptivo en imágenes editoriales
- Controles táctiles de 44 px como mínimo
- Compatibilidad con tema del sistema y preferencia guardada

## Rendimiento

La imagen principal utiliza el sistema de imágenes de Astro y evita desplazamientos de diseño. Las imágenes fuera del primer viewport cargan de forma diferida.

El rediseño no introduce un framework de cliente. El JavaScript se limita a tema, navegación, copia de IP, datos en vivo, analítica y movimiento progresivo. La página mantiene contenido útil cuando JavaScript no está disponible, excepto las actualizaciones dinámicas que dependen de la API.

## Conservación de contenido y funcionalidad

El rediseño conserva:

- Todas las rutas públicas y endpoints
- Contenido factual de `src/data/server.ts`
- Artículos y colección de contenido
- RSS, sitemap, robots y datos estructurados
- Analítica y atributos de seguimiento
- Tema claro y oscuro
- Copia de IP
- Estado del servidor, jugadores y actividad reciente
- Enlaces externos a Discord, CurseForge y Modrinth
- Tests y contratos de seguridad existentes

El trabajo no añade testimonios, métricas, garantías de disponibilidad ni afirmaciones que el repositorio no pueda demostrar.

## Verificación

La implementación debe superar:

1. `pnpm check`
2. `pnpm build`
3. Tests de copia de texto, estado en vivo y seguridad
4. Revisión de todas las rutas públicas
5. Revisión visual a 360 px, 768 px, 1024 px y 1440 px
6. Revisión de los temas claro y oscuro
7. Navegación completa con teclado
8. Estados de carga, disponible, offline, datos desactualizados, error y reintento
9. Verificación de que la analítica conserva sus atributos

## Criterios de aceptación

El rediseño se considera completo cuando:

- La primera pantalla permite copiar la IP y comprobar el estado sin desplazamiento
- La interfaz transmite una identidad editorial, profesional y coherente
- Las imágenes tienen protagonismo sin reducir la legibilidad
- Todas las rutas, contenidos y funciones existentes siguen disponibles
- El estado en vivo conserva jugadores, avatares, actividad y reintento
- Ambos temas mantienen contraste y jerarquía equivalentes
- La experiencia móvil prioriza conexión y estado
- El proyecto supera las verificaciones técnicas y visuales
