# Comentarios anónimos seguros para el blog

## Objetivo

Añadir comentarios públicos a los artículos de Ferreras SMP sin exigir una cuenta. El sistema debe reducir spam y suplantaciones, mostrar una identidad anónima reconocible, integrarse visualmente con Minecraft y permitir moderar desde Discord.

La ausencia de autenticación implica que ningún nick puede considerarse una identidad verificada. La interfaz lo indicará siempre y utilizará un código anónimo estable para distinguir navegadores que escriban con el mismo nick.

## Alcance de la primera versión

Incluye:

- lista cronológica y paginada de comentarios por artículo;
- publicación de texto plano con nick corto;
- identidad anónima estable mediante cookie firmada;
- avatar determinista basado en una de las nueve skins predeterminadas de Minecraft;
- moderación híbrida automática y manual;
- cuarentena y avisos mediante Discord;
- denuncia de comentarios;
- protección mediante Turnstile, límites de frecuencia y detección básica de spam;
- almacenamiento en el Dragonfly existente;
- snapshots locales y backups diarios del volumen en Cloudflare R2.

No incluye respuestas, votos, edición, imágenes, Markdown, perfiles, cuentas ni avatares personalizados.

## Arquitectura

Los artículos continúan prerenderizados. Un componente de comentarios se carga en el navegador y consulta una API dinámica, por lo que añadir comentarios no convierte los artículos completos en rutas dinámicas.

```text
Artículo estático en mc.ferreras.dev
        |
        | HTTPS con credenciales y CORS restringido
        v
API de comentarios en mc-api.ferreras.dev
        |
        +--> Dragonfly privado en Dokploy
        |
        +--> Cloudflare Turnstile
        |
        +--> Webhook de Discord
```

La API de Dokploy ampliará el modo `MINECRAFT_API_ONLY` para admitir `/api/comments/*` además de `/api/minecraft/*`. Dragonfly permanecerá inaccesible desde Internet y Vercel nunca se conectará directamente a él.

## Identidad anónima

En la primera interacción, la API crea un identificador aleatorio de 128 bits y lo entrega en una cookie firmada con HMAC. La cookie será `HttpOnly`, `Secure`, `SameSite=Lax` y exclusiva del host `mc-api.ferreras.dev`. El navegador la enviará a esa API mediante peticiones con credenciales, pero no estará disponible para scripts ni para otros subdominios.

El servidor deriva del identificador:

- un código público estable de cinco caracteres Base32, por ejemplo `A7K2P`;
- uno de nueve avatares: Steve, Alex, Noor, Sunny, Ari, Zuri, Makena, Kai o Efe.

El identificador aleatorio nunca se devuelve como dato visible ni se deriva del nick. Cambiar el nick conserva código y avatar. Dos navegadores que utilicen el mismo nick mostrarán códigos distintos.

La interfaz mostrará:

```text
[Avatar] Ferreras · A7K2P · nick no verificado
```

Borrar las cookies genera una identidad nueva. El sistema no afirmará que puede impedirlo.

## Validación del contenido

El nick tendrá entre 2 y 16 caracteres después de eliminar espacios exteriores. Se normalizará con Unicode NFKC y se rechazarán caracteres de control, texto bidireccional engañoso y nombres reservados como `Admin`, `Moderador` o `Ferreras SMP`, incluidas variantes visualmente equivalentes conocidas.

El comentario tendrá entre 2 y 800 caracteres. Solo se admitirá texto plano. La interfaz lo insertará mediante APIs de texto, nunca como HTML. No se convertirán URLs en enlaces activos.

Cada envío comprobará:

- método, tipo de contenido y tamaño del cuerpo;
- origen exacto permitido;
- firma de la cookie;
- token Turnstile validado en el servidor;
- slug correspondiente a un artículo publicado;
- nick y comentario normalizados;
- campo trampa vacío;
- clave de idempotencia para evitar dobles envíos;
- límites de frecuencia.

La API utilizará respuestas genéricas para las reglas antiabuso y no revelará qué comprobación activó un bloqueo.

## Límites y privacidad

Límites iniciales por identidad y por red:

- un comentario cada 30 segundos;
- cinco comentarios por hora;
- quince comentarios al día;
- límites globales adicionales por artículo.

La IP no se almacenará. La API calculará un HMAC con un secreto independiente y utilizará únicamente ese valor en claves de Dragonfly con caducidad. El HMAC no se incluirá en comentarios, registros ordinarios ni mensajes de Discord.

Las claves de límites, idempotencia y bloqueos tendrán TTL. Los comentarios y sus índices no tendrán TTL.

## Clasificación y estados

Cada comentario recibe una puntuación de riesgo basada en reglas explícitas:

- frecuencia de envío;
- duplicados y texto repetitivo;
- número de URLs;
- palabras configuradas para moderación;
- nick reservado o engañoso;
- patrones de spam;
- bloqueos temporales previos.

Estados:

- `published`: visible públicamente;
- `pending`: en cuarentena;
- `rejected`: rechazado y no visible;
- `deleted`: retirado por moderación.

El riesgo bajo publica inmediatamente. El riesgo medio deja el comentario en `pending`. El riesgo alto lo rechaza o aplica un bloqueo temporal. La puntuación es una ayuda de moderación, no un modelo opaco ni una decisión irreversible.

## Modelo de datos en Dragonfly

Cada comentario se guarda en un hash con un ULID como identificador:

```text
comments:comment:{commentId}
```

Campos:

