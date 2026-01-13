"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchReferralSources,
  setSorting,
  clearError,
} from "../referralSourceListing.slice";
import { ReferralSourceQuery } from "../referralSource.api";

/**
 * Custom hook for managing referral source listing state and operations
 * 
 * Handles:
 * - Initial data fetch on mount
 * - Refetching when location or sorting changes
 * - Sorting state management
 * - Error state management
 * 
 * @param location - Current location context
 * @returns Object containing listing state and handlers
 */
export function useReferralSourceListing(location: string) {
  const dispatch = useAppDispatch();

  const rows = useAppSelector((state) => state.referralSourceListing.rows);
  const isLoading = useAppSelector((state) => state.referralSourceListing.isLoading);
  const error = useAppSelector((state) => state.referralSourceListing.error);
  const sortBy = useAppSelector((state) => state.referralSourceListing.sortBy);
  const sortDir = useAppSelector((state) => state.referralSourceListing.sortDir);

  // Track previous values to detect changes and avoid unnecessary fetches
  const prevParamsRef = useRef<{
    location: string;
    sortBy?: string;
    sortDir: "asc" | "desc";
  } | null>(null);

  /**
   * Builds query parameters for API call
   * Only includes sort/order when sortBy is defined
   */
  const buildQuery = useCallback((): ReferralSourceQuery | undefined => {
    if (!sortBy) return undefined;
    
    return {
      sort: sortBy,
      order: sortDir === "asc" ? "ASC" : "DESC",
    };
  }, [sortBy, sortDir]);

  /**
   * Manually trigger data fetch
   * Useful for retry scenarios
   */
  const fetchData = useCallback(() => {
    const query = buildQuery();
    dispatch(fetchReferralSources({ location, query }));
  }, [dispatch, location, buildQuery]);

  /**
   * Fetch data on initial load and when location/sorting changes
   * Uses refs to track previous values and avoid unnecessary API calls
   */
  useEffect(() => {
    const prevParams = prevParamsRef.current;
    
    // Check if any parameter changed
    const paramsChanged =
      !prevParams ||
      prevParams.location !== location ||
      prevParams.sortBy !== sortBy ||
      prevParams.sortDir !== sortDir;

    if (paramsChanged) {
      // Update tracked params
      prevParamsRef.current = {
        location,
        sortBy,
        sortDir,
      };

      // Fetch data with current query
      const query = buildQuery();
      dispatch(fetchReferralSources({ location, query }));
    }
  }, [location, sortBy, sortDir, dispatch, buildQuery]);

  /**
   * Handler for sorting changes from table
   */
  const handleSortingChange = useCallback(
    (payload: { sortBy?: string; sortDir: "asc" | "desc" }) => {
      dispatch(setSorting(payload));
    },
    [dispatch]
  );

  /**
   * Handler for clearing error state
   */
  const handleErrorClear = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    rows,
    isLoading,
    error,
    sortBy,
    sortDir,
    fetchData,
    handleSortingChange,
    handleErrorClear,
  };
}
