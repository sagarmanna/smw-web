import { 
  StudentData, 
  EnrolmentData, 
  PrivateLessonData, 
  GroupLessonData, 
  ProformaInvoiceData, 
  CommentData, 
  HistoryData 
} from '../tabConfigs';

// Mock data for customer detail tabs
export const mockCustomerTabData = {
  studentData: [
    { name: "321123 123", birthDate: "Jan 06, 2005", customerName: "123 123" },
  ] as StudentData[],

  enrolmentData: [
    { studentName: "321123 123", programName: "Ukulele", teacherName: "Art Tatum", day: "Monday", fromTime: "08:00 AM", duration: "00:30", startDate: "Jan 31, 2022", renewalDate: "Jan 26, 2026" },
    { studentName: "321123 123", programName: "xPiano Core", teacherName: "Alexander Hamilton", day: "Friday", fromTime: "09:00 AM", duration: "00:30", startDate: "Apr 08, 2022", renewalDate: "Apr 24, 2026" },
    { studentName: "321123 123", programName: "Guitar Core", teacherName: "Daniel Clain", day: "Thursday", fromTime: "10:15 AM", duration: "00:30", startDate: "Jun 03, 2022", renewalDate: "May 22, 2026" },
    { studentName: "321123 123", programName: "Drums Core", teacherName: "Amy Macaluso", day: "Saturday", fromTime: "11:15 AM", duration: "00:30", startDate: "Jul 01, 2022", renewalDate: "Jun 26, 2026" },
    { studentName: "321123 123", programName: "xTrombone", teacherName: "tes123 12345", day: "Saturday", fromTime: "11:30 AM", duration: "00:30", startDate: "Apr 28, 2022", renewalDate: "Sep 24, 2026" },
    { studentName: "321123 123", programName: "xGuitar Contemporary", teacherName: "Art Tatum", day: "Friday", fromTime: "10:45 AM", duration: "00:30", startDate: "May 07, 2022", renewalDate: "Dec 26, 2026" },
    { studentName: "321123 123", programName: "xPiano Hybrid", teacherName: "Alexander Hamilton", day: "Monday", fromTime: "09:30 AM", duration: "00:30", startDate: "Dec 30, 2022", renewalDate: "Mar 26, 2027" },
    { studentName: "321123 123", programName: "Ukulele", teacherName: "Daniel Clain", day: "Saturday", fromTime: "12:00 PM", duration: "00:30", startDate: "Mar 20, 2023", renewalDate: "May 24, 2027" },
  ] as EnrolmentData[],

  privateLessonData: [
    { dueDate: "Jul 15, 2025", studentName: "321123 123", programName: "Ukulele", date: "Oct 13, 2025 @ 08:00 AM", duration: "00:30", status: "Scheduled", price: 31.53, owing: 31.53 },
    { dueDate: "Jul 15, 2025", studentName: "321123 123", programName: "Ukulele", date: "Oct 20, 2025 @ 08:00 AM", duration: "00:30", status: "Scheduled", price: 31.53, owing: 31.53 },
    { dueDate: "Jul 15, 2025", studentName: "321123 123", programName: "Ukulele", date: "Oct 27, 2025 @ 08:00 AM", duration: "00:30", status: "Scheduled", price: 31.53, owing: 31.53 },
    { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "xGuitar Contemporary", date: "Oct 13, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 27.03, owing: 27.03 },
    { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "xPiano Hybrid", date: "Oct 13, 2025 @ 12:00 PM", duration: "00:30", status: "Scheduled", price: 31.53, owing: 31.53 },
    { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "Drums Core", date: "Oct 16, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50 },
    { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "xPiano Core", date: "Oct 17, 2025 @ 09:00 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75 },
    { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "xPiano Core", date: "Oct 17, 2025 @ 09:30 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75 },
    { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "Guitar Core", date: "Oct 17, 2025 @ 10:15 AM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50 },
    { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "Guitar Core", date: "Oct 17, 2025 @ 11:15 AM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50 },
    { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "xTrombone", date: "Oct 18, 2025 @ 10:45 AM", duration: "00:30", status: "Scheduled", price: 28.75, owing: 28.75 },
    { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "xGuitar Contemporary", date: "Oct 20, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 27.03, owing: 27.03 },
    { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "xPiano Hybrid", date: "Oct 20, 2025 @ 12:00 PM", duration: "00:30", status: "Scheduled", price: 31.53, owing: 31.53 },
    { dueDate: "Sep 15, 2025", studentName: "321123 123", programName: "Drums Core", date: "Oct 23, 2025 @ 11:30 AM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50 },
  ] as PrivateLessonData[],

  groupLessonData: [] as GroupLessonData[],

  proformaInvoiceData: [] as ProformaInvoiceData[],

  commentData: [] as CommentData[],

  historyData: [
    { message: "On Sep 9, 2022, at 12:15 AM, seng Added new payment of $60.27 for 123 123" },
    { message: "On Sep 9, 2022, at 12:53 AM, seng Added new payment of $4621.04 for 123 123" },
    { message: "On Oct 15, 2023, at 07:00 PM, Prateek Panwar Added new payment of $13890.21 for 123 123" },
    { message: "On Nov 13, 2023, at 02:51 PM, Giancarlo Macaluso Added new payment of $18.45 for 123 123" },
    { message: "On Mar 8, 2024, at 10:43 AM, Prateek Panwar Added new payment of $3367.96 for 123 123" },
    { message: "On Mar 8, 2024, at 10:45 AM, Prateek Panwar Added new payment of $122.50 for 123 123" },
  ] as HistoryData[],
};
