import { TeacherRow } from "../teachers.api";

export interface TeacherFilters {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: "active" | "inactive";
}

export function filterTeachers(
  data: TeacherRow[],
  filters: TeacherFilters
): TeacherRow[] {
  let filtered = [...data];

  if (filters.status) {
    filtered = filtered.filter((teacher) => teacher.status === filters.status);
  }

  if (filters.firstName) {
    filtered = filtered.filter((teacher) =>
      teacher.firstName.toLowerCase().includes(filters.firstName!.toLowerCase())
    );
  }

  if (filters.lastName) {
    filtered = filtered.filter((teacher) =>
      teacher.lastName.toLowerCase().includes(filters.lastName!.toLowerCase())
    );
  }

  if (filters.email) {
    filtered = filtered.filter((teacher) =>
      teacher.email.toLowerCase().includes(filters.email!.toLowerCase())
    );
  }

  if (filters.phone) {
    filtered = filtered.filter((teacher) =>
      teacher.phone.toLowerCase().includes(filters.phone!.toLowerCase())
    );
  }

  return filtered;
}

