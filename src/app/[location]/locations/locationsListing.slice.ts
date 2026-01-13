import { createListingSlice } from "@/utils/redux/createListingSlice";
import { getLocations, LocationRow, LocationsQuery } from "./locations.api";

// Create slice using the factory
const { reducer, actions, fetchThunk } = createListingSlice<LocationRow, LocationsQuery>({
  name: "locationsListing",
  entityName: "location",
  fetchFn: getLocations,
});

// Export actions with feature-specific names
export const {
  setPage,
  setPageSize,
  setSorting,
  setColumnFilters,
  setActiveFilter,
  clearError,
  clearData: clearLocationsListing,
} = actions;

// Export thunk with feature-specific name
export const fetchLocations = fetchThunk;

// Export reducer
export default reducer;


