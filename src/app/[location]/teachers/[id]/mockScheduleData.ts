/**
 * Mock data and types for Teacher Schedule Calendar
 * This file provides mock data structures and sample data for development
 */

// ---------------------------------------------
// Schedule Data Types
// ---------------------------------------------

export interface LessonEvent {
  lessonId: number;
  isOwing: boolean | null;
  isOwingRentalAgreement: boolean | null;
  resourceId: number; // Day of week (1-7, Monday-Sunday)
  title: string;
  start: string; // ISO date string
  end: string; // ISO date string
  url: string;
  className: string;
  backgroundColor: string;
  isOnline: boolean;
  programId: number | null;
}

export interface ScheduleAvailabilityEvent {
  resourceId: number; // Day of week (1-7, Monday-Sunday)
  start: string; // ISO date string
  end: string; // ISO date string
  rendering: string; // "background"
  className: string;
  backgroundColor: string;
}

export interface TimeRange {
  from: string; // Format: "HH:mm:ss"
  to: string; // Format: "HH:mm:ss"
}

export interface DateRange {
  from: string; // Format: "YYYY-MM-DD"
  to: string; // Format: "YYYY-MM-DD"
}

export interface TeacherScheduleData {
  lessons: LessonEvent[];
  availability: ScheduleAvailabilityEvent[];
  time: TimeRange;
  date: DateRange;
  totalEvents: number;
  teacherId: number;
}

// ---------------------------------------------
// Mock Data Storage (In-memory)
// ---------------------------------------------

// Store schedule data per teacher (simulating database)
const scheduleStore: Record<number, TeacherScheduleData> = {};

// ---------------------------------------------
// Sample Data Generator
// ---------------------------------------------

/**
 * Get Monday of the week for a given date
 */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get Sunday of the week for a given date
 */
