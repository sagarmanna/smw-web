import { apiClient } from '@/lib/api/client';

export interface Program {
  id: number;
  name: string;
}

export interface Teacher {
  id: number;
  name: string;
}

export interface ProgramsResponse {
  success: boolean;
  data: Program[];
  message: string;
}

export interface TeachersResponse {
  success: boolean;
  data: Teacher[];
  message: string;
}

export async function getProgramsList(): Promise<ProgramsResponse | null> {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get<ProgramsResponse>(
      `/admin/v2/programs/list`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching programs list:", error);
    return null;
  }
}

export async function getTeachersList(location: string): Promise<TeachersResponse | null> {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get<TeachersResponse>(
      `/admin/v2/${location}/teachers/list`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching teachers list:", error);
    return null;
  }
}
