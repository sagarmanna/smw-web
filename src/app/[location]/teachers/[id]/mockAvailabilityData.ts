/**
 * Mock data and types for Teacher Availability Calendar
 * This file provides mock data structures and sample data for development
 */

// ---------------------------------------------
// Availability Data Types
// ---------------------------------------------

export interface AvailabilityEvent {
  id: string;
  day: number; // 1-7 (Monday-Sunday)
  fromTime: string; // Format: "HH:mm:ss" (e.g., "09:00:00")
  toTime: string; // Format: "HH:mm:ss" (e.g., "17:00:00")
  classroomId?: number;
  classroomName?: string;
}

export interface LocationHours {
  minTime: string; // Format: "HH:mm:ss" (e.g., "08:00:00")
  maxTime: string; // Format: "HH:mm:ss" (e.g., "20:00:00")
}

export interface Classroom {
  id: number;
  name: string;
}

export interface AvailabilityFormData {
  day: number;
  fromTime: string; // Format: "HH:mm:ss"
  toTime: string; // Format: "HH:mm:ss"
  classroomId?: number;
}

// ---------------------------------------------
// Mock Data Storage (In-memory)
// ---------------------------------------------

// Store availability data per teacher (simulating database)
const availabilityStore: Record<number, AvailabilityEvent[]> = {};

// Mock classrooms list
const mockClassrooms: Classroom[] = [
  { id: 1, name: "Room A" },
  { id: 2, name: "Room B" },
  { id: 3, name: "Room C" },
  { id: 4, name: "Studio 1" },
  { id: 5, name: "Studio 2" },
];

// Default location hours
const defaultLocationHours: LocationHours = {
  minTime: "08:00:00",
  maxTime: "20:00:00",
};

// ---------------------------------------------
// Sample Data Generator
// ---------------------------------------------

/**
 * Generates sample availability data for a teacher
 */
export const generateSampleAvailability = (teacherId: number): AvailabilityEvent[] => {
  return [
    // {
    //   id: `${teacherId}-1`,
    //   day: 1, // Monday
    //   fromTime: "09:00:00",
    //   toTime: "12:00:00",
    //   classroomId: 1,
    //   classroomName: "Room A",
    // },
    // {
    //   id: `${teacherId}-2`,
    //   day: 1, // Monday
    //   fromTime: "13:00:00",
    //   toTime: "17:00:00",
    //   classroomId: 2,
    //   classroomName: "Room B",
    // },
    // {
    //   id: `${teacherId}-3`,
    //   day: 3, // Wednesday
    //   fromTime: "10:00:00",
    //   toTime: "15:00:00",
    //   classroomId: 3,
    //   classroomName: "Room C",
    // },
    // {
    //   id: `${teacherId}-4`,
    //   day: 5, // Friday
    //   fromTime: "14:00:00",
    //   toTime: "18:00:00",
    //   // No classroom assigned
    // },
  ];
};

// ---------------------------------------------
// Mock API Functions
// ---------------------------------------------

/**
 * Mock API: Get availability for a teacher
 * Simulates: GET /admin/v2/{location}/teachers/{teacherId}/availability
 */
export const mockGetAvailability = async (
  teacherId: number
): Promise<AvailabilityEvent[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Initialize with sample data if not exists
  if (!availabilityStore[teacherId]) {
    availabilityStore[teacherId] = generateSampleAvailability(teacherId);
  }

  return [...availabilityStore[teacherId]];
};

/**
 * Mock API: Create new availability
 * Simulates: POST /admin/v2/{location}/teachers/{teacherId}/availability
 */
export const mockCreateAvailability = async (
  teacherId: number,
  data: AvailabilityFormData
): Promise<AvailabilityEvent> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Initialize store if needed
  if (!availabilityStore[teacherId]) {
    availabilityStore[teacherId] = [];
  }

  // Find classroom name if classroomId provided
  const classroom = data.classroomId
    ? mockClassrooms.find((c) => c.id === data.classroomId)
    : undefined;

  // Create new availability
  const newAvailability: AvailabilityEvent = {
    id: `${teacherId}-${Date.now()}`,
    day: data.day,
    fromTime: data.fromTime,
    toTime: data.toTime,
    classroomId: data.classroomId,
    classroomName: classroom?.name,
  };

  // Add to store
  availabilityStore[teacherId].push(newAvailability);

  return { ...newAvailability };
};

/**
 * Mock API: Update existing availability
 * Simulates: PUT /admin/v2/{location}/teachers/{teacherId}/availability/{availabilityId}
 */
export const mockUpdateAvailability = async (
  teacherId: number,
  availabilityId: string,
  data: AvailabilityFormData
): Promise<AvailabilityEvent> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Initialize store if needed
  if (!availabilityStore[teacherId]) {
    availabilityStore[teacherId] = [];
  }

  // Find existing availability
  const index = availabilityStore[teacherId].findIndex((a) => a.id === availabilityId);
  if (index === -1) {
    throw new Error(`Availability with id ${availabilityId} not found`);
  }

  // Find classroom name if classroomId provided
  const classroom = data.classroomId
    ? mockClassrooms.find((c) => c.id === data.classroomId)
    : undefined;

  // Update availability
  const updatedAvailability: AvailabilityEvent = {
    ...availabilityStore[teacherId][index],
    day: data.day,
    fromTime: data.fromTime,
    toTime: data.toTime,
    classroomId: data.classroomId,
    classroomName: classroom?.name,
  };

  // Update in store
  availabilityStore[teacherId][index] = updatedAvailability;

  return { ...updatedAvailability };
};

/**
 * Mock API: Delete availability
 * Simulates: DELETE /admin/v2/{location}/teachers/{teacherId}/availability/{availabilityId}
 */
export const mockDeleteAvailability = async (
  teacherId: number,
  availabilityId: string
): Promise<boolean> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Initialize store if needed
  if (!availabilityStore[teacherId]) {
    return false;
  }

  // Find and remove availability
  const index = availabilityStore[teacherId].findIndex((a) => a.id === availabilityId);
  if (index === -1) {
    return false;
  }

  availabilityStore[teacherId].splice(index, 1);
  return true;
};

/**
 * Mock API: Get classrooms list
 * Simulates: GET /admin/v2/{location}/classrooms/list
 */
export const mockGetClassrooms = async (location: string): Promise<Classroom[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return [...mockClassrooms];
};

/**
 * Mock API: Get location operating hours
 * Simulates: GET /admin/v2/{location}/schedule/details
 */
export const mockGetLocationHours = async (location: string): Promise<LocationHours> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return { ...defaultLocationHours };
};

/**
 * Helper: Clear mock data for a teacher (useful for testing)
 */
export const clearMockAvailability = (teacherId: number): void => {
  delete availabilityStore[teacherId];
};

/**
 * Helper: Reset all mock data (useful for testing)
 */
export const resetAllMockAvailability = (): void => {
  Object.keys(availabilityStore).forEach((key) => {
    delete availabilityStore[Number(key)];
  });
};