function getSunday(date: Date): Date {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

/**
 * Get date for a specific day of week in the current week
 */
function getDateForDay(baseDate: Date, dayOfWeek: number): Date {
  const monday = getMonday(baseDate);
  const date = new Date(monday);
  date.setDate(monday.getDate() + (dayOfWeek - 1)); // dayOfWeek is 1-7 (Monday-Sunday)
  return date;
}

/**
 * Generates sample schedule data for a teacher
 */
export const generateSampleSchedule = (
  teacherId: number,
  date?: string
): TeacherScheduleData => {
  const baseDate = date ? new Date(date) : new Date();
  const monday = getMonday(baseDate);
  const sunday = getSunday(baseDate);

  // Generate lesson events for the week
  const lessons: LessonEvent[] = [
    {
      lessonId: 1,
      isOwing: false,
      isOwingRentalAgreement: false,
      resourceId: 1, // Monday
      title: "John Doe ( Piano )",
      start: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 9, 0).toISOString(),
      end: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 9, 30).toISOString(),
      url: `/admin/training-location/lesson/view?id=1`,
      className: "lesson-event",
      backgroundColor: "#5b9bd5",
      isOnline: false,
      programId: 1,
    },
    {
      lessonId: 2,
      isOwing: true,
      isOwingRentalAgreement: false,
      resourceId: 1, // Monday
      title: "Jane Smith ( Guitar )",
      start: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 10, 0).toISOString(),
      end: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 10, 30).toISOString(),
      url: `/admin/training-location/lesson/view?id=2`,
      className: "lesson-event-owing",
      backgroundColor: "#ff6b6b",
      isOnline: false,
      programId: 2,
    },
    {
      lessonId: 3,
      isOwing: false,
      isOwingRentalAgreement: false,
      resourceId: 2, // Tuesday
      title: "Group Lesson ( Music Theory ) ( 5 )",
      start: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 1, 14, 0).toISOString(),
      end: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 1, 15, 0).toISOString(),
      url: `/admin/training-location/lesson/view?id=3`,
      className: "lesson-event-group",
      backgroundColor: "#4ecdc4",
      isOnline: true,
      programId: 3,
    },
    {
      lessonId: 4,
      isOwing: false,
      isOwingRentalAgreement: true,
      resourceId: 3, // Wednesday
      title: "Bob Johnson ( Violin )",
      start: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 2, 11, 0).toISOString(),
      end: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 2, 11, 45).toISOString(),
      url: `/admin/training-location/lesson/view?id=4`,
      className: "lesson-event-rental",
      backgroundColor: "#ffa500",
      isOnline: false,
      programId: 4,
    },
    {
      lessonId: 5,
      isOwing: false,
      isOwingRentalAgreement: false,
      resourceId: 5, // Friday
      title: "Alice Williams ( Piano )",
      start: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4, 15, 0).toISOString(),
      end: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4, 16, 0).toISOString(),
      url: `/admin/training-location/lesson/view?id=5`,
      className: "lesson-event",
      backgroundColor: "#5b9bd5",
      isOnline: false,
      programId: 1,
    },
  ];

  // Generate availability events (background)
  const availability: ScheduleAvailabilityEvent[] = [
    {
      resourceId: 1, // Monday
      start: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 9, 0).toISOString(),
      end: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 17, 0).toISOString(),
      rendering: "background",
      className: "teacher-available",
      backgroundColor: "#e8f5e9",
    },
    {
      resourceId: 2, // Tuesday
      start: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 1, 9, 0).toISOString(),
      end: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 1, 17, 0).toISOString(),
      rendering: "background",
      className: "teacher-available",
      backgroundColor: "#e8f5e9",
    },
    {
      resourceId: 3, // Wednesday
      start: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 2, 10, 0).toISOString(),
      end: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 2, 16, 0).toISOString(),
      rendering: "background",
      className: "teacher-available",
      backgroundColor: "#e8f5e9",
    },
    {
      resourceId: 5, // Friday
      start: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4, 14, 0).toISOString(),
      end: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4, 18, 0).toISOString(),
      rendering: "background",
      className: "teacher-available",
      backgroundColor: "#e8f5e9",
    },
  ];

  return {
    lessons,
    availability,
    time: {
      from: "08:00:00",
      to: "20:00:00",
    },
    date: {
      from: monday.toISOString().split("T")[0],
      to: sunday.toISOString().split("T")[0],
    },
    totalEvents: lessons.length,
    teacherId,
  };
};

// ---------------------------------------------
// Mock API Functions
// ---------------------------------------------

/**
 * Mock API: Get schedule events for a teacher
 * Simulates: GET /admin/v2/{location}/teachers/{teacherId}/schedule-events?date=YYYY-MM-DD&showAll=false
 */
export const mockGetTeacherSchedule = async (
  teacherId: number,
  date?: string,
  showAll: boolean = false
): Promise<TeacherScheduleData> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Generate or retrieve schedule data
  const cacheKey = `${teacherId}-${date || "default"}`;
  if (!scheduleStore[teacherId]) {
    scheduleStore[teacherId] = generateSampleSchedule(teacherId, date);
  } else if (date) {
    // If date changed, regenerate for that week
    const existing = scheduleStore[teacherId];
    const existingDate = existing.date.from;
    const requestedDate = date.split("T")[0];
    
    // Check if the requested date is in the same week
    const existingMonday = getMonday(new Date(existingDate));
    const requestedMonday = getMonday(new Date(requestedDate));
    
    if (existingMonday.getTime() !== requestedMonday.getTime()) {
      // Different week, regenerate
      scheduleStore[teacherId] = generateSampleSchedule(teacherId, date);
    }
  }

  return { ...scheduleStore[teacherId] };
};

/**
 * Helper: Clear mock data for a teacher (useful for testing)
 */
export const clearMockSchedule = (teacherId: number): void => {
  delete scheduleStore[teacherId];
};

/**
 * Helper: Reset all mock data (useful for testing)
 */
export const resetAllMockSchedule = (): void => {
  Object.keys(scheduleStore).forEach((key) => {
    delete scheduleStore[Number(key)];
  });
};

