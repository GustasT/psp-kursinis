import { DateTime } from "luxon";

type DailyUsage = {
  dayStart: number;
  dayEnd: number;
  minutes: number;
};

export function splitByDay(startsAt: number, endsAt: number): DailyUsage[] {
  const days: DailyUsage[] = [];
  let cursor = startsAt;

  while (cursor < endsAt) {
    const localTime = DateTime.fromMillis(cursor, {
      zone: "Europe/Vilnius",
    });

    if (!localTime.isValid) {
      throw new Error("Nepavyko apskaičiuoti vietos laiko.");
    }

    const dayStart = localTime.startOf("day");
    const dayEnd = dayStart.plus({ days: 1 });
    const segmentEnd = Math.min(endsAt, dayEnd.toMillis());

    days.push({
      dayStart: dayStart.toMillis(),
      dayEnd: dayEnd.toMillis(),
      minutes: (segmentEnd - cursor) / 60_000,
    });

    cursor = segmentEnd;
  }

  return days;
}
