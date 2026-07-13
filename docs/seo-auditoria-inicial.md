# Auditoría SEO inicial de Ferreras SMP

Fecha de auditoría: 13 de julio de 2026  
Sitio: `https://mc.ferreras.dev`  
Tarea: SEO-01  
Alcance: revisión de solo lectura del repositorio y de producción. No se han implementado correcciones.

## Resumen ejecutivo

El sitio expone tres páginas HTML públicas, todas accesibles con HTTP 200, metadatos únicos, una sola etiqueta H1, imágenes de contenido con texto alternativo y datos estructurados que se pueden interpretar como JSON. `robots.txt` permite el rastreo y declara un sitemap válido; una URL inexistente responde correctamente con HTTP 404.

No se detectaron problemas P0. Se detectaron dos problemas P1: las páginas secundarias se sirven con y sin barra final y cada variante se declara canonical a sí misma, y la portada no expresa en `title` ni H1 la búsqueda principal definida en el plan. Los datos de Search Console no estaban disponibles y no se han inferido. PageSpeed Insights no permitió obtener una medición por cuota agotada; tampoco existe Lighthouse ni un navegador compatible en el entorno local. Esta limitación y una línea base parcial de pesos quedan documentadas más abajo.

## Alcance y método

- Revisión de `astro.config.mjs`, layout, páginas, componentes, navegación, datos y recursos de `public/`.
- Peticiones de solo lectura a producción el 13 de julio de 2026.
- Comprobación de códigos HTTP, canonical, robots y los dos archivos del sitemap.
- Inspección del HTML renderizado: títulos, descripciones, Open Graph, Twitter Cards, JSON-LD, H1–H3, imágenes, textos alternativos y enlaces internos.
- Build local con el binario de Astro instalado en el proyecto.
- Intentos de medición móvil y escritorio mediante PageSpeed Insights.
- Consulta pública `site:mc.ferreras.dev` como señal auxiliar, no como sustituto de Search Console.

## Inventario de rutas públicas

### Páginas y archivos rastreables

| Ruta | Tipo | Estado en producción | Canonical o función |
| --- | --- | ---: | --- |
| `/` | HTML | 200 | `https://mc.ferreras.dev/` |
| `/como-entrar` | HTML | 200 | `https://mc.ferreras.dev/como-entrar` |
| `/como-entrar/` | HTML | 200 | `https://mc.ferreras.dev/como-entrar/` |
| `/preguntas-frecuentes` | HTML | 200 | `https://mc.ferreras.dev/preguntas-frecuentes` |
| `/preguntas-frecuentes/` | HTML | 200 | `https://mc.ferreras.dev/preguntas-frecuentes/` |
| `/robots.txt` | texto | 200 | Permite `/` y declara el índice del sitemap |
| `/sitemap-index.xml` | XML | 200 | Declara `/sitemap-0.xml` |
| `/sitemap-0.xml` | XML | 200 | Contiene las tres páginas HTML, con barra final |
| `/seo-01-url-inexistente` | HTML de error | 404 | URL de control; respuesta correcta |

El sitemap contiene exactamente:

- `https://mc.ferreras.dev/`
- `https://mc.ferreras.dev/como-entrar/`
- `https://mc.ferreras.dev/preguntas-frecuentes/`

### Endpoints públicos no indexables

Estos endpoints forman parte del inventario de rutas del repositorio, pero no son documentos SEO ni aparecen en el sitemap:

| Ruta | Método |
| --- | --- |
| `/api/minecraft/activity` | GET |
| `/api/minecraft/live` | GET |
| `/api/minecraft/poll` | GET |
| `/api/minecraft/status` | GET |
| `/api/minecraft/stream` | GET, Server-Sent Events |
| `/api/minecraft/poll/vote` | POST |

El middleware también define `/health` únicamente para despliegues con `MINECRAFT_API_ONLY=true`; no es una página pública del despliegue web revisado.

## Metadatos por página

