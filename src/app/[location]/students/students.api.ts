// students.api.ts - Updated Mock Data API with Full Details for Each Student
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
  { id: "1", firstName: "Anna", lastName: "Winston", customer: "Anna Winston", phone: "(647) 889-9081", birthday: "Mar 15, 2018", age: "6yrs old", gender: "Female", status: "Active", notes: "Loves classical music" },
  { id: "2", firstName: "Anna", lastName: "Winston", customer: "Anna Winston", phone: "(647) 889-9082", birthday: "Nov 09, 2017", age: "7yrs old", gender: "Female", status: "Active", notes: "" },
  { id: "3", firstName: "Anwar", lastName: "Raja", customer: "Razim Raja", phone: "(209) 182-9302", birthday: "Jun 22, 2016", age: "8yrs old", gender: "Male", status: "Active", notes: "Intermediate level" },
  { id: "4", firstName: "Angelina", lastName: "Anthony", customer: "Michael Anthony", phone: "(555) 555-5555", birthday: "Dec 05, 2019", age: "5yrs old", gender: "Female", status: "Active", notes: "Beginner" },
  { id: "5", firstName: "Amy", lastName: "Holly", customer: "Amy Holly", phone: "(467) 458-9906", birthday: "Apr 18, 2015", age: "9yrs old", gender: "Female", status: "Active", notes: "Advanced student" },
  { id: "6", firstName: "Amit", lastName: "Bailey", customer: "Amit Bailey", phone: "(905) 840-7707", birthday: "Aug 30, 2017", age: "7yrs old", gender: "Male", status: "Active", notes: "Great progress this term" },
  { id: "7", firstName: "Alison", lastName: "James", customer: "Alison James", phone: "(905) 676-7817", birthday: "Jan 12, 2018", age: "6yrs old", gender: "Female", status: "Active", notes: "Very enthusiastic" },
  { id: "8", firstName: "Alicia", lastName: "Jones", customer: "Alicia Jones", phone: "(456) 965-2587", birthday: "Sep 25, 2016", age: "8yrs old", gender: "Female", status: "Active", notes: "" },
  { id: "9", firstName: "Alicia", lastName: "James", customer: "Alicia James", phone: "(416) 844-1234", birthday: "May 07, 2019", age: "5yrs old", gender: "Female", status: "Active", notes: "Prefers morning classes" },
  { id: "10", firstName: "Alice", lastName: "Sam", customer: "Alice Sam", phone: "(905) 123-4567", birthday: "Feb 14, 2017", age: "7yrs old", gender: "Female", status: "Active", notes: "" },
  { id: "11", firstName: "Alex", lastName: "Smith", customer: "Jessica Smith", phone: "(416) 123-4567", birthday: "Oct 03, 2016", age: "8yrs old", gender: "Male", status: "Inactive", notes: "On break" },
  { id: "12", firstName: "Alessia", lastName: "Lee", customer: "Jackson Lee", phone: "(647) 098-3456", birthday: "Jul 19, 2018", age: "6yrs old", gender: "Female", status: "Active", notes: "Preparing for recital" },
  { id: "13", firstName: "Alessia", lastName: "Samson", customer: "Juliet Samson", phone: "(555) 666-8888", birthday: "Nov 28, 2015", age: "9yrs old", gender: "Female", status: "Active", notes: "Preparing for exam" },
  { id: "14", firstName: "ajay", lastName: "jones", customer: "ajay jones", phone: "", birthday: "Mar 10, 2017", age: "7yrs old", gender: "Male", status: "Active", notes: "" },
  { id: "15", firstName: "abbanda", lastName: "banda", customer: "abbanda banda", phone: "(905) 555-5555", birthday: "Dec 01, 2016", age: "8yrs old", gender: "", status: "Inactive", notes: "Moved to different location" },
];

