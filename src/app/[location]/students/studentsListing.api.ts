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

// StudentRow interface for listing table
export interface StudentRow {
  userId: string; // Using string to match id field
  isActive: boolean;
  firstName: string;
  lastName: string;
  customer: string;
  phoneNumber: string;
}

// StudentsQuery interface for API queries
export interface StudentsQuery {
  page?: number;
  limit?: number;
  firstName?: string;
  lastName?: string;
  customer?: string;
  phone?: string;
  showActive?: boolean;
  showInActive?: boolean;
  sort?: "firstName" | "lastName" | "customer";
  order?: "asc" | "desc";
}

// StudentsListResponse interface
export interface StudentsListResponse {
  success: boolean;
  message: string;
  data: {
    body: StudentRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
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

// Legacy function - kept for backward compatibility
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

// New function matching teachers.api.ts pattern
export async function getStudentsList(
  location: string,
  query: StudentsQuery
): Promise<StudentsListResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredStudents = [...mockStudents];

  // Apply active/inactive filter
  if (query.showActive === false && query.showInActive === false) {
    filteredStudents = [];
  } else if (query.showActive === false) {
    filteredStudents = filteredStudents.filter(s => s.status === 'Inactive');
  } else if (query.showInActive === false) {
    filteredStudents = filteredStudents.filter(s => s.status === 'Active');
  }

  // Apply column filters
  if (query.firstName) {
    filteredStudents = filteredStudents.filter(s =>
      s.firstName.toLowerCase().includes(query.firstName!.toLowerCase())
    );
  }
  if (query.lastName) {
    filteredStudents = filteredStudents.filter(s =>
      s.lastName.toLowerCase().includes(query.lastName!.toLowerCase())
    );
  }
  if (query.customer) {
    filteredStudents = filteredStudents.filter(s =>
      s.customer.toLowerCase().includes(query.customer!.toLowerCase())
    );
  }
  if (query.phone) {
    filteredStudents = filteredStudents.filter(s =>
      s.phone.includes(query.phone!)
    );
  }

  // Apply sorting
  if (query.sort) {
    filteredStudents.sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      if (query.sort === 'firstName') {
        aValue = a.firstName || '';
        bValue = b.firstName || '';
      } else if (query.sort === 'lastName') {
        aValue = a.lastName || '';
        bValue = b.lastName || '';
      } else if (query.sort === 'customer') {
        aValue = a.customer || '';
        bValue = b.customer || '';
      } else {
        return 0;
      }
      
      const comparison = aValue.localeCompare(bValue);
      return query.order === 'desc' ? -comparison : comparison;
    });
  }

  // Pagination
  const page = query.page || 1;
  const limit = query.limit || 20;
  const total = filteredStudents.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredStudents.slice(startIndex, endIndex);

  // Convert Student[] to StudentRow[]
  const studentRows: StudentRow[] = paginatedData.map(student => ({
    userId: student.id,
    isActive: student.status === 'Active',
    firstName: student.firstName,
    lastName: student.lastName,
    customer: student.customer,
    phoneNumber: student.phone,
  }));

  return {
    success: true,
    message: 'Students fetched successfully',
    data: {
      body: studentRows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    },
  };
}
