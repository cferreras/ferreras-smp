# Plan SEO de Ferreras SMP: calendario y guía de ejecución

> Documento operativo para ejecutar con ChatGPT/Codex en sesiones sucesivas.
>
> Duración inicial: 90 días  
> Sitio: `https://mc.ferreras.dev`  
> Objetivo: atraer jugadores de Minecraft Java survival en español y convertir visitas orgánicas en jugadores recurrentes.

## 1. Cómo utilizar este documento

Este archivo funciona como hoja de ruta y como especificación para ChatGPT. En cada sesión se debe seleccionar una única tarea o un grupo pequeño de tareas relacionadas, proporcionar el identificador de la tarea y pedir que se implemente y verifique.

Ejemplo:

```text
Ejecuta la tarea SEO-01 del documento
docs/seo-calendario-ejecucion-90-dias.md.

Revisa primero el estado actual del repositorio, implementa la tarea completa,
ejecuta las comprobaciones indicadas y actualiza el estado de la tarea en el
documento. No hagas commit ni despliegue salvo que te lo pida expresamente.
```

Reglas para todas las sesiones:

1. Leer este documento y `AGENTS.md` antes de modificar archivos.
2. Inspeccionar `git status` y preservar cambios existentes del usuario.
3. En este proyecto Node se utiliza siempre `pnpm`, nunca `npm`.
4. Si es necesario iniciar Astro, usar `astro dev --background` y gestionar el proceso con `astro dev status`, `astro dev logs` y `astro dev stop`.
5. Consultar la documentación oficial de Astro antes de cambiar rutas, componentes, colecciones de contenido o estilos.
6. No inventar la versión compatible de Minecraft, cifras de jugadores, testimonios ni características del servidor.
7. Todo dato variable debe proceder de la configuración del proyecto o ser confirmado por el propietario.
8. No realizar commits, pushes, despliegues, publicaciones externas ni cambios en Search Console sin autorización explícita.
9. Finalizar cada tarea con validación técnica y un resumen de archivos modificados.
10. Actualizar la casilla de estado de este documento solamente cuando todos los criterios de aceptación se hayan cumplido.

### Leyenda de estados

- `[ ]` Pendiente.
- `[-]` En curso o parcialmente completada.
- `[x]` Completada y verificada.
- `[!]` Bloqueada por credenciales, información o decisión del propietario.

## 2. Resultado esperado a los 90 días

Al finalizar este ciclo, Ferreras SMP debería disponer de:

- Una portada orientada a la búsqueda principal sin perder la identidad visual.
- Páginas independientes para normas y mods recomendados.
- Un blog nativo de Astro con artículos, imágenes sociales, RSS y sitemap.
- Un sistema consistente de títulos, descripciones, canonical y datos estructurados.
- Al menos ocho guías útiles y tres publicaciones propias de la comunidad.
- Enlaces internos que conduzcan desde las guías hacia la IP, Discord y la página para entrar.
- Medición de copias de IP, clics en Discord y visitas a las guías.
- Google Search Console configurado y revisado semanalmente.
- Un procedimiento editorial sostenible para continuar publicando.

La métrica principal no será el número de artículos ni el tráfico aislado:

> Nuevos jugadores procedentes de búsqueda que vuelven a conectarse durante los siete días siguientes.

## 3. Posicionamiento y mapa de búsquedas

Propuesta de posicionamiento, pendiente de confirmar que la comunidad se presenta públicamente como española o hispanohablante:

> Ferreras SMP es un servidor de Minecraft Java survival en español, sin modpack obligatorio, tranquilo, protegido y orientado a la comunidad.

### Grupos de búsqueda

| Grupo | Intención | Página objetivo |
| --- | --- | --- |
| servidor minecraft survival en español | Encontrar servidor | `/` |
| servidor minecraft java survival | Encontrar servidor | `/` |
| servidor minecraft sin mods | Encontrar servidor compatible | `/` y artículo específico |
| IP Ferreras SMP | Entrar al servidor | `/como-entrar` |
| cómo entrar a un servidor Minecraft Java | Aprender y entrar | `/como-entrar` y artículo |
| normas servidor Minecraft | Evaluar convivencia | `/normas` |
| mods recomendados Minecraft survival | Informarse | `/mods-recomendados` |
| proteger terreno Minecraft | Resolver problema | Artículo de reclamaciones |
| no puedo entrar a servidor Minecraft | Solucionar error | Artículo de diagnóstico |

