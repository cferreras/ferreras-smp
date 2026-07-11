import type {
  MinecraftActivityEvent,
  MinecraftLiveSnapshot,
  MinecraftPoll,
  MinecraftPollOption,
} from "../types/minecraft-live";
import { formatRelativeTime } from "../lib/format-relative-time";
import { getRandomEmptyPlayerMessage } from "../lib/empty-player-messages";
import { getPlayerAvatarUrl, STEVE_AVATAR_URL } from "../lib/minecraft/avatar";

type VoteResponse =
  | {
      ok: true;
      poll: MinecraftPoll;
    }
  | {
      ok: false;
      error: string;
    };

const LIVE_ENDPOINT = "/api/minecraft/live";
const STREAM_ENDPOINT = "/api/minecraft/stream";
const VOTE_ENDPOINT = "/api/minecraft/poll/vote";
const POLLING_INTERVAL_MS = 10_000;

const eventLabels: Record<MinecraftActivityEvent["type"], string> = {
  join: "Entrada",
  leave: "Salida",
  death: "Muerte",
  advancement: "Logro",
  backup: "Backup",
  system: "Sistema",
};

const liveSection = document.querySelector<HTMLElement>("[data-live-server]");

if (liveSection) {
  const apiBaseUrl = liveSection.dataset.minecraftApiBase?.replace(/\/$/, "") || "";
  const apiUrl = (path: string) => `${apiBaseUrl}${path}`;
  const liveState = liveSection.querySelector<HTMLElement>("[data-live-state]");
  const pollFeedback = liveSection.querySelector<HTMLElement>("[data-poll-feedback]");
  let eventSource: EventSource | undefined;
  let pollingId: number | undefined;
  let isVoting = false;

  const setLiveState = (message: string, isError = false) => {
    if (!liveState) return;

    liveState.textContent = message;
    liveState.dataset.state = isError ? "error" : "ready";
  };

  const setPollFeedback = (message: string, isError = false) => {
    if (!pollFeedback) return;

    pollFeedback.textContent = message;
    pollFeedback.dataset.state = isError ? "error" : "ready";
  };

  const formatVotes = (votes: number) => `${votes} ${votes === 1 ? "voto" : "votos"}`;

  const applyAvatarFallback = (avatar: HTMLImageElement) => {
    if (avatar.src === STEVE_AVATAR_URL) return;

    avatar.src = avatar.dataset.fallbackSrc || STEVE_AVATAR_URL;
  };

  liveSection.querySelectorAll<HTMLImageElement>("[data-player-avatar]").forEach((avatar) => {
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
    const heading = liveSection.querySelector<HTMLElement>("[data-players-heading]");
    const list = liveSection.querySelector<HTMLUListElement>("[data-player-list]");
    const empty = liveSection.querySelector<HTMLElement>("[data-empty-players]");

    if (heading) {
      heading.textContent = `${players.length} ahora`;
    }

    if (!list || !empty) {
      return;
    }

    const wasEmpty = list.hidden;

    list.replaceChildren(...players.map(createPlayerItem));
    list.hidden = players.length === 0;
    empty.hidden = players.length > 0;

    if (players.length === 0 && !wasEmpty) {
      empty.textContent = getRandomEmptyPlayerMessage();
    }
  };

  const createActivityItem = (event: MinecraftActivityEvent) => {
    const item = document.createElement("li");
    const type = document.createElement("span");
    const message = document.createElement("p");
    const time = document.createElement("time");

    item.className = "activity-event";
    item.dataset.activityType = event.type;
    type.className = "activity-type";
    type.textContent = eventLabels[event.type];
    message.textContent = event.message;
    time.dateTime = event.createdAt;
    time.textContent = formatRelativeTime(event.createdAt);

    item.append(type, message, time);
    return item;
  };

  const updateActivity = (events: MinecraftActivityEvent[]) => {
    const list = liveSection.querySelector<HTMLUListElement>("[data-activity-list]");
    const empty = liveSection.querySelector<HTMLElement>("[data-empty-activity]");

    if (!list) {
      return;
    }

    list.replaceChildren(...events.map(createActivityItem));
    list.hidden = events.length === 0;

    if (empty) {
      empty.hidden = events.length > 0;
    }
  };

  const createPollOption = (option: MinecraftPollOption) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    const copy = document.createElement("span");
    const label = document.createElement("strong");
    const percentage = document.createElement("span");
    const progress = document.createElement("span");
    const progressBar = document.createElement("span");
    const votes = document.createElement("span");
    const results = document.createElement("span");

    item.className = "poll-option";
    button.type = "button";
    button.className = "poll-option-button";
    button.dataset.pollOption = option.id;
    button.setAttribute("aria-label", `Votar por ${option.label}`);

    copy.className = "poll-option-copy";
    label.dataset.pollOptionLabel = "";
    label.textContent = option.label;
    percentage.dataset.pollOptionPercentage = "";
    percentage.textContent = `${option.percentage}%`;

    progress.className = "poll-progress";
    progress.dataset.pollProgress = "";
    progress.setAttribute("role", "progressbar");
    progress.setAttribute("aria-label", `Apoyo actual para ${option.label}`);
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");
    progress.setAttribute("aria-valuenow", option.percentage.toString());

    progressBar.dataset.pollProgressBar = "";
    progressBar.style.width = `${option.percentage}%`;

    results.className = "poll-option-results";
    votes.dataset.pollOptionVotes = "";
    votes.textContent = formatVotes(option.votes);

    progress.append(progressBar);
    copy.append(label);
    results.append(votes, percentage);
    button.append(copy, progress, results);
    item.append(button);

    return item;
  };

  const updatePollOption = (button: HTMLButtonElement, option: MinecraftPollOption) => {
    const label = button.querySelector<HTMLElement>("[data-poll-option-label]");
    const percentage = button.querySelector<HTMLElement>("[data-poll-option-percentage]");
    const progress = button.querySelector<HTMLElement>("[data-poll-progress]");
    const progressBar = button.querySelector<HTMLElement>("[data-poll-progress-bar]");
    const votes = button.querySelector<HTMLElement>("[data-poll-option-votes]");

    button.dataset.pollOption = option.id;
    button.disabled = isVoting;
    button.setAttribute("aria-label", `Votar por ${option.label}`);

    if (label) label.textContent = option.label;
    if (percentage) percentage.textContent = `${option.percentage}%`;
    if (progress) {
      progress.setAttribute("aria-label", `Apoyo actual para ${option.label}`);
      progress.setAttribute("aria-valuenow", option.percentage.toString());
    }
    if (progressBar) progressBar.style.width = `${option.percentage}%`;
    if (votes) votes.textContent = formatVotes(option.votes);
  };

  const setPollButtonsDisabled = (disabled: boolean) => {
    liveSection
      .querySelectorAll<HTMLButtonElement>("[data-poll-option]")
      .forEach((button) => {
        button.disabled = disabled;
      });
  };

  const updatePoll = (poll?: MinecraftPoll) => {
    const pollCard = liveSection.querySelector<HTMLElement>("[data-community-poll]");
    const question = liveSection.querySelector<HTMLElement>("[data-poll-question]");
    const list = liveSection.querySelector<HTMLUListElement>("[data-poll-list]");

    if (!pollCard || !list) {
      return;
    }

    pollCard.hidden = !poll;

    if (!poll) {
      list.replaceChildren();
      return;
    }

    if (question) {
      question.textContent = poll.question;
    }

    const existingButtons = new Map(
      Array.from(list.querySelectorAll<HTMLButtonElement>("[data-poll-option]")).map((button) => [
        button.dataset.pollOption,
        button,
      ]),
    );

    if (existingButtons.size !== poll.options.length) {
      list.replaceChildren(...poll.options.map(createPollOption));
    } else {
      poll.options.forEach((option) => {
        const button = existingButtons.get(option.id);

        if (button) {
          updatePollOption(button, option);
        }
      });
    }

    setPollButtonsDisabled(isVoting);
  };

  const applySnapshot = (snapshot: MinecraftLiveSnapshot) => {
    const statusBadge = liveSection.querySelector<HTMLElement>("[data-status-badge]");
    const statusLabel = liveSection.querySelector<HTMLElement>("[data-status-label]");
    const playersMetric = liveSection.querySelector<HTMLElement>('[data-status-metric="Jugadores"]');
    const worldDayMetric = liveSection.querySelector<HTMLElement>(
      '[data-status-metric="Día del mundo"]',
    );
    const tpsMetric = liveSection.querySelector<HTMLElement>('[data-status-metric="TPS"]');
    const statusText = snapshot.status.online ? "Online" : "Offline";

    if (statusBadge) {
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
    updatePoll(snapshot.poll);
    setLiveState("Actualizado en directo");
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

  const startPolling = () => {
    if (pollingId) {
      return;
    }

    setLiveState("Actualizando…");
    void loadSnapshot().catch(() => setLiveState("Estado no disponible temporalmente", true));

    pollingId = window.setInterval(() => {
      void loadSnapshot().catch(() => setLiveState("Estado no disponible temporalmente", true));
    }, POLLING_INTERVAL_MS);
  };

  const startStream = () => {
    if (!("EventSource" in window)) {
      startPolling();
      return;
    }

    eventSource = new EventSource(apiUrl(STREAM_ENDPOINT));

    eventSource.addEventListener("snapshot", (event) => {
      try {
        applySnapshot(JSON.parse(event.data) as MinecraftLiveSnapshot);
        stopPolling();
      } catch {
        setLiveState("Estado no disponible temporalmente", true);
      }
    });

    eventSource.onerror = () => {
      eventSource?.close();
      eventSource = undefined;
      startPolling();
    };
  };

  const vote = async (optionId: string) => {
    if (isVoting) {
      return;
    }

    isVoting = true;
    setPollButtonsDisabled(true);
    setPollFeedback("Enviando voto…");

    try {
      const response = await fetch(apiUrl(VOTE_ENDPOINT), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ optionId }),
      });
      const result = (await response.json()) as VoteResponse;

      if (!response.ok || !result.ok) {
        throw new Error(result.ok ? "No se pudo votar" : result.error);
      }

      updatePoll(result.poll);
      setPollFeedback("Voto registrado");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo votar";
      setPollFeedback(message, true);
    } finally {
      isVoting = false;
      setPollButtonsDisabled(false);
    }
  };

  liveSection.addEventListener("click", (event) => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>("[data-poll-option]");

    if (!button || !liveSection.contains(button)) {
      return;
    }

    const optionId = button.dataset.pollOption;

    if (optionId) {
      void vote(optionId);
    }
  });

  window.addEventListener("beforeunload", () => {
    eventSource?.close();
    stopPolling();
  });

  void loadSnapshot()
    .then(startStream)
    .catch(() => {
      setLiveState("Estado no disponible temporalmente", true);
      startPolling();
    });
}
