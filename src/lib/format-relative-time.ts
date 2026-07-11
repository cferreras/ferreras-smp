const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const formatRelativeTime = (value: string, now = Date.now()) => {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) return value;

  const elapsed = Math.max(0, now - timestamp);

  if (elapsed < MINUTE) return "hace unos segundos";
  if (elapsed < 15 * MINUTE) return "hace unos minutos";
  if (elapsed < HOUR) return "hace menos de una hora";
  if (elapsed < 2 * HOUR) return "hace una hora";
  if (elapsed < 4 * HOUR) return "hace unas horas";

  if (elapsed < DAY) {
    const hours = Math.floor(elapsed / (2 * HOUR)) * 2;
    return `hace ${hours} horas`;
  }

  if (elapsed < 2 * DAY) return "hace un día";
  if (elapsed < 7 * DAY) return `hace ${Math.floor(elapsed / DAY)} días`;
  if (elapsed < 30 * DAY) return "hace unas semanas";

  const months = Math.max(1, Math.floor(elapsed / (30 * DAY)));
  return months === 1 ? "hace un mes" : `hace ${months} meses`;
};
