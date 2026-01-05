import { createListingSlice } from "@/utils/redux/createListingSlice";
import { getProvinces, ProvinceRow, ProvincesQuery } from "./provinces.api";

const { reducer, actions, fetchThunk } = createListingSlice<ProvinceRow, ProvincesQuery>({
  name: "provincesListing",
  entityName: "province",
  fetchFn: getProvinces,
});

export const {
  setPage,
  setPageSize,
  setSorting,
  setColumnFilters,
  setActiveFilter,
  clearError,
  clearData: clearProvinces,
} = actions;

export const fetchProvinces = fetchThunk;

export default reducer;


