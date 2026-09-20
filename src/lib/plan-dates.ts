import { addDays, format, parseISO } from "date-fns";

const DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export function planDayDate(startDate: string | null, week: number, day: string) {
  if (!startDate) return null;
  const start = parseISO(startDate);
  if (Number.isNaN(start.getTime())) return null;
  const targetDay = DAY_INDEX[day];
  if (targetDay == null) return null;
  const firstOccurrence = (targetDay - start.getDay() + 7) % 7;
  return addDays(start, firstOccurrence + (week - 1) * 7);
}

export function planDayLabel(startDate: string | null, week: number, day: string) {
  const date = planDayDate(startDate, week, day);
  return date ? format(date, "EEE d MMM") : day;
}