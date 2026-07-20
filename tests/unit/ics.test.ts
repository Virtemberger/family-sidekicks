import { describe, expect, it } from "vitest";
import { createEventIcs, getNextWeekdayDate } from "../../lib/ics";
import type { EventSuggestion } from "../../lib/types";

const event: EventSuggestion = {
  id: "space-day",
  title: "Space, rockets; and stars",
  dateLabel: "Saturday",
  time: "10:30",
  venue: "Science Lab",
  city: "Stuttgart",
  priceLabel: "EUR",
  ageLabel: "Ages 4+",
  whyItFits: "Mia can draw, Leo can explore.",
  sourceName: "Science Lab",
  sourceUrl: "https://example.com/event",
};

describe("calendar export", () => {
  it("chooses the next occurrence of the requested weekday", () => {
    const friday = new Date("2026-07-17T12:00:00+02:00");
    expect(getNextWeekdayDate("Saturday", friday).getDate()).toBe(18);
  });

  it("exports a valid event and escapes reserved text", () => {
    const now = new Date("2026-07-17T12:00:00+02:00");
    const ics = createEventIcs(event, now);

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:Space\\, rockets\\; and stars");
    expect(ics).toContain("Source: https://example.com/event");
    expect(ics).toContain("END:VCALENDAR");
  });
});