| URL | Title | Descripción | OG/Twitter | JSON-LD |
| --- | --- | --- | --- | --- |
| `/` | `Ferreras SMP — Servidor de supervivencia` | Única, 106 caracteres | Presentes | `Organization`, `WebSite` |
| `/como-entrar` | `Cómo entrar a Ferreras SMP \| Servidor Minecraft` | Única, 102 caracteres | Presentes | `Organization`, `WebSite`, `HowTo` |
| `/preguntas-frecuentes` | `Preguntas frecuentes sobre Ferreras SMP` | Única, 99 caracteres | Presentes | `Organization`, `WebSite`, `FAQPage` |

Comprobaciones positivas:

- Todas las páginas tienen `title`, meta description y canonical.
- Open Graph incluye tipo, locale, nombre del sitio, título, descripción, URL, imagen de 1200 × 630 y texto alternativo.
- Twitter Cards incluye tarjeta, título, descripción e imagen.
- El JSON-LD de las tres páginas es JSON válido y describe contenido visible en `HowTo` y `FAQPage`.
- La imagen social existe, responde 200 y mide realmente 1200 × 630.

## Navegación, encabezados, imágenes y enlaces

- Hay una sola etiqueta H1 por página.
- La portada sigue una jerarquía H1 → H2 → H3 coherente.
- `/como-entrar` sigue H1 → H2 → H3 en los pasos y mantiene los demás bloques en H2.
- `/preguntas-frecuentes` tiene un H1 y dos H2; las preguntas usan el elemento semántico `summary` dentro de `details`.
- Los enlaces de navegación son HTML rastreable con `href` y los destinos internos revisados responden correctamente.
- Los fragmentos usados por la navegación (`#contenido`, `#servidor`, `#directo`, `#normas`, `#mods` y `#mods-opcionales`) existen en sus páginas de destino.
- Las cuatro imágenes de contenido de la portada tienen dimensiones declaradas y textos alternativos descriptivos. Los avatares de jugadores usan `alt=""` y `aria-hidden="true"`, apropiado para imágenes decorativas junto a un nombre visible.
- No se detectaron páginas HTML huérfanas dentro del inventario actual.

## Problemas priorizados

### P0 — Bloqueantes

No se detectaron problemas P0.

### P1 — Alta prioridad

#### P1.1 — Variantes con y sin barra final se consideran documentos canónicos distintos

Evidencia:

- `/como-entrar` y `/como-entrar/` responden 200 sin redirección.
- La primera declara canonical sin barra y la segunda declara canonical con barra.
- Ocurre lo mismo con `/preguntas-frecuentes`.
- Los enlaces internos usan mayoritariamente la variante sin barra, mientras que el sitemap publica la variante con barra.

Impacto: divide señales de rastreo y permite que dos URLs equivalentes sean tratadas como documentos distintos. El sitemap y los enlaces internos envían señales contradictorias.

Recomendación: escoger una única política de barra final, redirigir la variante alternativa con 301/308 y alinear enlaces internos, canonical y sitemap.

#### P1.2 — La portada no explicita la búsqueda objetivo en title y H1

Evidencia:

- Title actual: `Ferreras SMP — Servidor de supervivencia`; no contiene “Minecraft”.
- H1 actual: `Un lugar tranquilo para jugar a tu ritmo.`; no contiene “Minecraft”, “servidor” ni “survival/supervivencia”.
- El texto visible posterior sí menciona Minecraft y supervivencia, pero la señal principal es genérica.

Impacto: menor claridad temática para la intención principal “servidor Minecraft survival en español”.

Recomendación: aplicar el ajuste editorial previsto en SEO-03 una vez que el propietario confirme el posicionamiento y el uso correcto de “en español”.

### P2 — Prioridad media o de mantenimiento

#### P2.1 — `astro check` no está preparado para ejecución no interactiva

`@astrojs/check` no está instalado. Al ejecutar la comprobación, Astro abrió un prompt para instalar `@astrojs/check` y TypeScript. La instalación se canceló para respetar el alcance de solo auditoría. Además, el comando `pnpm` disponible apunta a un shim de Windows y falló en WSL antes de ejecutar el script (`UtilBindVsockAnyPort`).

