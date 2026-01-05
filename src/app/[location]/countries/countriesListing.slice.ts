import { createListingSlice } from "@/utils/redux/createListingSlice";
import { getCountries, CountryRow, CountriesQuery } from "./countries.api";

// Create slice using the factory
const { reducer, actions, fetchThunk } = createListingSlice<CountryRow, CountriesQuery>({
  name: "countriesListing",
  entityName: "country",
  fetchFn: getCountries,
});

// Export actions with feature-specific names
export const {
  setPage,
  setPageSize,
  setSorting,
  setColumnFilters,
  setActiveFilter,
  clearError,
  clearData: clearCountries,
} = actions;

// Export thunk with feature-specific name
export const fetchCountries = fetchThunk;

// Export reducer
export default reducer;


