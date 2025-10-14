// students.api.ts - Updated Mock Data API
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  customer: string;
  phone: string;
  birthday?: string;
  age?: string;
  gender?: string;
  status: string;
  notes?: string;
}

export interface StudentDetail extends Student {
  enrolments: Enrolment[];
  evaluations: Evaluation[];
  privateLessons: PrivateLesson[];
  groupLessons: GroupLesson[];
  absentLessons: AbsentLesson[];
  unscheduledLessons: UnscheduledLesson[];
  comments: Comment[];
  history: History[];
}

export interface Enrolment {
  program: string;
  teacher: string;
  day: string;
  fromTime: string;
  duration: string;
  startDate: string;
  endDate: string;
}

export interface Evaluation {
  examDate: string;
  mark: string;
  level: string;
  program: string;
  type: string;
  teacher: string;
}

export interface PrivateLesson {
  dueDate: string;
  programName: string;
  date: string;
  duration: string;
  status: string;
  price: number;
  owing: number;
  online: string;
}

export interface GroupLesson {
  program: string;
  date: string;
  duration: string;
  status: string;
  attendance: string;
}

export interface AbsentLesson {
  program: string;
  date: string;
  reason: string;
  notifiedDate: string;
}

export interface UnscheduledLesson {
  program: string;
  lessonsRemaining: number;
  expiryDate: string;
}

export interface Comment {
  date: string;
  author: string;
  comment: string;
}

export interface History {
  date: string;
  action: string;
  details: string;
  performedBy: string;
}

// Mock student list data
const mockStudents: Student[] = [
  { id: "1", firstName: "Anna", lastName: "Winston", customer: "Anna Winston", phone: "(647) 889-9081", status: "Active" },
  { id: "2", firstName: "Anna", lastName: "Winston", customer: "Anna Winston", phone: "(647) 889-9082", status: "Active" },
  { id: "3", firstName: "Anwar", lastName: "Raja", customer: "Razim Raja", phone: "(209) 182-9302", status: "Active" },
  { id: "4", firstName: "Angelina", lastName: "Anthony", customer: "Michael Anthony", phone: "(555) 555-5555", status: "Active" },
  { id: "5", firstName: "Amy", lastName: "Holly", customer: "Amy Holly", phone: "(467) 458-9906", status: "Active" },
  { id: "6", firstName: "Amit", lastName: "Bailey", customer: "Amit Bailey", phone: "(905) 840-7707", status: "Active" },
  { id: "7", firstName: "Alison", lastName: "James", customer: "Alison James", phone: "(905) 676-7817", status: "Active" },
  { id: "8", firstName: "Alicia", lastName: "Jones", customer: "Alicia Jones", phone: "(456) 965-2587", status: "Active" },
  { id: "9", firstName: "Alicia", lastName: "James", customer: "Alicia James", phone: "(416) 844-1234", status: "Active" },
  { id: "10", firstName: "Alice", lastName: "Sam", customer: "Alice Sam", phone: "(905) 123-4567", status: "Active" },
  { id: "11", firstName: "Alex", lastName: "Smith", customer: "Jessica Smith", phone: "(416) 123-4567", status: "Inactive" },
  { id: "12", firstName: "Alessia", lastName: "Lee", customer: "Jackson Lee", phone: "(647) 098-3456", status: "Active" },
  { id: "13", firstName: "Alessia", lastName: "Samson", customer: "Juliet Samson", phone: "(555) 666-8888", status: "Active" },
  { id: "14", firstName: "ajay", lastName: "jones", customer: "ajay jones", phone: "", status: "Active" },
  { id: "15", firstName: "abbanda", lastName: "banda", customer: "abbanda banda", phone: "(905) 555-5555", status: "Inactive" },
];