No se crearán varias páginas casi idénticas para variaciones de una misma búsqueda. Cada página debe resolver una intención concreta.

## 4. Calendario maestro de 90 días

Las fechas exactas se calculan desde el lunes en el que comience la ejecución. Si una semana se retrasa, se desplazan las publicaciones posteriores sin reducir las comprobaciones de calidad.

| Semana | Trabajo técnico | Contenido o evento | Resultado de la semana |
| --- | --- | --- | --- |
| 1 | Auditoría, medición y línea base | Confirmar posicionamiento y datos reales | Panel inicial y decisiones cerradas |
| 2 | Mejorar portada y conversiones | Actualizar mensajes de portada | Página principal preparada para búsqueda |
| 3 | Crear páginas `/normas` y `/mods-recomendados` | Ampliar contenido existente | Dos nuevas páginas indexables |
| 4 | Construir infraestructura del blog | Publicar artículo 1 | Blog, plantilla, RSS y primer artículo |
| 5 | Mejorar schema, breadcrumbs y enlaces internos | Publicar artículo 2 | Arquitectura conectada |
| 6 | Optimización de imágenes y rendimiento | Publicar artículo 3 | Menor peso y mejores métricas web |
| 7 | Revisión de indexación y snippets | Publicar artículo 4 | Primer bloque de contenido fundamental |
| 8 | Añadir artículos relacionados y bloque del blog en portada | Publicar artículo 5 | Mejor distribución interna |
| 9 | Preparar capturas y casos propios | Publicar historia de comunidad 1 | Primera pieza original del servidor |
| 10 | Optimizar según consultas reales | Publicar artículo 6 | Primer ciclo basado en Search Console |
| 11 | Distribución y menciones externas | Publicar artículo 7 | Mayor descubrimiento fuera del sitio |
| 12 | Auditoría del ciclo y backlog siguiente | Resumen mensual y artículo 8 | Informe de 90 días y próximo plan |

### Ritmo semanal recomendado

| Día | Evento recurrente | Duración aproximada |
| --- | --- | --- |
| Lunes | Revisar Search Console, analítica, indexación y errores | 30–45 min |
| Martes | Investigar y preparar el esquema del artículo | 45–60 min |
| Miércoles | Redactar y añadir capturas o ejemplos reales | 60–120 min |
| Jueves | Revisión editorial, SEO, enlaces y validación técnica | 45–60 min |
| Viernes | Publicar, solicitar indexación y distribuir | 30–45 min |
| Último día del mes | Revisar jugadores adquiridos y retenidos | 60 min |

La publicación puede ser semanal, pero nunca debe forzarse si faltan ejemplos propios, información actual o tiempo para revisar.

## 5. Fase 1: línea base y medición

### SEO-01 — Auditoría técnica y línea base

Estado: `[x]`  
Calendario: semana 1  
Dependencias: ninguna  
Responsable principal: ChatGPT  
Participación manual: acceso a producción y herramientas de analítica

#### Ejecución

1. Revisar títulos, descripciones, canonical, Open Graph y JSON-LD de todas las páginas.
2. Comprobar `robots.txt` y los archivos del sitemap en producción.
3. Confirmar códigos HTTP de `/`, páginas válidas y una URL inexistente.
4. Revisar navegación, encabezados H1–H3, textos alternativos y enlaces internos.
5. Ejecutar build y comprobación de Astro.
6. Ejecutar una medición móvil y escritorio con PageSpeed Insights o Lighthouse.
7. Documentar la línea base sin modificar todavía el diseño.

#### Entregable

Crear `docs/seo-auditoria-inicial.md` con:

- Fecha de auditoría.
- URLs revisadas.
- Problemas clasificados como P0, P1 y P2.
- Estado de indexación conocido.
- LCP, INP y CLS cuando existan datos.
- Peso de los principales recursos.
- Recomendaciones que difieran de este plan.

#### Criterios de aceptación

- [x] Todas las rutas públicas están inventariadas.
- [x] Se han comprobado robots, sitemap, canonical y códigos HTTP.
- [x] Existe una línea base de rendimiento o se documenta por qué no se pudo obtener.
- [x] No se han inventado datos de Search Console ni de producción.

#### Instrucción para ChatGPT