Recomendación: en una tarea posterior, añadir explícitamente las dependencias de comprobación compatibles con Astro y corregir el runtime de `pnpm` en WSL para que `pnpm check` sea reproducible y no interactivo.

#### P2.2 — Las entidades globales cambian de descripción según la página

`Organization` y `WebSite` se generan en todas las páginas usando la descripción de la página actual. Por ello, las mismas entidades e identificadores tienen descripciones distintas entre portada, guía y FAQ.

Recomendación: usar una descripción estable del sitio para las entidades globales y reservar la descripción específica para un schema de página (`WebPage`, `HowTo` o `FAQPage`).

#### P2.3 — Falta `twitter:image:alt`

Open Graph sí incluye `og:image:alt`, pero Twitter Cards no incluye el equivalente `twitter:image:alt`.

Recomendación: añadir el texto alternativo de la imagen social también a Twitter Cards.

#### P2.4 — Tres recursos grandes se copian al despliegue sin estar referenciados por el HTML o CSS actual

El build copia `minecraft-doodles-join.png` (1.845.186 bytes), `minecraft-doodles-rules.png` (1.595.492 bytes) y `hero-background.jpg` (285.640 bytes). No se encontraron referencias a esos archivos en el HTML renderizado ni en `global.css`; por tanto, no forman parte de la transferencia normal de la página, pero añaden aproximadamente 3,55 MiB al artefacto desplegado.

Recomendación: antes de convertirlos como plantea SEO-09, confirmar si siguen siendo necesarios. Si están obsoletos, eliminarlos del artefacto es preferible a optimizarlos.

## Estado de indexación conocido

- `robots.txt` no bloquea las páginas y el sitemap es accesible.
- No se proporcionó acceso a Google Search Console, por lo que no se conocen páginas indexadas, consultas, impresiones, cobertura ni inspecciones de URL.
- Una consulta pública `site:mc.ferreras.dev` realizada durante la auditoría no devolvió resultados del dominio. Esta señal no demuestra por sí sola que el sitio no esté indexado y no sustituye a Search Console.
- No se modificó Search Console ni se solicitó indexación.

## Línea base de rendimiento

### Core Web Vitals

| Métrica | Móvil | Escritorio | Motivo |
| --- | --- | --- | --- |
| LCP | No disponible | No disponible | PageSpeed Insights respondió HTTP 429 por cuota diaria agotada |
| INP | No disponible | No disponible | No se pudo recuperar información de campo; INP no se obtiene de una navegación aislada sin datos de usuarios |
| CLS | No disponible | No disponible | PageSpeed Insights respondió HTTP 429 por cuota diaria agotada |

Se intentó medir la portada con PageSpeed Insights en estrategia móvil y escritorio. Ambas peticiones devolvieron `RESOURCE_EXHAUSTED / RATE_LIMIT_EXCEEDED`. El proyecto no incluye Lighthouse y el entorno no dispone de Chromium/Chrome, por lo que no fue posible ejecutar una alternativa local sin instalar herramientas. No se han inventado valores.

### Peso de los principales recursos en producción

Los tamaños siguientes son los bytes servidos sin compresión negociada por la petición de auditoría:

| Recurso | Bytes | Aproximado | Uso |
| --- | ---: | ---: | --- |
| HTML de `/` | 17.865 | 17,4 KiB | Documento principal |
| CSS `Layout.BuwcQIeJ.css` | 27.150 | 26,5 KiB | Estilos globales |
| JS de `LiveServerSection` | 7.233 | 7,1 KiB | Estado en directo |
| `hero-characters.webp` | 104.544 | 102,1 KiB | Imagen prioritaria del hero |
| `feature-simple-survival.webp` | 26.254 | 25,6 KiB | Imagen diferida |
| `feature-ready-to-play.webp` | 20.862 | 20,4 KiB | Imagen diferida |
| `feature-connected-community.webp` | 34.470 | 33,7 KiB | Imagen diferida |
| `og-ferreras-smp.jpg` | 212.814 | 207,8 KiB | Imagen social; no se descarga en la navegación normal |

