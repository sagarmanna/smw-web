// Mock API - No real API calls. All functions return mock data.

// ---------------------------------------------
// Shared response types for student details
// ---------------------------------------------

export interface StudentProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  birthday?: string;
  age?: string;
  gender?: string;
  status: string;
  notes?: string;
}

export interface StudentCustomerResponse {
  customer: string;
  phone: string;
}

export interface StudentEnrolmentResponse {
  program: string;
  teacher: string;
  day: string;
  fromTime: string;
  duration: string;
  startDate: string;
  endDate: string;
}

export interface StudentEvaluationResponse {
  examDate: string;
  mark: string;
  level: string;
  program: string;
  type: string;
  teacher: string;
}

export interface StudentDetailsResponseBody {
  profile: StudentProfileResponse;
  customer: StudentCustomerResponse;
  enrolments: StudentEnrolmentResponse[];
  evaluations: StudentEvaluationResponse[];
}

export interface StudentDetailsApiResponse {
  success: boolean;
  data: {
    body: StudentDetailsResponseBody;
  };
  message?: string;
}

// ---------------------------------------------
// Mock Data (for development)
// ---------------------------------------------

interface BasicStudent {
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

const mockBasicStudents: BasicStudent[] = [
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

/**
 * Helper function to generate mock detail data for a student
 */
function generateMockDetails(student: BasicStudent): {
  enrolments: StudentEnrolmentResponse[];
  evaluations: StudentEvaluationResponse[];
} {
  const programs = ["Piano Core", "Guitar Fundamentals", "Violin Basics", "Music Theory", "Drums Essential"];
  const teachers = ["Art Tatum", "Jimi Hendrix", "Itzhak Perlman", "Johann Bach", "Buddy Rich"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Use student ID to get consistent data (not random)
  const studentIndex = parseInt(student.id) || 1;
  const programIndex = (studentIndex - 1) % programs.length;
  const teacherIndex = (studentIndex - 1) % teachers.length;
  
  const program = programs[programIndex];
  const teacher = teachers[teacherIndex];
  const day = days[(studentIndex - 1) % days.length];
  const timeIndex = (studentIndex - 1) % 5;
  const fromTime = ["09:00 AM", "10:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"][timeIndex];

  return {
    enrolments: [
      {
        program: program,
        teacher: teacher,
        day: day,
        fromTime: fromTime,
        duration: "00:30",
        startDate: "Jul 01, 2024",
        endDate: "Jun 30, 2026"
      },
      // Add a second enrolment for some students
      ...(studentIndex % 3 === 0 ? [{
        program: programs[(programIndex + 1) % programs.length],
        teacher: teachers[(teacherIndex + 1) % teachers.length],
        day: days[(studentIndex) % days.length],
        fromTime: ["09:00 AM", "10:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"][(timeIndex + 1) % 5],
        duration: "00:45",
        startDate: "Aug 01, 2024",
        endDate: "Jul 31, 2026"
      }] : [])
    ],
    evaluations: [
      { 
        examDate: "Aug 15, 2025", 
        mark: "85%", 
        level: "Level 2", 
        program: program, 
        type: "Practical", 
        teacher: teacher 
      },
      { 
        examDate: "May 20, 2025", 
        mark: "78%", 
        level: "Level 1", 
        program: program, 
        type: "Theory", 
        teacher: teacher 
      },
      { 
        examDate: "Feb 10, 2025", 
        mark: "92%", 
        level: "Level 1", 
        program: program, 
        type: "Practical", 
        teacher: teacher 
      },
    ],
  };
}

// ---------------------------------------------
// Details fetch
// ---------------------------------------------

/**
 * Fetches detailed student information from the API
 * Endpoint: GET /admin/v2/{location}/students/{studentId}/details
 * 
 * @param location - The location identifier
 * @param studentId - The student ID
 * @returns Promise resolving to the student details response or null on error
 */
export async function getStudentDetails(
  location: string,
  studentId: string
): Promise<StudentDetailsApiResponse | null> {
  try {
    // TODO: Replace with actual API call when endpoint is available
    // const response = await apiClient.get<StudentDetailsApiResponse>(
    //   `/admin/v2/${location}/students/${studentId}/details`
    // );
    // return response.data;

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const basicStudent = mockBasicStudents.find(s => s.id === studentId);
    
    if (!basicStudent) {
      return {
        success: false,
        data: {
          body: {
            profile: {
              id: studentId,
              firstName: "",
              lastName: "",
              status: "Inactive",
            },
            customer: {
              customer: "",
              phone: "",
            },
            enrolments: [],
            evaluations: [],
          },
        },
        message: "Student not found",
      };
    }

    const { enrolments, evaluations } = generateMockDetails(basicStudent);

    return {
      success: true,
      data: {
        body: {
          profile: {
            id: basicStudent.id,
            firstName: basicStudent.firstName,
            lastName: basicStudent.lastName,
            birthday: basicStudent.birthday,
            age: basicStudent.age,
            gender: basicStudent.gender,
            status: basicStudent.status,
            notes: basicStudent.notes,
          },
          customer: {
            customer: basicStudent.customer,
            phone: basicStudent.phone,
          },
          enrolments,
          evaluations,
        },
      },
      message: "Student details fetched successfully",
    };
  } catch (error: unknown) {
    console.error("Error fetching student details:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: {
          profile: {
            id: studentId,
            firstName: "",
            lastName: "",
            status: "Inactive",
          },
          customer: {
            customer: "",
            phone: "",
          },
          enrolments: [],
          evaluations: [],
        },
      },
      message: apiError.response?.data?.message || "Failed to fetch student details",
    };
  }
}

// ---------------------------------------------
// Profile API
// ---------------------------------------------

export interface UpdateStudentProfileRequest {
  firstName: string;
  lastName: string;
  birthday?: string;
  gender?: string;
  notes?: string;
}

export interface UpdateStudentProfileResponse {
  success: boolean;
  message: string;
  data?: StudentProfileResponse;
}

/**
 * Updates student profile information
 * Endpoint: PUT /admin/v2/{location}/students/{studentId}/details
 * 
 * @param location - The location identifier
 * @param studentId - The student ID
 * @param profileData - The profile data to update
 * @returns Promise resolving to the update response or null on error
 */
export async function updateStudentProfile(
  _location: string,
  _studentId: string,
  _profileData: UpdateStudentProfileRequest
): Promise<UpdateStudentProfileResponse | null> {
  try {
    // TODO: Replace with actual API call when endpoint is available
    // const response = await apiClient.put<UpdateStudentProfileResponse>(
    //   `/admin/v2/${location}/students/${studentId}/details`,
    //   profileData
    // );
    // return response.data;

    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return {
      success: true,
      message: "Student profile updated successfully",
    };
  } catch (error: unknown) {
    console.error("Error updating student profile:", error);
    const apiError = error as { response?: { data?: { message?: string } } };
    
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to update student profile",
    };
  }
}
