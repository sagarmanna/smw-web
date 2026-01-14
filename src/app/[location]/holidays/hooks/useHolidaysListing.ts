"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchHolidays,
  setPage,
  setPageSize,
  setSorting,
  clearError,
} from "../holidaysListing.slice";
import { HolidayQuery } from "../holidays.api";

/**
 * Custom hook for managing holidays listing state and operations
 * 
 * Features:
 * - Fetches data on initial load and when pagination/sorting changes
 * - Manages pagination state (page, pageSize, total, totalPages)
 * - Manages sorting state (sortBy, sortDir)
 * - Provides handlers for pagination and sorting changes
 * 
 * @param location - Current location context
 * @returns Holidays listing state and handlers
 */
export function useHolidaysListing(location: string) {
  const dispatch = useAppDispatch();

  // Get data from Redux
  const rows = useAppSelector((state) => state.holidaysListing.rows);
  const isLoading = useAppSelector((state) => state.holidaysListing.isLoading);
  const error = useAppSelector((state) => state.holidaysListing.error);
  const page = useAppSelector((state) => state.holidaysListing.page);
  const pageSize = useAppSelector((state) => state.holidaysListing.pageSize);
  const total = useAppSelector((state) => state.holidaysListing.total);
  const totalPages = useAppSelector((state) => state.holidaysListing.totalPages);
  const sortBy = useAppSelector((state) => state.holidaysListing.sortBy);
  const sortDir = useAppSelector((state) => state.holidaysListing.sortDir);

  // Track previous parameters to avoid unnecessary fetches
  const prevParamsRef = useRef<{
    location: string;
    page: number;
    pageSize: number;
    sortBy?: string;
    sortDir: "asc" | "desc";
  } | null>(null);

  /**
   * Builds query parameters for API call
   * Only includes sort parameters if sortBy is defined
   */
  const buildQuery = useCallback((): HolidayQuery => {
    const query: HolidayQuery = {
      page,
      limit: pageSize,
    };
    
    if (sortBy) {
      query.sort = sortBy;
      query.order = sortDir === "asc" ? "ASC" : "DESC";
    }
    
    return query;
  }, [page, pageSize, sortBy, sortDir]);

  /**
   * Fetches holidays data from API
   * Called on initial load and when pagination/sorting changes
   */
  const fetchData = useCallback(async () => {
    const query = buildQuery();
    await dispatch(fetchHolidays({ location, query }));
  }, [dispatch, location, buildQuery]);

  // Fetch data on initial load and when parameters change
  useEffect(() => {
    // Check if any parameter changed (null means initial mount)
    const isInitialMount = prevParamsRef.current === null;
    const paramsChanged =
      isInitialMount ||
      (prevParamsRef.current !== null &&
        (prevParamsRef.current.location !== location ||
          prevParamsRef.current.page !== page ||
          prevParamsRef.current.pageSize !== pageSize ||
          prevParamsRef.current.sortBy !== sortBy ||
          prevParamsRef.current.sortDir !== sortDir));

    // Fetch if parameters changed (including initial mount)
    if (paramsChanged) {
      prevParamsRef.current = {
        location,
        page,
        pageSize,
        sortBy,
        sortDir,
      };
      fetchData();
    }
  }, [location, page, pageSize, sortBy, sortDir, fetchData]);

  /**
   * Handler for sorting changes
   */
  const handleSortingChange = useCallback(
    (sorting: { sortBy?: string; sortDir: "asc" | "desc" }) => {
      dispatch(setSorting(sorting));
    },
    [dispatch]
  );

  /**
   * Handler for page changes
   */
  const handlePageChange = useCallback(
    (newPage: number) => {
      dispatch(setPage(newPage));
    },
    [dispatch]
  );

  /**
   * Handler for page size changes
   */
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      dispatch(setPageSize(newPageSize));
    },
    [dispatch]
  );

  /**
   * Handler for clearing errors
   */
  const handleErrorClear = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    rows,
    isLoading,
    error,
    page,
    pageSize,
    total,
    totalPages,
    sortBy,
    sortDir,
    fetchData,
    handleSortingChange,
    handlePageChange,
    handlePageSizeChange,
    handleErrorClear,
  };
}
