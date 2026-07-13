# Medición del embudo SEO

Fecha de implementación técnica: 13 de julio de 2026.
Configuración del proveedor y de la invitación web: 14 de julio de 2026.

## Estado del proveedor

Decisión del propietario, 13 de julio de 2026: **usar Plausible**.

El propietario proporcionó el script de su instancia de Plausible. La URL HTTP redirige a HTTPS, por lo que la integración utiliza directamente la variante segura:

`https://plausible.carlosferreras.com/js/script.hash.outbound-links.pageview-props.tagged-events.js`

La configuración ya está activa en `.env.local` para desarrollo y documentada en `.env.example`. Para producción y previews todavía se deben crear las mismas variables públicas en Vercel; no se han modificado entornos remotos ni realizado un despliegue.

La invitación exclusiva para la web es `https://discord.gg/f8aBZ98EDT` y ya está centralizada en `src/data/server.ts`. No se ha instalado todavía ninguna app de atribución en Discord.

## Atribución de invitaciones de Discord

Plausible medirá el clic desde la web mediante `click_discord` y `placement`. Para medir cuántas personas terminan entrando y permanecen en Discord se necesita una invitación exclusiva para la web y una medición separada dentro de Discord. No se intentará identificar a una misma persona entre ambos sistemas: el embudo se comparará de forma agregada.

**Candidato para un piloto: Invite Tracker.** Permite etiquetar una invitación como `web`, muestra altas, bajas, fuente y retención, y su plan gratuito admite una etiqueta con 30 días de histórico. Es suficiente para validar el canal antes de valorar un plan de pago.

Precauciones antes de instalarlo:

1. Revisar y aceptar su política de privacidad: registra altas, bajas, miembro, invitador y código de invitación; su política indica que conserva el ID de usuario sin límite y cachea nombre, avatar y otros datos de perfil durante un máximo de 30 días.
2. No conceder `Administrator`, aunque venga seleccionado por defecto.
3. Limitar el rol a los permisos imprescindibles para leer invitaciones y al canal de registro elegido; no activar tickets, verificación, recompensas, auto-roles ni seguimiento de mensajes.
4. Etiquetar la invitación `f8aBZ98EDT` como `web` cuando se apruebe la app; la URL ya está centralizada en `src/data/server.ts`.
5. Comparar semanalmente `click_discord` en Plausible con usos de la invitación, altas y retención en Discord. No copiar IDs de miembros a Plausible.

## Contrato de eventos

Todos los eventos salen por `src/lib/analytics.ts`. El módulo añade `page_path`, limitado al pathname: nunca incluye parámetros de consulta ni fragmentos.

| Evento | Cuándo se emite | Propiedades específicas |
| --- | --- | --- |
| `copy_server_ip` | Después de ejecutar la copia desde cualquier bloque de dirección | `placement` |
| `click_discord` | Al pulsar cualquier enlace visible a Discord | `placement` |
| `view_join_guide` | Al cargar `/como-entrar` | Ninguna |
| `view_blog_post` | Al cargar una página marcada como artículo | `post_slug` |
| `click_related_article` | Al pulsar un enlace marcado como artículo relacionado | `source_slug`, `target_slug` |
| `open_server_status` | La primera vez que al menos la mitad de la tarjeta de estado es visible | `placement` |

Los valores de `placement` describen una posición fija de la interfaz, por ejemplo `hero`, `header_desktop` o `join_guide`. No se envían la dirección del servidor, nombres de jugadores, direcciones IP de visitantes, UUID, votos, contenido escrito por usuarios ni parámetros de la URL.

Mientras no haya proveedor, cada evento continúa emitiéndose en el navegador como `ferreras:analytics`. Esto permite comprobar la instrumentación sin cargar scripts externos. Los errores o bloqueos de un proveedor se aíslan y nunca impiden copiar la IP, abrir Discord o navegar.

## Activación

Usar la URL de script específica que Plausible entrega al crear el sitio, no una URL genérica:

```dotenv
PUBLIC_ANALYTICS_PROVIDER=plausible
PUBLIC_PLAUSIBLE_SCRIPT_URL=https://plausible.carlosferreras.com/js/script.hash.outbound-links.pageview-props.tagged-events.js
```

Después se deben crear en Plausible seis objetivos de evento personalizado cuyos nombres coincidan exactamente con la tabla anterior.

Si la configuración falta o está incompleta, la aplicación vuelve automáticamente al modo `none` y no solicita ningún recurso de analítica.

## Preparación de futuros artículos

SEO-06 podrá activar los dos eventos de blog sin añadir llamadas directas:

```astro
<Layout
  analyticsPage="blog-post"
  analyticsContentId={post.id}
  ...
>
```

Cada enlace del bloque de relacionados debe incluir únicamente el slug de destino:

```astro
<a href={`/blog/${related.id}`} data-analytics-related-article={related.id}>
  {related.data.title}
</a>
```

## Traspaso a las siguientes fases

- **SEO-03:** es la siguiente tarea del calendario. La medición de sus CTA ya reutiliza `copy_server_ip` y `click_discord`; cualquier ubicación nueva debe recibir un `placement` estable.
- **Activación de Plausible:** configurada localmente; pendiente de crear las variables en Development, Preview y Production de Vercel, crear los seis objetivos y verificar eventos reales tras un despliegue autorizado.
- **Discord:** la invitación exclusiva ya está aplicada; queda pendiente aprobar Invite Tracker u otra solución, revisar permisos y privacidad y etiquetar el código como `web`.
- **SEO-06:** los eventos `view_blog_post` y `click_related_article` ya tienen contrato e integración preparados para las futuras páginas de artículos.
- **Entorno local:** `astro dev --background` quedó investigado pero continúa agotando el tiempo sin abrir el puerto; `pnpm check` y `pnpm build` sí funcionan.

## Verificación en desarrollo

1. Iniciar Astro en segundo plano con `pnpm exec astro dev --background`.
2. Abrir `http://localhost:4321/como-entrar?analytics_debug=1` y comprobar en la consola `view_join_guide`.
3. Copiar la IP y comprobar `copy_server_ip` con `placement: "join_guide"`.
4. Pulsar un enlace de Discord y comprobar `click_discord` con su posición.
5. Abrir `http://localhost:4321/?analytics_debug=1`, desplazarse hasta la tarjeta de estado y comprobar un único `open_server_status`.
6. Confirmar que todos incluyen `page_path` y que ninguno contiene datos de Minecraft o del visitante.
7. En DevTools, bloquear el dominio del proveedor y repetir las acciones: la consola no debe mostrar excepciones y las acciones deben seguir funcionando.
8. Detener el servidor con `pnpm exec astro dev stop`.

## Verificación en producción

1. Confirmar que el HTML incluye solo el script del proveedor elegido.
2. Activar cada interacción con DevTools abierto en la pestaña Network.
3. Buscar solicitudes a `plausible.carlosferreras.com/api/event`.
4. Verificar los seis nombres y sus propiedades en el panel en tiempo real del proveedor.
5. Repetir la prueba con el dominio bloqueado para confirmar la degradación segura.

La activación en producción, la creación de objetivos y cualquier cambio de consentimiento se realizan solo con autorización del propietario.