- `postSlug`;
- `authorCode`;
- `avatar`;
- `nickname`;
- `body`;
- `status`;
- `riskScore`;
- `createdAt`;
- `moderatedAt`;
- `moderationReason`;
- `reportCount`.

Índices ordenados:

```text
comments:post:{slug}:published
comments:moderation:pending
comments:moderation:reported
```

El valor de cada conjunto ordenado será el ULID y la puntuación será la fecha de creación. Las escrituras del hash y sus índices se ejecutarán atómicamente mediante una transacción compatible con Dragonfly.

Las claves temporales utilizarán prefijos separados:

```text
comments:rate:identity:{window}:{identityHash}
comments:rate:network:{window}:{networkHash}
comments:idempotency:{key}
comments:moderation-token:{tokenHash}
comments:notifications:pending
```

## API

### `GET /api/comments/:slug`

Devuelve exclusivamente comentarios `published`, ordenados del más antiguo al más reciente y paginados mediante cursor. El límite predeterminado será 20 y el máximo 50.

### `POST /api/comments/:slug`

Acepta nick, texto, token Turnstile y clave de idempotencia. Devuelve el comentario publicado o una confirmación de recepción si queda en cuarentena. No expone la puntuación de riesgo.

### `POST /api/comments/:id/report`

Registra una denuncia limitada por identidad y red. Varias denuncias de la misma identidad sobre el mismo comentario cuentan una sola vez. Al alcanzar el umbral configurado se avisa a Discord, pero el comentario no se elimina automáticamente.

### Moderación

Los comentarios pendientes y denunciados generan un mensaje en Discord con contexto, artículo y enlaces de aprobar, rechazar o eliminar. Cada enlace contiene un token aleatorio almacenado como hash, de un solo uso y con una validez máxima de 24 horas.

El enlace abre una página de confirmación. La mutación se realiza únicamente mediante `POST`; un `GET` o la previsualización automática de Discord nunca cambia el estado.

## CORS, cookies y cabeceras

La API de comentarios aceptará solicitudes con credenciales únicamente desde `https://mc.ferreras.dev`. No utilizará un origen comodín. Las operaciones de escritura comprobarán además la cabecera `Origin`.

Las respuestas de lectura pública podrán usar una caché breve con revalidación. Las respuestas de escritura, moderación y denuncia usarán `Cache-Control: no-store`.

Se conservarán las cabeceras de seguridad existentes y los errores internos no incluirán trazas, secretos ni claves de Dragonfly.

## Interfaz

La sección aparecerá después del contenido del artículo y antes de la conversión o del contenido relacionado. Incluirá:

- título y número de comentarios;
- formulario con nick, comentario, contador de caracteres y Turnstile;
- explicación breve de que el nick no se verifica;
- previsualización del código y avatar después de establecer la identidad;
- lista cronológica;
- botón de denuncia en cada comentario;
- botón para cargar la página siguiente.

El formulario conservará el texto ante errores recuperables y bloqueará envíos repetidos mientras una petición esté en curso. Todos los estados se comunicarán mediante texto accesible, no solo mediante color.

## Fallos y recuperación

- Si Dragonfly no está disponible, el artículo sigue funcionando y la sección indica que los comentarios están temporalmente indisponibles.
- Si Turnstile no responde, no se publica el comentario y se permite reintentar.
- Si Discord falla, el comentario permanece en `pending` y se añade a una cola de avisos pendientes para reintento.
- Si un cliente repite una petición con la misma clave de idempotencia, recibe el resultado original.
- Si falla una escritura atómica, no debe quedar un comentario sin índice ni un índice sin comentario.

Dragonfly creará snapshots locales periódicos en `/data`. Dokploy copiará diariamente el volumen persistente a Cloudflare R2 con el contenedor detenido durante la copia. La pérdida máxima aceptada ante un fallo local es el intervalo entre snapshots; ante pérdida completa del VPS se restaura el último backup disponible en R2.

## Pruebas

Pruebas unitarias:

- normalización y validación de nick y texto;
- derivación estable de código y avatar;
- firma y caducidad de cookies;
- puntuación de riesgo;
- límites e idempotencia;
- tokens de moderación.

Pruebas de integración:

- publicación, cuarentena, rechazo, denuncia y eliminación;
- paginación por cursor;
- transacciones e índices de Dragonfly;
- CORS y comprobación de origen;
- validación Turnstile simulada;
- reintento de avisos de Discord;
- respuestas cuando faltan dependencias.

Pruebas de seguridad:

- XSS y HTML malicioso;
- caracteres Unicode engañosos;
- cookies manipuladas;
- replay de tokens de moderación;
- doble envío;
- evasión básica de límites;
- acceso desde orígenes no autorizados;
- cuerpos excesivos y JSON inválido.

Una prueba manual final verificará el formulario en móvil y escritorio, el mensaje de Discord, las acciones de moderación y la restauración de un snapshot en un entorno aislado.

## Criterios de aceptación

- Un visitante puede comentar sin crear una cuenta.
- Dos visitantes con el mismo nick se distinguen claramente por código y avatar.
- Ningún nick aparece como verificado.
- El HTML introducido por un visitante nunca se interpreta.
- Los límites, Turnstile y CORS se aplican en el servidor.
- Los comentarios sospechosos no son públicos hasta su aprobación.
- Las acciones de moderación requieren confirmación y no pueden reutilizarse.
- Los fallos de comentarios no impiden leer el artículo.
- Los datos sobreviven a un reinicio mediante snapshots y pueden recuperarse desde R2.
