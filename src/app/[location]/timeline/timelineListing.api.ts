/**
 * Timeline API types
 */

export interface TimelineRow {
  id: number;
  date: string; // ISO date string
  createdUser: string;
  message: string; // HTML string with invoice links
  studentId?: number; // Optional student ID for navigation
  studentName?: string; // Optional student name for display
  customerId?: number; // Optional customer ID for navigation
}

// Re-export mock data function from mockData folder
export { getMockTimelineData } from "./mockData/timelineMockData";

