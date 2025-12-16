export interface GroupCourseRow {
  id: number;
  course: string;
  teacher: string;
  teacherId?: number;
  rate: number;
  fromTime: string;
  duration: string;
  startDate: string;
  endDate: string;
  program?: string;
  programId?: number;
  status?: string;
  isOnline?: boolean;
}

