/** Converts HH:mm (24h) to 12-hour display, e.g. `13:00` → `01:00 PM`. */
export function formatTime12h(time: string): string {
  if (!time) return '';
  const [hoursStr, minutesStr = '00'] = time.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

/** Converts 12-hour display time back to HH:mm. */
export function parseTimeTo24h(label: string): string | null {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();
  if (period === 'AM') {
    if (hours === 12) hours = 0;
  } else if (hours !== 12) {
    hours += 12;
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Minutes from midnight for chronological sorting of 12h labels. */
export function timeLabelToMinutes(label: string): number {
  const parsed = parseTimeTo24h(label);
  if (!parsed) return Number.MAX_SAFE_INTEGER;
  const [hours, minutes] = parsed.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Sort 12h labels chronologically (e.g. 08:00 AM … 07:00 PM), not alphabetically. */
export function sortTimeLabels12h(labels: string[]): string[] {
  return [...labels].sort((a, b) => timeLabelToMinutes(a) - timeLabelToMinutes(b));
}
