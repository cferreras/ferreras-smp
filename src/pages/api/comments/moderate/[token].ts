import type { APIRoute } from "astro";
import { CommentsService } from "../../../../lib/comments/service";
import type { ModerationAction } from "../../../../lib/comments/types";

export const prerender = false;

const service = new CommentsService();

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const actionLabel = (action: ModerationAction) =>
  action === "approve" ? "aprobar" : action === "reject" ? "rechazar" : "eliminar";

const page = (title: string, content: string, status = 200) => new Response(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} | Ferreras SMP</title>
    <style>
      :root { color-scheme: dark; font-family: ui-sans-serif, system-ui, sans-serif; }
      body { display:grid; min-height:100vh; place-items:center; margin:0; padding:24px; background:#000; color:#fafafa; }
      main { width:min(100%, 560px); padding:32px; border:1px solid #27272a; border-radius:16px; background:#050505; }
      p { color:#d4d4d8; line-height:1.7; }
      blockquote { margin:24px 0; padding:18px; border-left:3px solid #8b5cf6; background:#111; white-space:pre-wrap; }
      button { width:100%; padding:13px 18px; border:0; border-radius:9px; background:#8b5cf6; color:#fff; font:inherit; font-weight:800; cursor:pointer; }
    </style>
  </head>
  <body><main>${content}</main></body>
</html>`, {
  status,
  headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  },
});

export const GET = (async ({ params }) => {
  try {
    const token = params.token ?? "";
    const record = await service.moderationStore.readModerationToken(token);
    if (!record) {
      return page(
        "Enlace caducado",
        "<h1>Este enlace ya no es válido.</h1><p>Puede haber caducado o haberse utilizado anteriormente.</p>",
        410,
      );
    }

    const comment = await service.moderationStore.getComment(record.commentId);
    if (!comment) {
      return page("Comentario no encontrado", "<h1>Comentario no encontrado.</h1>", 404);
    }

    const label = actionLabel(record.action);
    return page(
      `Confirmar ${label}`,
      `<h1>Confirmar ${label}</h1>
       <p><strong>${escapeHtml(comment.nickname)} · ${escapeHtml(comment.authorCode)}</strong></p>
       <blockquote>${escapeHtml(comment.body)}</blockquote>
       <form method="post"><button type="submit">Sí, ${label} comentario</button></form>`,
    );
  } catch {
    return page(
      "Servicio no disponible",
      "<h1>No se pudo abrir la moderación.</h1><p>Inténtalo de nuevo más tarde.</p>",
      503,
    );
  }
}) satisfies APIRoute;

export const POST = (async ({ params }) => {
  try {
    const token = params.token ?? "";
    const record = await service.moderationStore.readModerationToken(token);
    if (!record) {
      return page(
        "Enlace caducado",
        "<h1>Este enlace ya no es válido.</h1><p>Puede haber caducado o haberse utilizado anteriormente.</p>",
        410,
      );
    }

    const comment = await service.moderationStore.moderateComment(
      record.commentId,
      record.action,
    );
    if (!comment) {
      return page("Comentario no encontrado", "<h1>Comentario no encontrado.</h1>", 404);
    }

    return page(
      "Moderación completada",
      `<h1>Moderación completada.</h1><p>El comentario se ha marcado como <strong>${escapeHtml(comment.status)}</strong>. Ya puedes cerrar esta página.</p>`,
    );
  } catch {
    return page(
      "Servicio no disponible",
      "<h1>No se pudo completar la moderación.</h1><p>El enlace no se ha marcado como usado. Inténtalo de nuevo.</p>",
      503,
    );
  }
}) satisfies APIRoute;
