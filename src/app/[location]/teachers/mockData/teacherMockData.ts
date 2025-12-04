import {
  TeacherStudentData,
  UnscheduledLessonData,
  TimeVoucherData,
  CommentData,
  HistoryData,
} from "../teacherTabConfigs";

export const mockTeacherTabData = {

  studentData: [
    {
      id: "1",
      studentName: "TJ Lab",
    },
    {
      id: "2",
      studentName: "Tika Lab",
    },
    {
      id: "3",
      studentName: "hhhh hhh",
    },
    {
      id: "4",
      studentName: "Sarika test",
    },
  ] as TeacherStudentData[],

  unscheduledLessonData: [
    {
      id: "1",
      student: "TJ Lab",
      phone: "(111) 111-1111",
      program: "xPiano Contemporary",
      duration: "30 min",
      originalDate: "Dec 01, 2025",
      expiryDate: "Dec 31, 2025",
    },
    {
      id: "2",
      student: "Tika Lab",
      phone: "(222) 222-2222",
      program: "xGuitar Basics",
      duration: "45 min",
      originalDate: "Dec 05, 2025",
      expiryDate: "Jan 05, 2026",
    },
  ] as UnscheduledLessonData[],

  timeVoucherData: [
    {
      id: "1",
      time: "Monday, December 1st, 2025 09:00 AM",
      program: "xUkulele",
      student: "Sarika test",
      duration: "0.5",
    },
    {
      id: "2",
      time: "Wednesday, December 3rd, 2025 02:00 PM",
      program: "xLevel 9 Harmony",
      student: "hhhh hhh",
      duration: "1.0",
    },
  ] as TimeVoucherData[],

  commentData: [] as CommentData[],

  historyData: [
    {
      id: "1",
      message: "On Apr 05, 2023 at 04:45 PM, Julia Zoccoli Added new payment of $195.00 for <a href='#'>Levi Ackerman</a>",
      createdOn: "Apr 05, 2023 at 04:45 PM",
    },
    {
      id: "2",
      message: "On May 31, 2023 at 11:46 PM, Giancarlo Macaluso printed customer statement for <a href='#'>Levi Ackerman</a>",
      createdOn: "May 31, 2023 at 11:46 PM",
    },
    {
      id: "3",
      message: "On May 31, 2023 at 11:53 PM, Giancarlo Macaluso mailed customer statement for <a href='#'>Levi Ackerman</a>",
      createdOn: "May 31, 2023 at 11:53 PM",
    },
    {
      id: "4",
      message: "On Jun 01, 2023 at 12:00 AM, Giancarlo Macaluso Added new payment of $130.00 for <a href='#'>Levi Ackerman</a>",
      createdOn: "Jun 01, 2023 at 12:00 AM",
    },
    {
      id: "5",
      message: "On Jun 01, 2023 at 12:03 AM, Giancarlo Macaluso mailed the details of payment (P-1023932) to <a href='#'>Levi Ackerman</a>",
      createdOn: "Jun 01, 2023 at 12:03 AM",
    },
    {
      id: "6",
      message: "On Jun 02, 2023 at 11:31 AM, seng printed customer statement for <a href='#'>Levi Ackerman</a>",
      createdOn: "Jun 02, 2023 at 11:31 AM",
    },
    {
      id: "7",
      message: "On Nov 11, 2025 at 10:59 PM, seng Added new payment of $7168.15 for <a href='#'>Levi Ackerman</a>",
      createdOn: "Nov 11, 2025 at 10:59 PM",
    },
    {
      id: "8",
      message: "On Nov 20, 2025 at 01:23 AM, seng Added new payment of $32.50 for <a href='#'>Levi Ackerman</a>",
      createdOn: "Nov 20, 2025 at 01:23 AM",
    },
    {
      id: "9",
      message: "On Nov 20, 2025 at 01:24 AM, seng Added new payment of $32.50 for <a href='#'>Levi Ackerman</a>",
      createdOn: "Nov 20, 2025 at 01:24 AM",
    },
    {
      id: "10",
      message: "On Nov 20, 2025 at 02:04 AM, seng Added new payment of $32.50 for <a href='#'>Levi Ackerman</a>",
      createdOn: "Nov 20, 2025 at 02:04 AM",
    },
  ] as HistoryData[],
};