```text
Ejecuta SEO-01. Haz una auditoría de solo lectura del repositorio y de producción.
Crea docs/seo-auditoria-inicial.md con evidencias, prioridades y línea base.
No implementes todavía las correcciones encontradas.
```

### SEO-02 — Configurar medición del embudo

Estado: `[ ]`  
Calendario: semana 1  
Dependencias: SEO-01  
Responsable principal: ChatGPT + propietario

#### Eventos que se deben medir

- `copy_server_ip`
- `click_discord`
- `view_join_guide`
- `view_blog_post`
- `click_related_article`
- `open_server_status`

#### Ejecución

1. Detectar si el proyecto ya utiliza una herramienta de analítica.
2. Si no existe, presentar al propietario una elección entre una solución respetuosa con la privacidad y GA4 antes de instalar nada.
3. Crear un módulo único para emitir eventos y evitar llamadas dispersas.
4. Instrumentar copias de IP y clics en Discord en todos los componentes relevantes.
5. Evitar enviar nombres de jugadores, IP, UUID u otros datos personales.
6. Crear una invitación de Discord específica para la web si el propietario lo autoriza.
7. Documentar cómo comprobar los eventos en desarrollo y producción.

#### Criterios de aceptación

- [ ] Los eventos tienen nombres y propiedades consistentes.
- [ ] La web sigue funcionando si el proveedor de analítica está bloqueado.
- [ ] No se recogen datos personales de Minecraft.
- [ ] Existe una guía de verificación.

## 6. Fase 2: portada y páginas fundamentales

### SEO-03 — Reorientar la portada

Estado: `[ ]`  
Calendario: semana 2  
Dependencias: confirmación del posicionamiento

#### Texto propuesto

- Title: `Servidor Minecraft Survival en español | Ferreras SMP`
- H1: `Servidor Minecraft survival para jugar a tu ritmo`
- Descripción: `Ferreras SMP es un servidor Minecraft Java survival en español, sin modpack obligatorio, con comunidad tranquila y protección de terrenos. IP: mc.ferreras.dev.`

El texto debe ajustarse si “en español”, “protección de terrenos” o cualquier otra característica no describe exactamente el servidor.

#### Ejecución

1. Actualizar title, H1 y descripción sin perder el tono actual.
2. Mantener una sola etiqueta H1.
3. Mostrar la IP y la acción de copiarla cerca del primer CTA.
4. Añadir una introducción explícita que explique qué es Ferreras SMP.
5. Añadir enlaces a `/como-entrar`, `/normas` y `/mods-recomendados` cuando existan.
6. Añadir un espacio para las tres publicaciones más recientes cuando el blog esté disponible.
7. Verificar móvil, escritorio, modo claro y modo oscuro.

#### Criterios de aceptación

- [ ] Minecraft, survival y Ferreras SMP aparecen de forma natural en title, H1 y texto visible.
- [ ] La IP puede copiarse sin buscarla por la página.
- [ ] El CTA principal tiene medición.
- [ ] No se rompe la jerarquía visual ni la accesibilidad.

### SEO-04 — Crear la página de normas

Estado: `[ ]`  
Calendario: semana 3  
Dependencias: SEO-03

Ruta: `/normas`

#### Contenido mínimo

- Resumen de la filosofía del servidor.
- Normas existentes completas.
- Ejemplos sencillos para reglas que puedan resultar ambiguas.
- Cómo informar de un problema.
- Consecuencias generales, solo si están confirmadas.
- CTA hacia `/como-entrar` y Discord.

La portada conservará un resumen y enlazará a la página completa. Los enlaces antiguos con `/#normas` pueden seguir funcionando.

#### Criterios de aceptación

- [ ] Página con title, descripción, canonical y H1 propios.
- [ ] Enlace desde header o menú de guía, portada y footer.
- [ ] No se contradicen las reglas almacenadas en `src/data/server.ts`.
- [ ] La página aparece en el sitemap.

### SEO-05 — Crear la página de mods recomendados

Estado: `[ ]`  
Calendario: semana 3  
Dependencias: SEO-03

Ruta: `/mods-recomendados`

#### Contenido mínimo

- Aclaración visible de que los mods de cliente son opcionales.
- Xaero’s Minimap.
- Xaero’s World Map.
- Open Parties and Claims.
- Para qué sirve cada uno.
- Requisitos e instrucciones solamente cuando estén verificadas.
- Enlaces hacia fuentes oficiales de cada mod.
- CTA hacia `/como-entrar`.

