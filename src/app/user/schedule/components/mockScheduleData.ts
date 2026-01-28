import type { CalendarEvent } from "@/components/Calendar/ReactBigCalendarWrapper";

function atTime(baseDate: Date, hour: number, minute: number) {
  const d = new Date(baseDate);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function getMockScheduleEvents(date: Date): CalendarEvent[] {
  return [
    {
      id: "mock-1",
      title: "Private Lesson - Alex",
      resourceId: 0,
      start: atTime(date, 15, 30),
      end: atTime(date, 16, 15),
      backgroundColor: "#4f46e5",
      borderColor: "#4338ca",
      extendedProps: {
        teacher: "Teacher A",
        classroom: "Room 1",
        tooltip: "Program: Piano\nTeacher: Teacher A\nRoom: Room 1",
      },
    },
    {
      id: "mock-2",
      title: "Group Course - Beginners",
      resourceId: 0,
      start: atTime(date, 17, 0),
      end: atTime(date, 18, 0),
      backgroundColor: "#059669",
      borderColor: "#047857",
      extendedProps: {
        teacher: "Teacher B",
        classroom: "Room 2",
        tooltip: "Program: Guitar\nTeacher: Teacher B\nRoom: Room 2",
      },
    },
    {
      id: "mock-3",
      title: "Online Lesson - Sam",
      resourceId: 0,
      start: atTime(date, 19, 0),
      end: atTime(date, 19, 45),
      backgroundColor: "#d97706",
      borderColor: "#b45309",
      extendedProps: {
        isOnline: true,
        teacher: "Teacher C",
        tooltip: "Program: Voice\nTeacher: Teacher C\nOnline: Yes",
      },
    },
  ];
}

