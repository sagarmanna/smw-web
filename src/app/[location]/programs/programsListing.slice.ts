import { createListingSlice } from "@/utils/redux/createListingSlice";
import { getPrograms, ProgramRow, ProgramsQuery } from "./programs.api";

// Create slice using the factory
const { reducer, actions, fetchThunk } = createListingSlice<ProgramRow, ProgramsQuery>({
  name: "programsListing",
  entityName: "program",
  fetchFn: getPrograms,
});

// Export actions with feature-specific names
export const {
  setPage,
  setPageSize,
  setSorting,
  setColumnFilters,
  setActiveFilter,
  clearError,
  clearData: clearPrograms,
} = actions;

// Export thunk with feature-specific name
export const fetchPrograms = fetchThunk;

// Export reducer
export default reducer;

