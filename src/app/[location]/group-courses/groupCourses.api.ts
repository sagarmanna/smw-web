// Mock data for group courses - replace with actual API calls later
import { GroupCourseRow } from "./types";

// Re-export for convenience
export type { GroupCourseRow } from "./types";

export interface GroupCoursesListResponse {
  success: boolean;
  message: string;
  data: {
    body: GroupCourseRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface GroupCoursesQuery {
  page?: number;
  limit?: number;
  course?: string;
  teacher?: string;
  program?: string;
  showActive?: boolean;
  showInActive?: boolean;
  sort?: "course" | "teacher" | "startDate" | "endDate";
  order?: "asc" | "desc";
}

// Mock data generator - 20 entries to test all functionality
const generateMockGroupCourses = (): GroupCourseRow[] => {
  return [
    {
      id: 1,
      course: "Band",
      teacher: "Daniel Clain",
      teacherId: 1,
      rate: 450.00,
      fromTime: "07:30 PM",
      duration: "01:30",
      startDate: "2025-10-18",
      endDate: "2026-01-03",
      program: "Band",
      programId: 1,
      status: "Active",
      isOnline: false,
    },
    {
      id: 2,
      course: "Guitar Basics",
      teacher: "Sarah Johnson",
      teacherId: 2,
      rate: 350.00,
      fromTime: "06:00 PM",
      duration: "01:00",
      startDate: "2025-11-01",
      endDate: "2026-02-28",
      program: "Guitar",
      programId: 2,
      status: "Active",
      isOnline: false,
    },
    {
      id: 3,
      course: "Piano Fundamentals",
      teacher: "Michael Chen",
      teacherId: 3,
      rate: 400.00,
      fromTime: "05:00 PM",
      duration: "01:30",
      startDate: "2025-10-15",
      endDate: "2026-01-15",
      program: "Piano",
      programId: 3,
      status: "Active",
      isOnline: true,
    },
    {
      id: 4,
      course: "Drum Circle",
      teacher: "David Martinez",
      teacherId: 4,
      rate: 300.00,
      fromTime: "07:00 PM",
      duration: "01:00",
      startDate: "2025-11-10",
      endDate: "2026-03-10",
      program: "Drums",
      programId: 4,
      status: "Active",
      isOnline: false,
    },
    {
      id: 5,
      course: "Vocal Ensemble",
      teacher: "Emily Davis",
      teacherId: 5,
      rate: 380.00,
      fromTime: "06:30 PM",
      duration: "01:30",
      startDate: "2025-10-20",
      endDate: "2026-01-20",
      program: "Voice",
      programId: 5,
      status: "Active",
      isOnline: false,
    },
    {
      id: 6,
      course: "Violin Basics",
      teacher: "Robert Wilson",
      teacherId: 6,
      rate: 420.00,
      fromTime: "04:00 PM",
      duration: "01:00",
      startDate: "2024-09-01",
      endDate: "2024-12-15",
      program: "Violin",
      programId: 6,
      status: "Inactive",
      isOnline: false,
    },
    {
      id: 7,
      course: "Saxophone Workshop",
      teacher: "Lisa Anderson",
      teacherId: 7,
      rate: 360.00,
      fromTime: "06:00 PM",
      duration: "01:30",
      startDate: "2024-08-10",
      endDate: "2024-11-30",
      program: "Saxophone",
      programId: 7,
      status: "Inactive",
      isOnline: true,
    },
    {
      id: 8,
      course: "Advanced Guitar",
      teacher: "Sarah Johnson",
      teacherId: 2,
      rate: 480.00,
      fromTime: "08:00 PM",
      duration: "02:00",
      startDate: "2025-12-01",
      endDate: "2026-03-31",
      program: "Guitar",
      programId: 2,
      status: "Active",
      isOnline: false,
    },
    {
      id: 9,
      course: "Jazz Piano",
      teacher: "Michael Chen",
      teacherId: 3,
      rate: 450.00,
      fromTime: "05:30 PM",
      duration: "01:30",
      startDate: "2025-11-15",
      endDate: "2026-02-15",
      program: "Piano",
      programId: 3,
      status: "Active",
      isOnline: true,
    },
    {
      id: 10,
      course: "Rock Band",
      teacher: "Daniel Clain",
      teacherId: 1,
      rate: 500.00,
      fromTime: "07:00 PM",
      duration: "02:00",
      startDate: "2025-10-25",
      endDate: "2026-01-25",
      program: "Band",
      programId: 1,
      status: "Active",
      isOnline: false,
    },
    {
      id: 11,
      course: "Classical Voice",
      teacher: "Emily Davis",
      teacherId: 5,
      rate: 400.00,
      fromTime: "04:30 PM",
      duration: "01:00",
      startDate: "2024-06-01",
      endDate: "2024-09-30",
      program: "Voice",
      programId: 5,
      status: "Inactive",
      isOnline: false,
    },
    {
      id: 12,
      course: "Percussion Masterclass",
      teacher: "David Martinez",
      teacherId: 4,
      rate: 550.00,
      fromTime: "06:00 PM",
      duration: "02:30",
      startDate: "2025-12-10",
      endDate: "2026-04-10",
      program: "Drums",
      programId: 4,
      status: "Active",
      isOnline: false,
    },
    {
      id: 13,
      course: "Acoustic Guitar",
      teacher: "Sarah Johnson",
      teacherId: 2,
      rate: 320.00,
      fromTime: "05:00 PM",
      duration: "01:00",
      startDate: "2024-05-15",
      endDate: "2024-08-15",
      program: "Guitar",
      programId: 2,
      status: "Inactive",
      isOnline: true,
    },
    {
      id: 14,
      course: "Keyboard Skills",
      teacher: "Michael Chen",
      teacherId: 3,
      rate: 370.00,
      fromTime: "06:00 PM",
      duration: "01:30",
      startDate: "2025-11-20",
      endDate: "2026-02-20",
      program: "Piano",
      programId: 3,
      status: "Active",
      isOnline: false,
    },
    {
      id: 15,
      course: "Choir Group",
      teacher: "Emily Davis",
      teacherId: 5,
      rate: 280.00,
      fromTime: "07:30 PM",
      duration: "01:30",
      startDate: "2025-10-10",
      endDate: "2026-01-10",
      program: "Voice",
      programId: 5,
      status: "Active",
      isOnline: false,
    },
    {
      id: 16,
      course: "Blues Band",
      teacher: "Daniel Clain",
      teacherId: 1,
      rate: 460.00,
      fromTime: "08:30 PM",
      duration: "02:00",
      startDate: "2024-07-01",
      endDate: "2024-10-31",
      program: "Band",
      programId: 1,
      status: "Inactive",
      isOnline: false,
    },
    {
      id: 17,
      course: "Electric Guitar",
      teacher: "Sarah Johnson",
      teacherId: 2,
      rate: 440.00,
      fromTime: "07:00 PM",
      duration: "01:30",
      startDate: "2025-12-05",
      endDate: "2026-03-05",
      program: "Guitar",
      programId: 2,
      status: "Active",
      isOnline: true,
    },
    {
      id: 18,
      course: "String Quartet",
      teacher: "Robert Wilson",
      teacherId: 6,
      rate: 520.00,
      fromTime: "05:30 PM",
      duration: "02:00",
      startDate: "2025-11-05",
      endDate: "2026-02-05",
      program: "Violin",
      programId: 6,
      status: "Active",
      isOnline: false,
    },
    {
      id: 19,
      course: "Jazz Ensemble",
      teacher: "Lisa Anderson",
      teacherId: 7,
      rate: 490.00,
      fromTime: "06:30 PM",
      duration: "02:00",
      startDate: "2024-04-01",
      endDate: "2024-07-31",
      program: "Saxophone",
      programId: 7,
      status: "Inactive",
      isOnline: false,
    },
    {
      id: 20,
      course: "Beginner Piano",
      teacher: "Michael Chen",
      teacherId: 3,
      rate: 290.00,
      fromTime: "04:00 PM",
      duration: "01:00",
      startDate: "2025-10-01",
      endDate: "2026-01-01",
      program: "Piano",
      programId: 3,
      status: "Active",
      isOnline: true,
    },
  ];
};

// Constants for default pagination
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
} as const;

// Mock implementation - replace with actual API call
export async function getGroupCourses(
  location: string,
  query: GroupCoursesQuery
): Promise<GroupCoursesListResponse | null> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockData = generateMockGroupCourses();
    
