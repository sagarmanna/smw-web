import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getClassroomById, type ClassroomRow } from "../classrooms.api";
import {
  getClassroomUnavailabilities,
  type ClassroomUnavailabilityApiItem,
} from "./classroomDetail.api";
import type { ClassroomUnavailabilityRow } from "../components/modals/AddClassroomUnavailabilityModal";

interface ClassroomDetailState {
  classroom: ClassroomRow | null;
  isLoading: boolean;
  error: string | null;
  unavailabilities: ClassroomUnavailabilityRow[];
  isUnavailabilitiesLoading: boolean;
}

const initialState: ClassroomDetailState = {
  classroom: null,
  isLoading: false,
  error: null,
  unavailabilities: [],
  isUnavailabilitiesLoading: false,
};

function mapApiItemToRow(item: ClassroomUnavailabilityApiItem): ClassroomUnavailabilityRow {
  return {
    id: String(item.id),
    fromDate: item.fromDate,
    toDate: item.toDate,
    reason: item.reason ?? "",
  };
}

export const fetchClassroom = createAsyncThunk(
  "classroomDetail/fetchClassroom",
  async (
    { location, classroomId }: { location: string; classroomId: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await getClassroomById(location, classroomId);
      if (res?.success && res.data) {
        return { classroom: res.data };
      }
      return rejectWithValue(res?.message ?? "Failed to load classroom");
    } catch (e) {
      return rejectWithValue(
        e instanceof Error ? e.message : "Failed to load classroom"
      );
    }
  }
);

export const fetchUnavailabilities = createAsyncThunk(
  "classroomDetail/fetchUnavailabilities",
  async (
    { location, classroomId }: { location: string; classroomId: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await getClassroomUnavailabilities(location, classroomId);
      if (res.success && Array.isArray(res.data)) {
        return { rows: res.data.map(mapApiItemToRow) };
      }
      return { rows: [] };
    } catch (e) {
      return rejectWithValue(
        e instanceof Error ? e.message : "Failed to fetch unavailabilities"
      );
    }
  }
);

const classroomDetailSlice = createSlice({
  name: "classroomDetail",
  initialState,
  reducers: {
    clearClassroomDetail: () => initialState,
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Classroom
      .addCase(fetchClassroom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClassroom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.classroom = action.payload.classroom;
        state.error = null;
      })
      .addCase(fetchClassroom.rejected, (state, action) => {
        state.isLoading = false;
        state.classroom = null;
        state.error = (action.payload as string) ?? "Failed to load classroom";
      })
      // Unavailabilities
      .addCase(fetchUnavailabilities.pending, (state) => {
        state.isUnavailabilitiesLoading = true;
      })
      .addCase(fetchUnavailabilities.fulfilled, (state, action) => {
        state.isUnavailabilitiesLoading = false;
        state.unavailabilities = action.payload.rows;
      })
      .addCase(fetchUnavailabilities.rejected, (state) => {
        state.isUnavailabilitiesLoading = false;
        state.unavailabilities = [];
      });
  },
});

export const { clearClassroomDetail, clearError } = classroomDetailSlice.actions;
export default classroomDetailSlice.reducer;