// Mock student detail data
const mockStudentDetail: StudentDetail = {
  id: "2",
  firstName: "Anna",
  lastName: "Winston",
  customer: "Anna Winston",
  phone: "(647) 889-9082",
  birthday: "Nov 09, 2017",
  age: "7yrs old",
  gender: "Female",
  status: "Active",
  notes: "",
  enrolments: [
    {
      program: "Piano Core",
      teacher: "Art Tatum",
      day: "Saturday",
      fromTime: "02:30 PM",
      duration: "00:30",
      startDate: "Jul 06, 2024",
      endDate: "Jun 27, 2026"
    }
  ],
  evaluations: [
    { examDate: "Aug 15, 2025", mark: "85%", level: "Level 2", program: "Piano Core", type: "Practical", teacher: "Art Tatum" },
    { examDate: "May 20, 2025", mark: "78%", level: "Level 1", program: "Piano Core", type: "Theory", teacher: "Art Tatum" },
    { examDate: "Feb 10, 2025", mark: "92%", level: "Level 1", program: "Piano Core", type: "Practical", teacher: "Art Tatum" },
  ],
  privateLessons: [
    { dueDate: "Sep 15, 2025", programName: "Piano Core", date: "Oct 11, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Sep 15, 2025", programName: "Piano Core", date: "Oct 18, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Sep 15, 2025", programName: "Piano Core", date: "Oct 25, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Oct 15, 2025", programName: "Piano Core", date: "Nov 01, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Oct 15, 2025", programName: "Piano Core", date: "Nov 08, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Oct 15, 2025", programName: "Piano Core", date: "Nov 15, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Oct 15, 2025", programName: "Piano Core", date: "Nov 22, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Nov 15, 2025", programName: "Piano Core", date: "Dec 06, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Nov 15, 2025", programName: "Piano Core", date: "Dec 13, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Nov 15, 2025", programName: "Piano Core", date: "Dec 20, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Nov 15, 2025", programName: "Piano Core", date: "Dec 27, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    { dueDate: "Dec 15, 2025", programName: "Piano Core", date: "Jan 03, 2026 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
  ],
  groupLessons: [
    { program: "Piano Group A", date: "Oct 12, 2025 @ 10:00 AM", duration: "01:00", status: "Completed", attendance: "Present" },
    { program: "Piano Group A", date: "Oct 19, 2025 @ 10:00 AM", duration: "01:00", status: "Completed", attendance: "Present" },
    { program: "Piano Group A", date: "Oct 26, 2025 @ 10:00 AM", duration: "01:00", status: "Scheduled", attendance: "-" },
    { program: "Piano Group A", date: "Nov 02, 2025 @ 10:00 AM", duration: "01:00", status: "Scheduled", attendance: "-" },
  ],
  absentLessons: [
    { program: "Piano Core", date: "Sep 28, 2025 @ 02:30 PM", reason: "Illness", notifiedDate: "Sep 27, 2025" },
    { program: "Piano Core", date: "Oct 05, 2025 @ 02:30 PM", reason: "Family Emergency", notifiedDate: "Oct 04, 2025" },
  ],
  unscheduledLessons: [
    { program: "Piano Core", lessonsRemaining: 4, expiryDate: "Dec 31, 2025" },
    { program: "Music Theory", lessonsRemaining: 2, expiryDate: "Nov 30, 2025" },
  ],
  comments: [
    { date: "Oct 08, 2025", author: "Art Tatum", comment: "Anna is making excellent progress with scales. She needs to work on her rhythm." },
    { date: "Sep 15, 2025", author: "Art Tatum", comment: "Great performance in today's lesson. Very enthusiastic learner." },
    { date: "Aug 22, 2025", author: "Admin", comment: "Parent requested to reschedule lessons for September." },
  ],
  history: [
    { date: "Oct 10, 2025", action: "Lesson Scheduled", details: "Private lesson scheduled for Nov 01, 2025", performedBy: "System" },
    { date: "Oct 08, 2025", action: "Comment Added", details: "Teacher added progress comment", performedBy: "Art Tatum" },
    { date: "Oct 05, 2025", action: "Absence Recorded", details: "Student absent from lesson", performedBy: "Admin" },
    { date: "Sep 27, 2025", action: "Profile Updated", details: "Phone number updated", performedBy: "Admin" },
    { date: "Sep 15, 2025", action: "Payment Received", details: "Payment of $130.00 received", performedBy: "System" },
  ]
};

export async function getStudents(
  location: string,
  page: number = 1,
  limit: number = 20,
  filter?: string
): Promise<{ success: boolean; data: Student[]; pagination: { page: number; limit: number; total: number; totalPages: number }; message?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredStudents = [...mockStudents];

  // Apply filter
  if (filter === 'active') {
    filteredStudents = filteredStudents.filter(s => s.status === 'Active');
  } else if (filter === 'inactive') {
    filteredStudents = filteredStudents.filter(s => s.status === 'Inactive');
  }

  const total = filteredStudents.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredStudents.slice(startIndex, endIndex);

  return {
    success: true,
    data: paginatedData,
    pagination: { page, limit, total, totalPages }
  };
}

export async function getStudentById(
  location: string,
  studentId: string
): Promise<{ success: boolean; data: StudentDetail | null; message?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Find the basic student data first
  const basicStudent = mockStudents.find(s => s.id === studentId);

  if (!basicStudent) {
    return {
      success: false,
      data: null,
      message: "Student not found"
    };
  }

  // If it's the special mock student, return full details
  if (studentId === mockStudentDetail.id) {
    return {
      success: true,
      data: mockStudentDetail
    };
  }

  // For other students, create a basic detail view with empty arrays
  const studentDetail: StudentDetail = {
    ...basicStudent,
    enrolments: [],
    evaluations: [],
    privateLessons: [],
    groupLessons: [],
    absentLessons: [],
    unscheduledLessons: [],
    comments: [],
    history: []
  };

  return {
    success: true,
    data: studentDetail
  };
}