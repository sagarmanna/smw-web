import { createListingSlice } from "@/utils/redux/createListingSlice";
import { getClassrooms, ClassroomRow, ClassroomsQuery } from "./classrooms.api";

const { reducer, actions, fetchThunk } = createListingSlice<ClassroomRow, ClassroomsQuery>({
  name: "classroomsListing",
  entityName: "classroom",
  fetchFn: getClassrooms,
  initialPageSize: 20,
});

export const {
  setPage,
  setPageSize,
  setSorting,
  setColumnFilters,
  setActiveFilter,
  clearError,
  clearData: clearClassrooms,
} = actions;

export const fetchClassrooms = fetchThunk;

export default reducer;