#### Criterios de aceptación

- [ ] No se presenta ningún mod como obligatorio.
- [ ] Versiones y compatibilidades no se fijan en el texto si no pueden mantenerse.
- [ ] Los enlaces externos proceden de fuentes oficiales o reconocidas.
- [ ] La página está enlazada internamente y aparece en el sitemap.

## 7. Fase 3: infraestructura del blog

### SEO-06 — Implementar el blog con Astro Content Collections

Estado: `[ ]`  
Calendario: semana 4  
Dependencias: SEO-01  
Documentación: Content Collections, rutas dinámicas y RSS de Astro

#### Estructura objetivo

```text
src/content.config.ts
src/content/blog/
src/layouts/BlogPostLayout.astro
src/pages/blog/index.astro
src/pages/blog/[...slug].astro
src/pages/rss.xml.ts
```

La estructura exacta debe adaptarse a la versión de Astro instalada. ChatGPT debe consultar la documentación de esa versión antes de implementar.

#### Campos mínimos de cada entrada

```yaml
title: "Título descriptivo"
description: "Resumen único de la entrada"
publishedAt: 2026-07-01
updatedAt: 2026-07-01
author: "Equipo de Ferreras SMP"
category: "guias"
tags:
  - minecraft-java
  - survival
image: "/images/blog/nombre-articulo.jpg"
imageAlt: "Descripción específica de la imagen"
draft: false
```

#### La plantilla debe incluir

- Title y descripción únicos.
- Canonical absoluto.
- Open Graph y Twitter Card específicos.
- `og:type="article"`.
- Fecha publicada y fecha actualizada.
- Autor visible.
- Imagen con dimensiones declaradas.
- JSON-LD `BlogPosting` o `Article`.
- Breadcrumbs visibles y `BreadcrumbList`.
- Enlaces relacionados.
- CTA para copiar IP y abrir Discord.
- Enlace a RSS.

#### Criterios de aceptación

- [ ] El índice muestra solo artículos no marcados como borrador.
- [ ] Los artículos se ordenan por fecha descendente.
- [ ] Una URL inexistente del blog devuelve 404.
- [ ] El RSS contiene URLs absolutas y artículos publicados.
- [ ] El sitemap incluye índice y artículos.
- [ ] El build y `astro check` terminan correctamente.
- [ ] Los datos estructurados validan sin errores críticos.

### SEO-07 — Sistema de imágenes sociales

Estado: `[ ]`  
Calendario: semanas 4–6  
Dependencias: SEO-06

#### Reglas

- Tamaño recomendado: 1200 × 630.
- Una imagen relevante por artículo prioritario.
- Texto mínimo y legible.
- Capturas propias del servidor cuando sea posible.
- Alt descriptivo, sin repetir mecánicamente el título.
- WebP, AVIF o JPG optimizado según el caso.

Si una imagen no existe, se utilizará temporalmente la imagen social general; no se bloqueará la publicación, pero se creará una tarea para sustituirla.

## 8. Calendario editorial

### Orden de publicación de las primeras doce entradas

| Semana | Tipo | Título | Intención y CTA |
| --- | --- | --- | --- |
| 4 | Guía fundamental | Cómo entrar a un servidor de Minecraft Java paso a paso | Resolver acceso → `/como-entrar` |
| 5 | Guía fundamental | Qué es un servidor SMP de Minecraft y cómo funciona | Descubrimiento → portada |
| 6 | Guía fundamental | Servidor de Minecraft sin mods: qué necesitas para empezar | Reducir fricción → copiar IP |
| 7 | Solución | No puedo entrar a un servidor de Minecraft: errores y soluciones | Diagnóstico → Discord/guía |
| 8 | Seguridad | Cómo proteger tu casa y tus cofres en un servidor survival | Confianza → normas/servidor |
| 9 | Comunidad | Ferreras SMP por dentro: así es nuestro servidor survival | Prueba propia → Discord |
| 10 | Reclamaciones | Cómo reclamar un terreno en Minecraft con Open Parties and Claims | Tutorial → servidor |
| 11 | Guía | Minecraft Java o Bedrock: cuál necesitas para entrar en Ferreras SMP | Compatibilidad → guía |
| 12 | Comunidad | Las mejores construcciones de Ferreras SMP este mes | Comunidad → Discord |
| 13 | Survival | Qué hacer durante tu primer día en un servidor survival | Activación → copiar IP |
| 14 | Mods | Xaero’s Minimap y World Map: diferencias y configuración recomendada | Información → mods recomendados |
| 15 | Comunidad | Así mejoramos el rendimiento sin cambiar la experiencia survival | Confianza técnica → portada |

