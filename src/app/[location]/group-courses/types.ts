export interface GroupCourseRow {
  id: number;
  course: string;
  teacher: string;
  teacherId?: number;
  rate: string; // API returns formatted string like "$575.00"
  fromTime: string;
  duration: string;
  startDate: string; // API returns display format like "Dec 18, 2025"
  endDate: string; // API returns display format like "Apr 30, 2026"
  program?: string;
  programId?: number;
  status?: string;
  isOnline?: boolean;
}

