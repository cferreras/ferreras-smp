# Artículo sobre los mods de Ferreras SMP

## Objetivo

Publicar un artículo que explique qué mods y datapacks utiliza Ferreras SMP, qué significa que sean *server-side* y cómo permiten conservar una experiencia survival cercana a vanilla sin exigir un modpack al jugador.

## Título y enfoque

Título: `Qué mods hay en Ferreras SMP y cómo mantenemos una experiencia cercana a vanilla`

El texto se dirigirá a jugadores, no a administradores. Abrirá con una respuesta breve: el servidor usa Fabric y mejoras del lado servidor, pero se puede entrar con Minecraft Java sin instalar esos mods. La comparación con plugins de Paper o Spigot será breve y pedagógica; explicará el parecido práctico sin afirmar que ambas tecnologías sean intercambiables.

## Estructura

1. Qué es un mod *server-side*.
2. En qué se parece y diferencia de un plugin de Paper o Spigot.
3. Mods visibles para el jugador: protección, comunidad y pequeños ajustes de juego.
4. Mods de rendimiento, estabilidad, seguridad y administración.
5. Librerías y dependencias técnicas, resumidas sin convertirlas en catálogo.
6. Datapacks: All Mob Heads, Server Sleep, Craftable Elytra y SMP Starter.
7. Qué tiene que instalar el jugador y por qué el resultado sigue siendo cercano a vanilla.
8. CTA hacia `/como-entrar`, `/mods-recomendados` y `/normas`.

Los mods importantes se explicarán individualmente cuando afecten a la experiencia. El resto se agrupará por función para evitar una pared de nombres. La lista completa proporcionada por el propietario quedará representada, aunque las dependencias podrán aparecer juntas.

## Fuentes y precisión

Los nombres y funciones se comprobarán en las fichas oficiales de Modrinth. La explicación técnica se apoyará en documentación oficial de Fabric y Paper. No se afirmarán valores de configuración, comandos disponibles para jugadores ni comportamientos particulares que no estén confirmados.

## Imagen

Se generará una portada original sin texto ni logotipos, en composición horizontal 1200 × 630. Mostrará una escena survival de estética voxel cercana a la identidad visual de Ferreras SMP: una base, cultivos, aldeanos o jugadores y señales sutiles de protección, comunidad y rendimiento. La imagen no presentará el servidor como un modpack ni destacará interfaces técnicas.

El archivo final será WebP optimizado y se guardará en `public/images/blog/`. El frontmatter incluirá un texto alternativo específico.

## Integración y validación

El artículo seguirá el esquema actual de Astro Content Collections, permanecerá visible (`draft: false`) y utilizará enlaces relacionados ya existentes. Se ejecutarán `pnpm check` y `pnpm build`. También se comprobarán la imagen, el frontmatter, los enlaces internos y que el artículo aparezca en el índice del blog.

No se harán commit, push ni despliegue sin autorización expresa.
