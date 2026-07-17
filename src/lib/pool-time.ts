export const POOL_TIME_ZONE = "America/Santo_Domingo";

export interface PoolDateParts {
  year: number;
  month: number;
  day: number;
}

export interface PoolDateTimeParts extends PoolDateParts {
  hour: number;
  minute: number;
  second: number;
}

const poolDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: POOL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function partsToRecord(date: Date): Record<string, number> {
  return Object.fromEntries(
    poolDateTimeFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );
}

export function getPoolDateTimeParts(date: Date): PoolDateTimeParts {
  const parts = partsToRecord(date);
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

export function getPoolDateKey(date: Date = new Date()): string {
  const { year, month, day } = getPoolDateTimeParts(date);
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function getDateKeyParts(dateKey: string): PoolDateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) throw new Error(`Fecha inválida: ${dateKey}`);

  const parts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  const check = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (
    check.getUTCFullYear() !== parts.year ||
    check.getUTCMonth() !== parts.month - 1 ||
    check.getUTCDate() !== parts.day
  ) {
    throw new Error(`Fecha inválida: ${dateKey}`);
  }
  return parts;
}

export function dateKeyFromParts(year: number, month: number, day: number): string {
  const dateKey = `${year}-${pad(month)}-${pad(day)}`;
  getDateKeyParts(dateKey);
  return dateKey;
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const { year, month, day } = getDateKeyParts(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return dateKeyFromParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function getDateKeyDay(dateKey: string): number {
  const { year, month, day } = getDateKeyParts(dateKey);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function getPoolWeekStartDateKey(date: Date = new Date()): string {
  const dateKey = getPoolDateKey(date);
  return getWeekStartForDateKey(dateKey);
}

export function getWeekStartForDateKey(dateKey: string): string {
  return addDaysToDateKey(dateKey, -getDateKeyDay(dateKey));
}

function getPoolOffsetMs(date: Date): number {
  const parts = getPoolDateTimeParts(date);
  const representedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return representedAsUtc - Math.floor(date.getTime() / 1000) * 1000;
}

export function poolDateTime(
  dateKey: string,
  hour = 0,
  minute = 0,
  second = 0
): Date {
  const { year, month, day } = getDateKeyParts(dateKey);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  let offset = getPoolOffsetMs(utcGuess);
  let result = new Date(utcGuess.getTime() - offset);

  // Recalculate once so this remains correct if the timezone ever changes offset.
  const correctedOffset = getPoolOffsetMs(result);
  if (correctedOffset !== offset) {
    offset = correctedOffset;
    result = new Date(utcGuess.getTime() - offset);
  }

  return result;
}