Las fechas y títulos se podrán ajustar usando consultas reales de Search Console. No se cambiará el slug de una entrada publicada sin crear una redirección permanente.

### Backlog editorial adicional

1. Cómo elegir un buen lugar para construir tu base en Minecraft.
2. Cómo compartir una base sin perder tus objetos.
3. Normas básicas para convivir en un servidor Minecraft SMP.
4. Cómo evitar el griefing y proteger tus construcciones.
5. Ideas de bases para empezar un mundo survival en comunidad.
6. Cómo organizar cofres y recursos en una base survival.
7. Qué llevar antes de explorar lejos de tu base en Minecraft.
8. Cómo instalar Xaero’s Minimap paso a paso.
9. Cómo usar el mapa para gestionar terrenos reclamados.
10. ¿Necesitas Fabric para jugar en un servidor de Minecraft?
11. Mods de cliente recomendados para jugar Minecraft survival.
12. Conoce a la comunidad: entrevista a un jugador de Ferreras SMP.
13. Antes y después: evolución de una base dentro de Ferreras SMP.
14. Próximos proyectos comunitarios de Ferreras SMP.
15. Resumen mensual: novedades, cifras y construcciones.

## 9. Procedimiento para crear cada artículo

### SEO-CONTENT — Flujo repetible

Estado: tarea recurrente  
Responsable: ChatGPT + revisor humano

#### Paso 1: confirmar la información

Antes de redactar, ChatGPT debe solicitar o localizar:

- Versión de Minecraft cuando sea relevante.
- Mod loader y versión del mod cuando sea relevante.
- Capturas reales disponibles.
- Comportamiento exacto del servidor.
- CTA adecuado.
- Fuentes oficiales necesarias.

Si falta un dato esencial, se deja un marcador claramente identificado y el artículo permanece como borrador.

#### Paso 2: crear el esquema

El esquema debe responder una intención principal e incluir:

1. Respuesta breve inicial.
2. Pasos o explicación principal.
3. Problemas frecuentes o matices.
4. Ejemplo real de Ferreras SMP cuando aporte valor.
5. Siguiente acción.

#### Paso 3: redactar contenido útil

- Usar lenguaje natural en español.
- Evitar introducciones vacías y repetitivas.
- No imponer una cantidad arbitraria de palabras.
- No copiar documentación de mods ni otros sitios.
- Citar las fuentes externas necesarias.
- Diferenciar claramente recomendaciones y requisitos.
- Incluir experiencia propia del servidor siempre que exista.

#### Paso 4: revisión SEO

- Una intención principal por URL.
- Un solo H1.
- Title y descripción únicos.
- Slug corto, descriptivo, en minúsculas y con guiones.
- Encabezados que permitan escanear el contenido.
- Dos o más enlaces internos naturales.
- Al menos un enlace hacia una página de conversión.
- Imagen y alt descriptivos.
- Canonical correcto.
- Article y breadcrumbs válidos.

#### Paso 5: revisión editorial y técnica

- Corregir ortografía y afirmaciones ambiguas.
- Comprobar todos los enlaces.
- Verificar móvil y escritorio.
- Ejecutar `pnpm astro check` y `pnpm build`, o los scripts equivalentes del proyecto.
- Confirmar que el artículo aparece en blog, RSS y sitemap.
- Comprobar que un borrador no aparece públicamente.

#### Paso 6: publicación y distribución

Estas acciones requieren autorización si modifican servicios externos:

1. Desplegar el sitio.
2. Inspeccionar la URL publicada.
3. Solicitar indexación en Search Console.
4. Compartir en Discord con un resumen útil.
5. Reutilizar una captura y una idea en redes o vídeo corto.
6. Registrar la fecha de publicación en el panel de contenidos.

#### Instrucción reutilizable para ChatGPT

