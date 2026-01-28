import type { InvoicedLessonRow } from "./types";

export function createMockLessonRows(): InvoicedLessonRow[] {
  const mk = (
    id: string,
    date: Date,
    time: string,
    program: string,
    student: string,
    durationHrs: number,
    ratePerHour: number,
    costOverride?: number
  ): InvoicedLessonRow => ({
    id,
    rowType: "data",
    date,
    time,
    program,
    student,
    durationHrs,
    ratePerHour,
    cost: costOverride ?? Number((durationHrs * ratePerHour).toFixed(2)),
  });

  // Mirrors the screenshot dataset (Jan 19–24, 2026)
  return [
    // Monday, Jan 19th, 2026
    mk("m-1", new Date(2026, 0, 19), "04:00 PM", "Ukulele", "Nicholas Olah", 0.5, 25, 0),

    // Tuesday, Jan 20th, 2026
    mk("t-1", new Date(2026, 0, 20), "07:00 PM", "xGuitar Hybrid", "Evan Fortino", 0.75, 25),
    mk("t-2", new Date(2026, 0, 20), "06:00 PM", "Guitar Hybrid", "Kaylan Ramsewak", 0.5, 25),
    mk("t-3", new Date(2026, 0, 20), "05:30 PM", "Guitar Contemporary", "Justin Arsenault", 0.5, 25),
    mk("t-4", new Date(2026, 0, 20), "06:30 PM", "Guitar Core", "Aum Chattopadhyay", 0.5, 25),
    mk("t-5", new Date(2026, 0, 20), "05:00 PM", "Ukulele", "Nicholas Olah", 0.5, 25),
    mk("t-6", new Date(2026, 0, 20), "08:00 PM", "xGuitar Contemporary", "Mike Trus", 0.75, 25),
    mk("t-7", new Date(2026, 0, 20), "04:15 PM", "Guitar Contemporary", "Caleb Klassen", 0.75, 25),

    // Thursday, Jan 22nd, 2026
    mk("th-1", new Date(2026, 0, 22), "07:00 PM", "Guitar Core", "Hannah Taheri", 0.5, 25),
    mk("th-2", new Date(2026, 0, 22), "05:00 PM", "Guitar Hybrid", "Mohamad Almasri", 0.5, 25),
    mk("th-3", new Date(2026, 0, 22), "06:30 PM", "Ukulele", "Emma Taheri", 0.5, 25),
    mk("th-4", new Date(2026, 0, 22), "07:30 PM", "Bass Guitar", "Eugene Trufanov", 0.5, 25),
    mk("th-5", new Date(2026, 0, 22), "05:30 PM", "Guitar Core", "Ethan Osborne", 0.75, 25),

    // Friday, Jan 23rd, 2026
    mk("f-1", new Date(2026, 0, 23), "05:30 PM", "Guitar Core", "Aaliyaan Mawji", 0.5, 25),
    mk("f-2", new Date(2026, 0, 23), "05:00 PM", "Guitar Contemporary", "Ranveer Chadha", 0.5, 25),
    mk("f-3", new Date(2026, 0, 23), "06:00 PM", "Guitar Hybrid", "Aarav Bodhani", 0.5, 25),
    mk("f-4", new Date(2026, 0, 23), "04:00 PM", "Guitar Contemporary", "Kyuha Lee", 0.5, 25),
  ];
}

