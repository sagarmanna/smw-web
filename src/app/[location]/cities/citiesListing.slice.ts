import { createListingSlice } from "@/utils/redux/createListingSlice";
import { getCities, CityRow, CitiesQuery } from "./cities.api";

// Create slice using the factory
const { reducer, actions, fetchThunk } = createListingSlice<CityRow, CitiesQuery>({
  name: "citiesListing",
  entityName: "city",
  fetchFn: getCities,
});

// Export actions with feature-specific names
export const {
  setPage,
  setPageSize,
  setSorting,
  setColumnFilters,
  setActiveFilter,
  clearError,
  clearData: clearCities,
} = actions;

// Export thunk with feature-specific name
export const fetchCities = fetchThunk;

// Export reducer
export default reducer;

