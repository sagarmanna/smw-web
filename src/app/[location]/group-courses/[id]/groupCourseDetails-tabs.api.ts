import {
  LessonData,
  StudentData,
  HistoryData,
} from './groupCourseTabConfigs';

// ---------------------------------------------
// Lessons API Response Types
// ---------------------------------------------

export interface LessonApiResponse {
  success: boolean;
  data: {
    body: LessonData[];
  };
  message?: string;
}

// ---------------------------------------------
// Students API Response Types
// ---------------------------------------------

export interface StudentApiResponse {
  success: boolean;
  data: {
    body: StudentData[];
  };
  message?: string;
}

// ---------------------------------------------
// History API Response Types
// ---------------------------------------------

export interface HistoryApiResponse {
  success: boolean;
  data: {
    body: HistoryData[];
  };
  message?: string;
}

// ---------------------------------------------
// Combined Tabs API Response Types
// ---------------------------------------------

export interface GroupCourseTabsApiResponse {
  success: boolean;
  data: {
    body: {
      lessons: LessonData[];
      students: StudentData[];
      history: HistoryData[];
    };
  };
  message?: string;
}