```text
Crea la entrada «TÍTULO» siguiendo SEO-CONTENT en
docs/seo-calendario-ejecucion-90-dias.md.

Antes de escribir, revisa el contenido y la configuración reales del servidor.
No inventes versiones, funciones ni testimonios. Implementa el artículo como
borrador si falta información esencial. Añade metadatos, enlaces internos,
imagen disponible, CTA contextual y datos estructurados. Verifica blog, RSS,
sitemap, astro check y build. No despliegues ni publiques externamente.
```

## 10. Enlazado interno

### SEO-08 — Construir la red de enlaces

Estado: `[ ]`  
Calendario: semanas 5–8  
Dependencias: SEO-04, SEO-05 y SEO-06

#### Reglas

- Cada página importante debe recibir al menos un enlace desde otra página indexable.
- La portada enlaza a `/como-entrar`, `/normas`, `/mods-recomendados` y `/blog`.
- Cada artículo enlaza a una página de conversión y a uno o dos artículos relacionados.
- `/como-entrar` enlaza a solución de errores, mods recomendados y FAQ.
- `/mods-recomendados` enlaza a las guías detalladas de cada herramienta.
- Las anclas describen el destino; evitar “haz clic aquí” y “leer más” sin contexto.
- No saturar cada párrafo con enlaces.

#### Criterios de aceptación

- [ ] No existen páginas importantes huérfanas.
- [ ] Los enlaces son HTML rastreable con `href`.
- [ ] No hay enlaces internos rotos.
- [ ] Los artículos relacionados guardan relación real con el contenido.

## 11. Rendimiento e imágenes

### SEO-09 — Optimizar recursos visuales

Estado: `[ ]`  
Calendario: semana 6  
Dependencias: SEO-01

En la revisión inicial del repositorio se detectaron dos PNG decorativos de aproximadamente 1,6 MB y 1,8 MB. Deben medirse en la página real antes de elegir la solución.

#### Ejecución

1. Inventariar imágenes, dimensiones, formato y uso.
2. Convertir decoraciones pesadas a WebP o AVIF cuando no pierdan calidad significativa.
3. Generar tamaños adecuados para móvil y escritorio.
4. Mantener ancho y alto declarados para evitar cambios de layout.
5. Cargar de forma diferida imágenes fuera del primer viewport.
6. No aplicar lazy loading a la imagen que determine el LCP.
7. Revisar fuentes externas y eliminar pesos que no se utilicen.
8. Comparar peso y métricas antes y después.

#### Objetivos de referencia

- LCP inferior a 2,5 s.
- INP inferior a 200 ms.
- CLS inferior a 0,1.

#### Criterios de aceptación

- [ ] No hay regresiones visuales perceptibles.
- [ ] Se documenta el ahorro total de bytes.
- [ ] Las imágenes conservan alt adecuado.
- [ ] Se comparan las métricas antes y después.

## 12. Datos estructurados y apariencia en buscadores

### SEO-10 — Revisar schema y metadatos

Estado: `[ ]`  
Calendario: semana 5  
Dependencias: SEO-04, SEO-05 y SEO-06

#### Tipos recomendados

- Portada: `Organization` y `WebSite`.
- Páginas: `WebPage` y `BreadcrumbList` cuando corresponda.
- Blog: `BlogPosting` o `Article` y `BreadcrumbList`.
- FAQ: `FAQPage` puede conservarse si refleja exactamente el contenido visible.
- Guía para entrar: `HowTo` puede conservarse si refleja pasos visibles.

FAQ y HowTo no deben tratarse como fuente asegurada de resultados enriquecidos. Su función principal será describir correctamente el contenido.

#### Criterios de aceptación

- [ ] No existe schema que describa contenido no visible.
- [ ] URLs, imágenes, fechas y autor son válidos.
- [ ] Se valida con Rich Results Test o Schema Markup Validator.
- [ ] Cada página tiene title y descripción únicos.

## 13. Distribución y autoridad

### SEO-11 — Presencia externa

Estado: `[ ]`  
Calendario: semanas 9–12  
Dependencias: página principal y guía para entrar terminadas  
Responsable principal: propietario, con preparación de ChatGPT

#### Acciones

1. Seleccionar directorios actuales y reputados de servidores Minecraft.
2. Crear una ficha coherente con nombre, modalidad, idioma, IP y enlace.
3. Preparar una descripción corta, una media y una larga.
4. Usar capturas reales del servidor.
5. Contactar a creadores pequeños de contenido survival con una propuesta personalizada.
6. Proponer intercambios editoriales o eventos reales, nunca compra masiva de enlaces.
7. Registrar cada ficha o colaboración y su URL.

