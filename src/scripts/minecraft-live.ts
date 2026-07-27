import type {
  MinecraftActivityEvent,
  MinecraftLiveSnapshot,
} from "../types/minecraft-live";
import { formatRelativeTime } from "../lib/format-relative-time";
import {
  getVisibleActivityEvents,
  type GroupedMinecraftActivityEvent,
} from "../lib/group-activity-events";
import { getRandomEmptyPlayerMessage } from "../lib/empty-player-messages";
import { getPlayerAvatarUrl, STEVE_AVATAR_URL } from "../lib/minecraft/avatar";
import { getLiveFailureFeedback } from "../lib/minecraft/live-feedback";

const LIVE_ENDPOINT = "/api/minecraft/live";
const POLLING_INTERVAL_MS = 10_000;
const REQUEST_TIMEOUT_MS = POLLING_INTERVAL_MS - 1_000;

const eventLabels: Record<MinecraftActivityEvent["type"], string> = {
  join: "Entrada",
  leave: "Salida",
  death: "Muerte",
  advancement: "Logro",
  backup: "Backup",
  system: "Sistema",
};
const eventIcons: Record<MinecraftActivityEvent["type"], string> = {
  join: "/icons/house.svg",
  leave: "/icons/house.svg",
  death: "/icons/sword.svg",
  advancement: "/icons/sword.svg",
  backup: "/icons/cube.svg",
  system: "/icons/cube.svg",
};

const liveRoot = document.querySelector<HTMLElement>("[data-minecraft-live]");

