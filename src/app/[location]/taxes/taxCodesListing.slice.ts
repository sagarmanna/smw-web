import { createListingSlice } from "@/utils/redux/createListingSlice";
import { getTaxCodes, TaxCodeRow, TaxCodesQuery } from "./taxes.api";

const { reducer, actions, fetchThunk } = createListingSlice<TaxCodeRow, TaxCodesQuery>({
  name: "taxCodesListing",
  entityName: "tax code",
  fetchFn: getTaxCodes,
});

export const {
  setPage,
  setPageSize,
  setSorting,
  setColumnFilters,
  setActiveFilter,
  clearError,
  clearData: clearTaxCodes,
} = actions;

export const fetchTaxCodes = fetchThunk;

export default reducer;


