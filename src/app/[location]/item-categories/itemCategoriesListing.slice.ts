import { createListingSlice } from "@/utils/redux/createListingSlice";
import { getItemCategories, ItemCategoryRow, ItemCategoriesQuery } from "./itemCategories.api";

const { reducer, actions, fetchThunk } = createListingSlice<ItemCategoryRow, ItemCategoriesQuery>({
  name: "itemCategoriesListing",
  entityName: "item category",
  fetchFn: getItemCategories,
});

export const {
  setPage,
  setPageSize,
  setSorting,
  setColumnFilters,
  setActiveFilter,
  clearError,
  clearData: clearItemCategories,
} = actions;

export const fetchItemCategories = fetchThunk;

export default reducer;


