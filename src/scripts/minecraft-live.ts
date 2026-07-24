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

const eventLabels: Record<MinecraftActivityEvent["type"], string> = {
  join: "Entrada",
  leave: "Salida",
  death: "Muerte",
  advancement: "Logro",
  backup: "Backup",
  system: "Sistema",
};

const liveRoot = document.querySelector<HTMLElement>("[data-minecraft-live]");

if (liveRoot) {
  const apiBaseUrl = liveRoot.dataset.minecraftApiBase?.replace(/\/$/, "") || "";
  const apiUrl = (path: string) => `${apiBaseUrl}${path}`;
  const liveState = liveRoot.querySelector<HTMLElement>("[data-live-state]");
  const retryButton = liveRoot.querySelector<HTMLButtonElement>("[data-live-retry]");
  let pollingId: number | undefined;
  let lastUpdatedLabel = "";
  let loading = false;

  const setLiveState = (
    message: string,
    state: "loading" | "ready" | "stale" | "error",
    canRetry = false,
  ) => {
    if (!liveState) return;

    liveState.textContent = message;
    liveState.dataset.state = state;
    if (retryButton) retryButton.hidden = !canRetry;
  };

  const applyAvatarFallback = (avatar: HTMLImageElement) => {
    if (avatar.src === STEVE_AVATAR_URL) return;

    avatar.src = avatar.dataset.fallbackSrc || STEVE_AVATAR_URL;
  };

  document.querySelectorAll<HTMLImageElement>("[data-player-avatar]").forEach((avatar) => {
    avatar.addEventListener("error", () => applyAvatarFallback(avatar), { once: true });
  });

  const createPlayerItem = (player: string) => {
    const item = document.createElement("li");
    const avatar = document.createElement("img");
    const name = document.createElement("strong");

    avatar.className = "player-avatar";
    avatar.src = getPlayerAvatarUrl(player);
    avatar.dataset.playerAvatar = "";
    avatar.dataset.fallbackSrc = STEVE_AVATAR_URL;
    avatar.width = 28;
    avatar.height = 28;
    avatar.alt = "";
    avatar.setAttribute("aria-hidden", "true");
    avatar.addEventListener("error", () => applyAvatarFallback(avatar), { once: true });
    name.textContent = player;

    item.append(avatar, name);
    return item;
  };

  const updatePlayers = (players: string[]) => {
    document.querySelectorAll<HTMLElement>("[data-players-heading]").forEach((heading) => {
      heading.textContent = `${players.length} ahora`;
    });

    document.querySelectorAll<HTMLElement>("[data-player-feed]").forEach((feed) => {
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
    const type = document.createElement("span");
    const message = document.createElement("p");
    const copy = document.createElement("span");
    const time = document.createElement("time");
    const count = event.count > 1 ? document.createElement("strong") : undefined;

    item.className = "activity-event";
    item.dataset.activityType = event.type;
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

    item.append(type, message, time);
    return item;
  };

  const updateActivity = (events: MinecraftActivityEvent[]) => {
    const lists = document.querySelectorAll<HTMLUListElement>("[data-activity-list]");
    const emptyStates = document.querySelectorAll<HTMLElement>("[data-empty-activity]");
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
    const statusBadge = document.querySelector<HTMLElement>("[data-status-badge]");
    const statusLabel = document.querySelector<HTMLElement>("[data-status-label]");
    const playersMetric = document.querySelector<HTMLElement>('[data-status-metric="Jugadores"]');
    const worldDayMetric = document.querySelector<HTMLElement>(
      '[data-status-metric="Día del mundo"]',
    );
    const tpsMetric = document.querySelector<HTMLElement>('[data-status-metric="TPS"]');

    if (statusBadge) {
      statusBadge.classList.remove("online", "offline");
      statusBadge.classList.add("unavailable");
      statusBadge.setAttribute("aria-label", "Estado no disponible");
    }
    if (statusLabel) statusLabel.textContent = "Sin datos";
    if (playersMetric) playersMetric.textContent = "No disponible";
    if (worldDayMetric) worldDayMetric.textContent = "No disponible";
    if (tpsMetric) tpsMetric.textContent = "No disponible";
    updatePlayers([]);
    updateActivity([]);
  };

  const applySnapshot = (snapshot: MinecraftLiveSnapshot) => {
    const statusBadge = document.querySelector<HTMLElement>("[data-status-badge]");
    const statusLabel = document.querySelector<HTMLElement>("[data-status-label]");
    const playersMetric = document.querySelector<HTMLElement>('[data-status-metric="Jugadores"]');
    const worldDayMetric = document.querySelector<HTMLElement>(
      '[data-status-metric="Día del mundo"]',
    );
    const tpsMetric = document.querySelector<HTMLElement>('[data-status-metric="TPS"]');
    const statusText = snapshot.status.online ? "Online" : "Offline";

    if (statusBadge) {
      statusBadge.classList.remove("unavailable");
      statusBadge.classList.toggle("online", snapshot.status.online);
      statusBadge.classList.toggle("offline", !snapshot.status.online);
      statusBadge.setAttribute("aria-label", `Estado: ${statusText}`);
    }
    if (statusLabel) statusLabel.textContent = statusText;
    if (playersMetric) {
      playersMetric.textContent = `${snapshot.status.playersOnline} / ${snapshot.status.maxPlayers}`;
    }
    if (worldDayMetric) {
      worldDayMetric.textContent =
        snapshot.status.worldDay === null ? "No disponible" : snapshot.status.worldDay.toString();
    }
    if (tpsMetric) {
      tpsMetric.textContent =
        snapshot.status.tps === null ? "No disponible" : snapshot.status.tps.toFixed(1);
    }
    updatePlayers(snapshot.status.players);
    updateActivity(snapshot.activity);

    const serverUpdatedAt = new Date(snapshot.status.lastUpdated);
    lastUpdatedLabel = new Intl.DateTimeFormat("es", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(Number.isNaN(serverUpdatedAt.getTime()) ? new Date() : serverUpdatedAt);
    setLiveState(`Actualizado ${lastUpdatedLabel}`, "ready");
  };

  const loadSnapshot = async () => {
    const response = await fetch(apiUrl(LIVE_ENDPOINT), {
      headers: {
        Accept: "application/json",
      },
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
    const feedback = getLiveFailureFeedback(lastUpdatedLabel);
    if (feedback.state === "error") setUnavailableSnapshot();
    setLiveState(feedback.message, feedback.state, true);
  };

  const refreshSnapshot = async () => {
    if (loading) return;
    loading = true;
    if (retryButton) retryButton.disabled = true;
    if (!lastUpdatedLabel) setLiveState("Actualizando…", "loading");

    try {
      await loadSnapshot();
    } catch {
      handleLoadFailure();
    } finally {
      loading = false;
      if (retryButton) retryButton.disabled = false;
    }
  };

  const startPolling = () => {
    if (pollingId) {
      return;
    }

    setUnavailableSnapshot();
    void refreshSnapshot();

    pollingId = window.setInterval(() => {
      void refreshSnapshot();
    }, POLLING_INTERVAL_MS);
  };

  retryButton?.addEventListener("click", () => {
    void refreshSnapshot();
  });

  window.addEventListener("beforeunload", () => {
    stopPolling();
  });

  startPolling();
}
