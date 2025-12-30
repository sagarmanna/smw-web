/**
 * Timeline mock data
 */

import { TimelineRow } from "../timelineListing.api";

/**
 * List of users for timeline events
 */
export const timelineUsers = [
  "Staff testing",
  "Staff2 Profile",
  "Prateek Panwar",
  "owner test",
  "Test staffseng",
  "Test ownerseng",
  "Maurizio Di Rauso",
  "test admin",
  "test owner24",
  "new staff",
  "new owner",
  "staff1 test1",
  "Judith Soo",
  "Prithhivi Raj",
  "seng",
  "ReshmiRevin revina",
  "Ridhan Jamesssss",
  "Smw Bot",
  "Steve Saunders",
  "Giancarlo Macaluso",
  "Andrey Test",
];

/**
 * List of students for timeline events with IDs
 */
export const timelineStudents: Array<{ name: string; id: number }> = [
  { name: "Jessica Smith", id: 1 },
  { name: "123 234", id: 2 },
  { name: "ab hello1", id: 3 },
  { name: "Emily Johnson", id: 4 },
  { name: "Michael Brown", id: 5 },
  { name: "Sarah Williams", id: 6 },
  { name: "David Lee", id: 7 },
  { name: "Lisa Anderson", id: 8 },
];

/**
 * Mock data for timeline events
 * Generates 30 rows with invoice creation events
 */
export function getMockTimelineData(): TimelineRow[] {
  const data: TimelineRow[] = [];
  const baseDate = new Date("2025-12-29T05:09:00");
  
  // Generate 30 rows
  for (let i = 0; i < 30; i++) {
    const invoiceNumber = 97715 - i;
    const user = timelineUsers[i % timelineUsers.length];
    const student = timelineStudents[i % timelineStudents.length];
    
    // Alternate between different message types
    const messageType = i % 3;
    const invoiceLink = `<a href="/invoice/view?id=${invoiceNumber}" class="text-blue-600 hover:text-blue-800 font-medium">#I-${invoiceNumber}</a>`;
    
    let message = "";
    if (messageType === 1) {
      // Message with "this Lesson"
      message = `${user} created an invoice ${invoiceLink} for this Lesson`;
    } else {
      // Message with student name (for messageType 0 and 2)
      message = `${user} created an invoice ${invoiceLink} for ${student.name}`;
    }
    
    // Create date - most events on Dec 28, 2025 11:03 PM, some on Dec 29
    let eventDate: Date;
    if (i < 1) {
      // First event on Dec 29, 2025 5:09 AM
      eventDate = new Date(baseDate);
    } else {
      // Rest on Dec 28, 2025 11:03 PM
      eventDate = new Date("2025-12-28T23:03:00");
      // Add some variation in minutes
      eventDate.setMinutes(eventDate.getMinutes() - (i % 10));
    }
    
    data.push({
      id: i + 1,
      date: eventDate.toISOString(),
      createdUser: user,
      message: message,
      studentId: messageType !== 1 ? student.id : undefined, // Only add studentId if not "this Lesson"
      studentName: messageType !== 1 ? student.name : undefined,
      customerId: messageType !== 1 ? 12546 + (student.id % 8) : undefined, // Mock customer ID for navigation
    });
  }
  
  return data;
}