// Helper function to generate mock detail data
const generateMockDetails = (student: Student): StudentDetail => {
  const programs = ["Piano Core", "Guitar Fundamentals", "Violin Basics", "Music Theory", "Drums Essential"];
  const teachers = ["Art Tatum", "Jimi Hendrix", "Itzhak Perlman", "Johann Bach", "Buddy Rich"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const randomProgram = programs[Math.floor(Math.random() * programs.length)];
  const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
  
  return {
    ...student,
    enrolments: [
      {
        program: randomProgram,
        teacher: randomTeacher,
        day: days[Math.floor(Math.random() * days.length)],
        fromTime: ["09:00 AM", "10:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"][Math.floor(Math.random() * 5)],
        duration: "00:30",
        startDate: "Jul 01, 2024",
        endDate: "Jun 30, 2026"
      }
    ],
    evaluations: [
      { examDate: "Aug 15, 2025", mark: "85%", level: "Level 2", program: randomProgram, type: "Practical", teacher: randomTeacher },
      { examDate: "May 20, 2025", mark: "78%", level: "Level 1", program: randomProgram, type: "Theory", teacher: randomTeacher },
      { examDate: "Feb 10, 2025", mark: "92%", level: "Level 1", program: randomProgram, type: "Practical", teacher: randomTeacher },
    ],
    privateLessons: [
      { dueDate: "Sep 15, 2025", programName: randomProgram, date: "Oct 11, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
      { dueDate: "Sep 15, 2025", programName: randomProgram, date: "Oct 18, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
      { dueDate: "Sep 15, 2025", programName: randomProgram, date: "Oct 25, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
      { dueDate: "Oct 15, 2025", programName: randomProgram, date: "Nov 01, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
      { dueDate: "Oct 15, 2025", programName: randomProgram, date: "Nov 08, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
      { dueDate: "Oct 15, 2025", programName: randomProgram, date: "Nov 15, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
      { dueDate: "Oct 15, 2025", programName: randomProgram, date: "Nov 22, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
      { dueDate: "Nov 15, 2025", programName: randomProgram, date: "Dec 06, 2025 @ 02:30 PM", duration: "00:30", status: "Scheduled", price: 32.50, owing: 32.50, online: "No" },
    ],
    groupLessons: [
      { program: `${randomProgram} Group A`, date: "Oct 12, 2025 @ 10:00 AM", duration: "01:00", status: "Completed", attendance: "Present" },
      { program: `${randomProgram} Group A`, date: "Oct 19, 2025 @ 10:00 AM", duration: "01:00", status: "Completed", attendance: "Present" },
      { program: `${randomProgram} Group A`, date: "Oct 26, 2025 @ 10:00 AM", duration: "01:00", status: "Scheduled", attendance: "-" },
      { program: `${randomProgram} Group A`, date: "Nov 02, 2025 @ 10:00 AM", duration: "01:00", status: "Scheduled", attendance: "-" },
    ],
    absentLessons: [
      { program: randomProgram, date: "Sep 28, 2025 @ 02:30 PM", reason: "Illness", notifiedDate: "Sep 27, 2025" },
      { program: randomProgram, date: "Oct 05, 2025 @ 02:30 PM", reason: "Family Emergency", notifiedDate: "Oct 04, 2025" },
    ],
    unscheduledLessons: [
      { program: randomProgram, lessonsRemaining: 4, expiryDate: "Dec 31, 2025" },
      { program: "Music Theory", lessonsRemaining: 2, expiryDate: "Nov 30, 2025" },
    ],
    comments: [
      { date: "Oct 08, 2025", author: randomTeacher, comment: `${student.firstName} is making excellent progress. Keep up the great work!` },
      { date: "Sep 15, 2025", author: randomTeacher, comment: "Great performance in today's lesson. Very enthusiastic learner." },
      { date: "Aug 22, 2025", author: "Admin", comment: "Parent requested to reschedule lessons for September." },
    ],
    history: [
      { date: "Oct 10, 2025", action: "Lesson Scheduled", details: "Private lesson scheduled for Nov 01, 2025", performedBy: "System" },
      { date: "Oct 08, 2025", action: "Comment Added", details: "Teacher added progress comment", performedBy: randomTeacher },
      { date: "Oct 05, 2025", action: "Absence Recorded", details: "Student absent from lesson", performedBy: "Admin" },
      { date: "Sep 27, 2025", action: "Profile Updated", details: "Phone number updated", performedBy: "Admin" },
      { date: "Sep 15, 2025", action: "Payment Received", details: "Payment of $130.00 received", performedBy: "System" },
    ]
  };
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

  // Generate full details for all students
  const studentDetail = generateMockDetails(basicStudent);

  return {
    success: true,
    data: studentDetail
  };
}