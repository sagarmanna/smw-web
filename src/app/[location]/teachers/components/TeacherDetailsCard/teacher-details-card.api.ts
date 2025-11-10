import { apiClient } from "@/lib/api/client";

export interface UpdateTeacherDetailsData {
  firstName: string;
  lastName: string;
  role: string;
  birthDate?: string;
}

export interface UpdateTeacherDetailsResponse {
  status: boolean;
  message?: string;
  errors?: string[];
}

export async function updateTeacherDetails(
  location: string,
  teacherId: number,
  data: UpdateTeacherDetailsData
): Promise<UpdateTeacherDetailsResponse> {
  try {
    const response = await apiClient.put<UpdateTeacherDetailsResponse>(
      `/admin/v2/${location}/teachers/${teacherId}/details`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating teacher details:", error);
    return {
      status: false,
      message: "Failed to update teacher details",
    };
  }
}