    // Apply filters (mock implementation)
    let filteredData = [...mockData];
    
    if (query.course) {
      filteredData = filteredData.filter(c => 
        c.course.toLowerCase().includes(query.course!.toLowerCase())
      );
    }
    
    if (query.teacher) {
      filteredData = filteredData.filter(c => 
        c.teacher.toLowerCase().includes(query.teacher!.toLowerCase())
      );
    }

    // Apply status filter (Active/Inactive)
    if (query.showActive !== undefined || query.showInActive !== undefined) {
      filteredData = filteredData.filter(c => {
        const isActive = c.status === "Active";
        if (query.showActive === true && query.showInActive === false) {
          return isActive;
        }
        if (query.showActive === false && query.showInActive === true) {
          return !isActive;
        }
        // If both are true or both are false, show all
        return true;
      });
    }

    // Apply sorting (mock implementation)
    if (query.sort) {
      filteredData.sort((a, b) => {
        let aValue: string | number = "";
        let bValue: string | number = "";
        
        switch (query.sort) {
          case "course":
            aValue = a.course;
            bValue = b.course;
            break;
          case "teacher":
            aValue = a.teacher;
            bValue = b.teacher;
            break;
          case "startDate":
            aValue = a.startDate;
            bValue = b.startDate;
            break;
          case "endDate":
            aValue = a.endDate;
            bValue = b.endDate;
            break;
        }
        
        const comparison = typeof aValue === "string" && typeof bValue === "string"
          ? aValue.localeCompare(bValue)
          : typeof aValue === "number" && typeof bValue === "number"
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue));
        
        return query.order === "desc" ? -comparison : comparison;
      });
    }

    // Apply pagination (mock implementation)
    const page = query.page || 1;
    const limit = query.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Group courses fetched successfully",
      data: {
        body: paginatedData,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching group courses:", error);
    return {
      success: false,
      message: "Failed to fetch group courses",
      data: {
        body: [],
        pagination: { ...DEFAULT_PAGINATION },
      },
    };
  }
}

export async function getGroupCourseById(
  location: string,
  id: number
): Promise<GroupCourseRow | null> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const mockData = generateMockGroupCourses();
    const course = mockData.find(c => c.id === id);
    
    return course || null;
  } catch (error: unknown) {
    console.error("Error fetching group course by id:", error);
    return null;
  }
}

