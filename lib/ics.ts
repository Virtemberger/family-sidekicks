import type { EventSuggestion } from "@/lib/types";

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function getNextWeekdayDate(dayLabel: string, now = new Date()) {
  const weekdayMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  const target = weekdayMap[dayLabel] ?? 6;
  const date = new Date(now);
  const delta = (target - now.getDay() + 7) % 7 || 7;
  date.setDate(now.getDate() + delta);
  return date;
}

function formatIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function createEventIcs(event: EventSuggestion, now = new Date()) {
  const start = getNextWeekdayDate(event.dateLabel, now);
  const [hours = 10, minutes = 0] = event.time.split(":").map(Number);
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const uid = `${event.id}-${start.toISOString().slice(0, 10)}@family-ai-hub.demo`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Family AI Hub//Build Week 2026//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `LOCATION:${escapeIcs(`${event.venue}, ${event.city}`)}`,
    `DESCRIPTION:${escapeIcs(`${event.whyItFits}\nSource: ${event.sourceUrl}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
