# Discord blog deploy skill

## Objetivo

Crear una skill local al repositorio que anuncie en Discord los artículos nuevos cuando `pnpm deploy` complete correctamente un despliegue de producción en Vercel.

## Estructura

- Guardar la skill en `.agents/skills/discord-blog-deploy`.
- Incluir un `SKILL.md`, metadatos de agente y un script de despliegue reutilizable.
- Hacer que `pnpm deploy` delegue en ese script.
- Reutilizar Node.js, Git y la CLI de Vercel ya disponible; no añadir dependencias.

## Flujo

1. Leer la referencia Git privada que identifica el último commit desplegado correctamente.
2. Si todavía no existe, usar el padre de `HEAD` como referencia inicial.
3. Buscar archivos Markdown añadidos bajo `src/content/blog` entre esa referencia y `HEAD`.
4. Ejecutar el despliegue actual: `vercel deploy --prod --yes`.
5. Si el despliegue falla, conservar la referencia anterior y no enviar mensajes.
6. Si el despliegue termina correctamente, leer el `title` y `description` del frontmatter de cada artículo nuevo y enviar un mensaje por artículo.
7. Actualizar la referencia Git al `HEAD` desplegado, aunque Discord haya fallado, para que un fallo ajeno no provoque duplicados ni convierta el despliegue en fallido.

La referencia vivirá dentro de `.git`, por lo que no modificará el árbol de trabajo. En un clon nuevo no existirá: el primer despliegue solo examinará el último commit.

## Mensaje de Discord

Usar contenido Markdown sencillo, sin embeds ni librerías:

```text
[Título del blog](https://mc.ferreras.dev/blog/slug)

Descripción breve del artículo.
```

El slug será la ruta relativa del archivo dentro de `src/content/blog`, sin la extensión. No se anunciarán archivos modificados, borradores ni archivos eliminados.

## Configuración y seguridad

- Leer el webhook exclusivamente desde `DISCORD_BLOG_WEBHOOK_URL`.
- No guardar el valor en Git, argumentos de comandos ni logs.
- Configurarlo como secreto de producción de Vercel y descargar las variables de producción a un archivo local ignorado por Git antes de ejecutar `pnpm deploy`.
- Validar que la URL use HTTPS y pertenezca a un host oficial de webhooks de Discord antes de enviar datos.
- No imprimir la URL en errores.

## Errores

- Un error de Vercel hará fallar `pnpm deploy` y evitará cualquier anuncio.
- La ausencia o invalidez del webhook, un frontmatter incorrecto o un error HTTP de Discord producirán un aviso redactado, pero no harán fallar un despliegue ya completado.
- Los mensajes se enviarán secuencialmente para mantener el orden y simplificar el manejo de errores.

## Comprobación

Añadir una única prueba ejecutable con Node.js que cubra:

- detección de un Markdown añadido;
- exclusión de un artículo modificado y de un borrador;
- generación exacta del enlace y el mensaje.

La prueba no contactará Vercel ni Discord. La validación de la skill se ejecutará además con `quick_validate.py`.

## Límite aceptado

La marca del último despliegue es local. Un primer despliegue desde otro clon podría volver a anunciar un artículo añadido en el último commit. Si los despliegues pasan a ejecutarse desde varias máquinas o CI, se sustituirá la marca local por el SHA del último despliegue consultado en Vercel.
