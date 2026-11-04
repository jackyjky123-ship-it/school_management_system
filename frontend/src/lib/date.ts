/**
 * Format a Date as the local YYYY-MM-DD value used by <input type="date">.
 * `toISOString()` would use UTC and can shift the date for users east of UTC.
 */
export function toLocalDateInputValue(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse an API date-only value (YYYY-MM-DD) as local midnight, not UTC.
 */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function formatDateOnly(value: string, options?: Intl.DateTimeFormatOptions): string {
  return parseDateOnly(value).toLocaleDateString(undefined, options);
}
