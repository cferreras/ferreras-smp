import type { CommentRecord } from "./types.ts";
import { CommentStore } from "./store.ts";

const escapeDiscord = (value: string) => value
  .replace(/\\/g, "\\\\")
  .replace(/([*_`~|>])/g, "\\$1")
  .replace(/@/g, "@\u200b");

const preview = (value: string, maximum = 700) =>
  value.length > maximum ? `${value.slice(0, maximum - 1)}…` : value;

export const sendModerationNotification = async ({
  store,
  comment,
  webhookUrl,
  publicApiUrl,
  fetcher = fetch,
}: {
  store: CommentStore;
  comment: CommentRecord;
  webhookUrl: string;
  publicApiUrl: string;
  fetcher?: typeof fetch;
}) => {
  const actions = ["approve", "reject", "delete"] as const;
  const tokens = await store.createModerationTokens(comment.id);
  if (!tokens) return false;

  const links = actions.map((action, index) => {
    const url = new URL(`/api/comments/moderate/${tokens[index]}`, publicApiUrl);
    const label = action === "approve" ? "Aprobar" : action === "reject" ? "Rechazar" : "Eliminar";
    return `[${label}](${url.href})`;
  }).join(" · ");

  try {
    const response = await fetcher(`${webhookUrl}?wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Moderación del blog",
        allowed_mentions: { parse: [] },
        embeds: [{
          title: comment.status === "pending"
            ? "Comentario en cuarentena"
            : "Comentario denunciado",
          description: preview(escapeDiscord(comment.body)),
          color: comment.status === "pending" ? 0xf59e0b : 0xef4444,
          fields: [
            {
              name: "Identidad",
              value: `${escapeDiscord(comment.nickname)} · ${comment.authorCode} · ${comment.avatar}`,
              inline: true,
            },
            {
              name: "Artículo",
              value: escapeDiscord(comment.postSlug),
              inline: true,
            },
            {
              name: "Riesgo / denuncias",
              value: `${comment.riskScore} / ${comment.reportCount}`,
              inline: true,
            },
            {
              name: "Acciones",
              value: links,
            },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
      signal: AbortSignal.timeout(6_000),
    });

    if (!response.ok) throw new Error(`Discord webhook returned ${response.status}`);
    return true;
  } catch (error) {
    await Promise.all(tokens.map((token) => store.deleteModerationToken(token)));
    throw error;
  }
};

export const notifyOrQueue = async (
  store: CommentStore,
  comment: CommentRecord,
  webhookUrl: string,
  publicApiUrl: string,
) => {
  try {
    await sendModerationNotification({ store, comment, webhookUrl, publicApiUrl });
    await store.clearNotification(comment.id);
    return true;
  } catch {
    await store.queueNotification(comment.id);
    return false;
  }
};

export const retryQueuedNotifications = async (
  store: CommentStore,
  webhookUrl: string,
  publicApiUrl: string,
) => {
  const ids = await store.getQueuedNotifications();

  for (const id of ids) {
    const comment = await store.getComment(id);
    const needsNotification = comment?.status === "pending"
      || (comment?.status === "published" && comment.reportCount >= 2);
    if (!comment || !needsNotification) {
      await store.clearNotification(id);
      continue;
    }

    const sent = await notifyOrQueue(store, comment, webhookUrl, publicApiUrl);
    if (!sent) break;
  }
};
