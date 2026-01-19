"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  setPage, 
  setPageSize,
  fetchEmailTemplates,
} from "../emailTemplateListing.slice";

export function useEmailTemplateListing(location: string) {
  const dispatch = useAppDispatch();

  // Get data from Redux
  const rows = useAppSelector((state) => state.emailTemplateListing.rows);
  const isLoading = useAppSelector((state) => state.emailTemplateListing.isLoading);
  const error = useAppSelector((state) => state.emailTemplateListing.error);
  const page = useAppSelector((state) => state.emailTemplateListing.page);
  const pageSize = useAppSelector((state) => state.emailTemplateListing.pageSize);
  const total = useAppSelector((state) => state.emailTemplateListing.total);
  const totalPages = useAppSelector((state) => state.emailTemplateListing.totalPages);

  // NOTE: No useEffect here because:
  // - Initial fetch is handled in page.tsx (only once on load)
  // - Pagination is disabled in UI (enableRowsPerPage={false})
  // - No sorting or filtering that requires API calls
  // - Updates modify Redux state directly after API calls
  // This ensures GET API is only called ONCE on initial load

  const handleSetPage = React.useCallback(
    (newPage: number) => {
      dispatch(setPage(newPage));
    },
    [dispatch]
  );

  const handleSetPageSize = React.useCallback(
    (newSize: number) => {
      dispatch(setPageSize(newSize));
    },
    [dispatch]
  );

  /**
   * Fetch data function - for error recovery and manual refresh
   * 
   * Use cases:
   * - Error retry: When fetch fails, user can retry
   * - Manual refresh: Force refresh data from server
   */
  const fetchData = React.useCallback(async () => {
    await dispatch(fetchEmailTemplates({ 
      location,
      page,
      limit: pageSize
    }));
  }, [dispatch, location, page, pageSize]);

  return {
    rows,
    total,
    totalPages,
    isLoading,
    error,
    page,
    setPage: handleSetPage,
    pageSize,
    setPageSize: handleSetPageSize,
    fetchData,
  };
}
