// Re-export types from the centralized types file
export type {
  GroupCourseRow,
} from '../types';

// Re-export API response types
export type {
  CourseInfoResponse,
  CourseLesson,
} from './groupCourseDetails.api';

// Group course detail specific interfaces
export interface GroupCourseInfo {
  id: number;
  course: string;
  teacher: string;
  teacherId: number;
  rate: number;
  fromTime: string;
  duration: string;
  startDate: string;
  endDate: string;
  program: string;
  programId: number;
  status: string;
  isOnline: boolean;
}

