import type { MinecraftActivityEvent } from "../types/minecraft-live";

export type GroupedMinecraftActivityEvent = MinecraftActivityEvent & {
  count: number;
};
export const MAX_VISIBLE_ACTIVITY_EVENTS = 10;
export const ACTIVITY_EVENT_LOOKBACK_LIMIT = 50;

const REPEATED_EVENT_WINDOW_MS = 5 * 60 * 1_000;

const getEventGroupKey = (event: MinecraftActivityEvent) => {
  const player = event.player?.trim().toLocaleLowerCase("es");

  if (player && (event.type === "join" || event.type === "leave" || event.type === "death")) {
    return `${event.type}:${player}`;
  }

  return `${event.type}:${event.message.trim().toLocaleLowerCase("es")}`;
};

export const groupActivityEvents = (
  events: MinecraftActivityEvent[],
): GroupedMinecraftActivityEvent[] => {
  const grouped: GroupedMinecraftActivityEvent[] = [];
  const latestGroupByKey = new Map<string, GroupedMinecraftActivityEvent>();

  for (const event of events) {
    const key = getEventGroupKey(event);
    const latestGroup = latestGroupByKey.get(key);
    const latestTimestamp = latestGroup ? Date.parse(latestGroup.createdAt) : Number.NaN;
    const eventTimestamp = Date.parse(event.createdAt);
    const isWithinWindow =
      latestGroup !== undefined &&
      Number.isFinite(latestTimestamp) &&
      Number.isFinite(eventTimestamp) &&
      Math.abs(latestTimestamp - eventTimestamp) <= REPEATED_EVENT_WINDOW_MS;

    if (latestGroup && isWithinWindow) {
      latestGroup.count += 1;
      continue;
    }

    const newGroup = { ...event, count: 1 };
    grouped.push(newGroup);
    latestGroupByKey.set(key, newGroup);
  }

  return grouped;
};

export const getVisibleActivityEvents = (events: MinecraftActivityEvent[]) =>
  groupActivityEvents(events).slice(0, MAX_VISIBLE_ACTIVITY_EVENTS);