if (liveRoot) {
  const apiBaseUrl = liveRoot.dataset.minecraftApiBase?.replace(/\/$/, "") || "";
  const apiUrl = (path: string) => `${apiBaseUrl}${path}`;
  const liveState = liveRoot.querySelector<HTMLElement>("[data-live-state]");
  const retryButton = liveRoot.querySelector<HTMLButtonElement>("[data-live-retry]");
  const statusBadge = liveRoot.querySelector<HTMLElement>("[data-status-badge]");
  const statusLabel = liveRoot.querySelector<HTMLElement>("[data-status-label]");
  const statusSummary = liveRoot.querySelector<HTMLElement>("[data-status-summary]");
  const playersMetric = liveRoot.querySelector<HTMLElement>('[data-status-metric="Jugadores"]');
  const worldDayMetric = liveRoot.querySelector<HTMLElement>(
    '[data-status-metric="Día del mundo"]',
  );
  let pollingId: number | undefined;
  let lastSuccessfulRefreshLabel = "";
  let loading = false;

  const setLiveState = (
    message: string,
    state: "loading" | "ready" | "stale" | "error",
  ) => {
    if (!liveState) return;

    liveState.textContent = message;
    liveState.dataset.state = state;
    if (retryButton) retryButton.hidden = false;
  };

  const applyAvatarFallback = (avatar: HTMLImageElement) => {
    if (avatar.src === STEVE_AVATAR_URL) return;

    avatar.src = avatar.dataset.fallbackSrc || STEVE_AVATAR_URL;
  };

  liveRoot.querySelectorAll<HTMLImageElement>("[data-player-avatar]").forEach((avatar) => {
    avatar.addEventListener("error", () => applyAvatarFallback(avatar), { once: true });
  });

  const createPlayerItem = (player: string) => {
    const item = document.createElement("li");
    const avatar = document.createElement("img");
    const presence = document.createElement("span");
    const playerCopy = document.createElement("span");
    const name = document.createElement("strong");
    const detail = document.createElement("small");

    avatar.className = "player-avatar";
    avatar.src = getPlayerAvatarUrl(player);
    avatar.dataset.playerAvatar = "";
    avatar.dataset.fallbackSrc = STEVE_AVATAR_URL;
    avatar.width = 28;
    avatar.height = 28;
    avatar.alt = "";
    avatar.setAttribute("aria-hidden", "true");
    avatar.addEventListener("error", () => applyAvatarFallback(avatar), { once: true });
    presence.className = "player-presence";
    presence.setAttribute("aria-hidden", "true");
    playerCopy.className = "player-copy";
    name.textContent = player;
    detail.textContent = "En el mundo";
    playerCopy.append(name, detail);

    item.append(avatar, presence, playerCopy);
    return item;
  };

  const updatePlayers = (players: string[]) => {
    liveRoot.querySelectorAll<HTMLElement>("[data-players-heading]").forEach((heading) => {
      heading.textContent = `${players.length} en línea`;
    });

    liveRoot.querySelectorAll<HTMLElement>("[data-player-feed]").forEach((feed) => {
      const list = feed.querySelector<HTMLUListElement>("[data-player-list]");
      const empty = feed.querySelector<HTMLElement>("[data-empty-players]");
      if (!list || !empty) return;

      const wasEmpty = list.hidden;
      list.replaceChildren(...players.map(createPlayerItem));
      list.hidden = players.length === 0;
      empty.hidden = players.length > 0;

      if (players.length === 0 && !wasEmpty) {
        empty.textContent = getRandomEmptyPlayerMessage();
      }
    });
  };

  const createActivityItem = (event: GroupedMinecraftActivityEvent) => {
    const item = document.createElement("li");
    const icon = document.createElement("span");
    const iconImage = document.createElement("img");
    const content = document.createElement("div");
    const meta = document.createElement("div");
    const type = document.createElement("span");
    const message = document.createElement("p");
    const copy = document.createElement("span");
    const time = document.createElement("time");
    const count = event.count > 1 ? document.createElement("strong") : undefined;

    item.className = "activity-event";
    item.dataset.activityType = event.type;
    icon.className = "activity-icon";
    icon.setAttribute("aria-hidden", "true");
    iconImage.src = eventIcons[event.type];
    iconImage.width = 28;
    iconImage.height = 28;
    iconImage.alt = "";
    icon.append(iconImage);
    content.className = "activity-copy";
    meta.className = "activity-meta";
    type.className = "activity-type";
    type.textContent = eventLabels[event.type];
    copy.textContent = event.message;
    time.dateTime = event.createdAt;
    time.textContent = formatRelativeTime(event.createdAt);
    message.append(copy);
    if (count) {
      count.className = "activity-count";
      count.setAttribute("aria-label", `${event.count} veces`);
      count.textContent = `x${event.count}`;
      message.append(count);
    }
    meta.append(type, time);
    content.append(meta, message);

    item.append(icon, content);
    return item;
  };

  const updateActivity = (events: MinecraftActivityEvent[]) => {
    const lists = liveRoot.querySelectorAll<HTMLUListElement>("[data-activity-list]");
    const emptyStates = liveRoot.querySelectorAll<HTMLElement>("[data-empty-activity]");
    const visibleEvents = getVisibleActivityEvents(events);

    lists.forEach((list) => {
      list.replaceChildren(...visibleEvents.map(createActivityItem));
      list.hidden = events.length === 0;
    });

    emptyStates.forEach((empty) => {
      empty.hidden = events.length > 0;
    });
  };

  const setUnavailableSnapshot = () => {
    if (statusBadge) {
      statusBadge.classList.remove("online", "offline");
      statusBadge.classList.add("unavailable");
      statusBadge.setAttribute("aria-label", "Estado no disponible");
    }
    if (statusLabel) statusLabel.textContent = "Sin datos";
    if (statusSummary) statusSummary.textContent = "Estado no disponible temporalmente";
    if (playersMetric) playersMetric.textContent = "—";
    if (worldDayMetric) worldDayMetric.textContent = "—";
    updatePlayers([]);
    updateActivity([]);
  };

  const applySnapshot = (snapshot: MinecraftLiveSnapshot) => {
    const statusText = snapshot.status.online ? "Servidor online" : "Servidor offline";

    if (statusBadge) {
      statusBadge.classList.remove("unavailable");
      statusBadge.classList.toggle("online", snapshot.status.online);
      statusBadge.classList.toggle("offline", !snapshot.status.online);
      statusBadge.setAttribute("aria-label", `Estado: ${statusText}`);
    }
    if (statusLabel) statusLabel.textContent = statusText;
    if (statusSummary) {
      statusSummary.textContent = snapshot.status.online
        ? "Todo funcionando con normalidad"
        : "El servidor está descansando";
    }
    if (playersMetric) {
      playersMetric.textContent = snapshot.status.playersOnline.toString();
    }
    if (worldDayMetric) {
      worldDayMetric.textContent =
        snapshot.status.worldDay === null ? "—" : snapshot.status.worldDay.toString();
    }
    updatePlayers(snapshot.status.players);
    updateActivity(snapshot.activity);

    lastSuccessfulRefreshLabel = new Intl.DateTimeFormat("es", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    setLiveState(`Actualizado ${lastSuccessfulRefreshLabel}`, "ready");
  };

  const loadSnapshot = async (signal?: AbortSignal) => {
    const response = await fetch(apiUrl(LIVE_ENDPOINT), {
      headers: {
        Accept: "application/json",
      },
      signal,
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar el estado del servidor");
    }

    applySnapshot((await response.json()) as MinecraftLiveSnapshot);
  };

  const stopPolling = () => {
    if (pollingId) {
      window.clearInterval(pollingId);
      pollingId = undefined;
    }
  };

  const handleLoadFailure = () => {
    const feedback = getLiveFailureFeedback(lastSuccessfulRefreshLabel);
    if (feedback.state === "error") setUnavailableSnapshot();
    setLiveState(feedback.message, feedback.state);
  };

  const refreshSnapshot = async () => {
    if (loading) return;
    loading = true;
    if (retryButton) retryButton.disabled = true;
    if (!lastSuccessfulRefreshLabel) setLiveState("Actualizando…", "loading");

    try {
      await loadSnapshot(AbortSignal.timeout(REQUEST_TIMEOUT_MS));
    } catch {
      handleLoadFailure();
    } finally {
      loading = false;
      if (retryButton) retryButton.disabled = false;
    }
  };

  const startPolling = () => {
    if (pollingId || document.hidden) {
      return;
    }

    void refreshSnapshot();

    pollingId = window.setInterval(() => {
      void refreshSnapshot();
    }, POLLING_INTERVAL_MS);
  };

  retryButton?.addEventListener("click", () => {
    void refreshSnapshot();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopPolling();
      return;
    }

    startPolling();
  });

  window.addEventListener("pagehide", stopPolling);
  window.addEventListener("pageshow", startPolling);

  window.addEventListener("beforeunload", stopPolling);

  setUnavailableSnapshot();
  startPolling();
}
