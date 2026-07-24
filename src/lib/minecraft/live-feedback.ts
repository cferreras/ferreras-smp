export const getLiveFailureFeedback = (lastUpdatedLabel: string) =>
  lastUpdatedLabel
    ? {
        state: "stale" as const,
        message: `Sin conexión · Últimos datos ${lastUpdatedLabel}`,
      }
    : {
        state: "error" as const,
        message: "Estado no disponible temporalmente",
      };