El HTML, CSS, JS, favicon y las cuatro imágenes visibles suman aproximadamente 233 KiB sin contar fuentes externas ni respuestas de la API en directo. Las imágenes de características usan `loading="lazy"`; la imagen del hero usa `loading="eager"` y `fetchpriority="high"`.

## Comprobaciones técnicas

| Comprobación | Resultado |
| --- | --- |
| Build de Astro | Correcto; build de servidor con adaptador Vercel completado |
| `astro check` | No completado; falta `@astrojs/check` y Astro solicita instalación interactiva |
| `robots.txt` | 200, permite rastreo y declara sitemap absoluto |
| Sitemap index | 200 y XML válido |
| Sitemap de URLs | 200; contiene las tres páginas HTML |
| Página principal | 200 |
| Páginas secundarias | 200 en variantes con y sin barra |
| URL inexistente | 404 correcto |
| JSON-LD | JSON interpretable en las tres páginas |
| Enlaces internos revisados | Sin destinos rotos en el inventario actual |

## Recomendaciones que amplían o difieren del plan de 90 días

1. Añadir una tarea explícita de normalización de barra final antes de ampliar el número de páginas. El plan pide canonical consistentes, pero no contempla redirecciones entre variantes.
2. Preparar `astro check` como comprobación no interactiva antes de SEO-06, en lugar de descubrir el bloqueo al construir el blog.
3. En SEO-09, comprobar primero si los dos PNG y el fondo JPG sin referencias deben existir. Si no se usan, eliminarlos del artefacto en vez de convertirlos.
4. En SEO-10, separar la descripción estable de `Organization`/`WebSite` de las descripciones específicas de cada página.
5. Añadir `twitter:image:alt` al sistema común de metadatos sociales.

## Decisiones y datos pendientes del propietario

- Confirmar si Ferreras SMP debe presentarse públicamente como servidor “en español” o “hispanohablante”.
- Facilitar acceso de lectura a Search Console, si existe, para sustituir el estado de indexación desconocido por datos reales.
- Repetir PageSpeed Insights cuando haya cuota disponible o autorizar en otra tarea la instalación de Lighthouse y un navegador compatible.

## Cambios realizados durante SEO-01

- Creado este informe.
- Actualizado el estado de SEO-01 en el calendario.
- No se modificó código, diseño, configuración, contenido público ni producción.

## Aplicación de correcciones posterior a la auditoría

Fecha: 13 de julio de 2026  
Estado: aplicada localmente y verificada; pendiente de despliegue autorizado para que afecte a producción.

| Hallazgo | Estado | Corrección aplicada |
| --- | --- | --- |
| P1.1 — Variantes con y sin barra final | Resuelto | Se configuró `trailingSlash: "never"`. El artefacto de Vercel genera una redirección 308 de `^/(.*)/$` a la variante sin barra; canonical y sitemap usan la misma forma. |
| P1.2 — Señal temática de la portada | Resuelto parcialmente | Title y H1 ahora incluyen “Servidor Minecraft survival”. No se añadió “en español” porque sigue pendiente de confirmación del propietario. |
| P2.1 — `astro check` no interactivo | Resuelto | Se instalaron `@astrojs/check` y `typescript` como dependencias de desarrollo. `pnpm check` termina con 0 errores. |
| P2.2 — Descripción variable de entidades globales | Resuelto | `Organization` y `WebSite` usan ahora una descripción estable; las páginas conservan sus descripciones específicas. |
| P2.3 — `twitter:image:alt` | Resuelto | Se añadió el metadato al layout común. |
| P2.4 — Recursos no referenciados en el despliegue | Resuelto | Se retiraron los dos PNG decorativos y el JPG de fondo sin referencias, eliminando aproximadamente 3,55 MiB del artefacto. |
| Métricas Core Web Vitals | Pendiente externo | PageSpeed Insights sigue sin devolver datos por cuota agotada. No se han inventado métricas ni se ha instalado Lighthouse. |

Validación posterior: `pnpm check` completado con 0 errores (un hint no bloqueante sobre la API de copia heredada) y `pnpm build` completado correctamente.