No se enviarán formularios, mensajes ni publicaciones sin aprobación expresa del propietario.

#### Criterios de aceptación

- [ ] Los datos del servidor son consistentes en todas las fichas.
- [ ] No se utilizan directorios automáticos de baja calidad.
- [ ] Cada enlace publicado queda registrado.
- [ ] Se utilizan URLs con UTM cuando la plataforma lo admita.

## 14. Revisión semanal y mensual

### Plantilla de revisión semanal

Crear una sección fechada en `docs/seo-seguimiento.md`:

```markdown
## Semana de AAAA-MM-DD

- Artículos publicados:
- Páginas indexadas:
- Clics orgánicos:
- Impresiones orgánicas:
- Consultas nuevas relevantes:
- Páginas con muchas impresiones y CTR bajo:
- Copias de IP:
- Clics a Discord:
- Nuevos jugadores atribuibles:
- Problemas técnicos:
- Acción prioritaria de la semana siguiente:
```

### Criterios para decidir acciones

- Muchas impresiones y CTR bajo: revisar title, descripción y correspondencia con la búsqueda.
- Posición entre 8 y 20: mejorar profundidad, ejemplos propios y enlaces internos.
- Tráfico alto y pocas copias de IP: revisar CTA, propuesta y fricción de acceso.
- Copias de IP altas y pocas conexiones: mejorar diagnóstico de conexión y compatibilidad.
- Conexiones altas y retención baja: el problema deja de ser principalmente SEO y pasa a onboarding o experiencia del servidor.
- Artículo sin impresiones después de varias semanas: comprobar indexación, intención, calidad y enlaces internos antes de crear otro texto similar.

### Auditoría mensual

1. Comparar periodo actual con el anterior.
2. Separar búsquedas de marca y búsquedas genéricas.
3. Revisar conversiones por landing page.
4. Actualizar contenidos que hayan quedado obsoletos.
5. Eliminar o fusionar solo contenido claramente duplicado o inútil.
6. Elegir las cuatro publicaciones del mes siguiente.
7. Registrar cambios importantes para poder interpretar las métricas.

## 15. Definición de terminado para cualquier tarea SEO

Una tarea no está terminada hasta que:

- Cumple todos sus criterios de aceptación.
- Funciona en móvil y escritorio.
- No introduce errores de accesibilidad evidentes.
- No rompe rutas, API ni información en directo.
- `pnpm astro check` y `pnpm build` pasan, o el bloqueo queda documentado.
- Se han revisado cambios no relacionados y no se han sobrescrito.
- Se enumeran archivos modificados.
- Se explica cómo verificar manualmente el resultado.
- Este documento refleja el estado real.

## 16. Información que el propietario debe confirmar

Antes de ejecutar las tareas que dependan de estos datos, completar:

- [ ] Idioma y región objetivo: `____________________________`
- [ ] Versiones de Minecraft compatibles: `____________________________`
- [ ] ¿Acepta cuentas no premium?: `____________________________`
- [ ] Número máximo de jugadores: `____________________________`
- [ ] ¿Existe whitelist o solicitud de acceso?: `____________________________`
- [ ] Herramienta de analítica preferida: `____________________________`
- [ ] Acceso disponible a Google Search Console: `sí / no`
- [ ] Acceso disponible a Bing Webmaster Tools: `sí / no`
- [ ] Canales sociales oficiales: `____________________________`
- [ ] Persona o nombre de autor para el blog: `____________________________`
- [ ] Carpeta o fuente de capturas aprobadas: `____________________________`
- [ ] Política para testimonios de jugadores: `____________________________`

ChatGPT no debe completar estos campos mediante suposiciones.

## 17. Siguiente acción recomendada

Comenzar por `SEO-01`. La auditoría inicial confirmará el estado real de producción y permitirá ejecutar las siguientes tareas con una línea base verificable.

Después, ejecutar en este orden:

```text
SEO-01 → SEO-02 → SEO-03 → SEO-04 + SEO-05 → SEO-06 → SEO-10
       → SEO-07 + SEO-08 + SEO-09 → publicaciones semanales → SEO-11
```

Las acciones manuales externas pueden avanzar en paralelo, pero nunca deben bloquear la mejora de contenido, arquitectura y conversión del sitio.
