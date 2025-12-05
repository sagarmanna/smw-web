import * as React from "react";

export interface ServerSidePaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseServerPaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  /**
   * Minimum total records required before pagination controls are shown.
   * Matches existing behaviour in teacher tabs where pagination is only
   * shown when total > 10.
   */
  minTotalForPagination?: number;
  /**
   * Large number to use when "All" option (-1) is selected.
   * Defaults to 999999.
   */
  allOptionLimit?: number;
}

interface PageChangeHandlers {
  handlePageChange: (page: number) => void;
  handleRowsPerPageChange: (rowsPerPage: number) => void;
}

interface ApiPaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Converts UI limit (-1 for "All") to API limit.
 * The UI uses -1 to represent "All" rows, which needs to be converted
 * to a large number for the API call.
 */
export function convertLimitForApi(
  uiLimit: number,
  allOptionLimit: number = 999999
): number {
  return uiLimit === -1 ? allOptionLimit : uiLimit;
}

/**
 * Updates pagination state from API response.
 * Preserves the UI's page/limit (including -1 for "All") while updating
 * total/totalPages from the API response.
 */
export function updatePaginationFromApiResponse(
  setPagination: React.Dispatch<React.SetStateAction<ServerSidePaginationState>>,
  currentPage: number,
  currentLimit: number,
  apiResponse: ApiPaginationResponse
): void {
  setPagination({
    page: currentPage,
    limit: currentLimit, // Keep UI limit (may be -1 for "All")
    total: apiResponse.total,
    totalPages: apiResponse.totalPages,
  });
}

/**
 * Resets pagination totals while preserving current page/limit.
 * Used when API call fails or returns empty result.
 */
export function resetPaginationTotals(
  setPagination: React.Dispatch<React.SetStateAction<ServerSidePaginationState>>,
  currentPage: number,
  currentLimit: number
): void {
  setPagination((prev) => ({
    ...prev,
    page: currentPage,
    limit: currentLimit,
    total: 0,
    totalPages: 0,
  }));
}

/**
 * Shared server-side pagination hook.
 *
 * Responsibilities:
 * - Owns pagination state shape: { page, limit, total, totalPages }
 * - Calculates when pagination controls should be shown
 * - Provides generic page/rows-per-page handlers wired to a fetch function
 * - Provides utilities for common pagination patterns (limit conversion, state updates)
 *
 * Usage pattern:
 *
 * const {
 *   pagination,
 *   setPagination,
 *   showPagination,
 *   createPageChangeHandlers,
 *   convertLimitForApi,
 *   updatePaginationFromApiResponse,
 *   resetPaginationTotals,
 * } = useServerPagination();
 *
 * const fetchPage = React.useCallback(async (page, limit) => {
 *   const apiLimit = convertLimitForApi(limit);
 *   const result = await api(page, apiLimit);
 *   if (result) {
 *     updatePaginationFromApiResponse(setPagination, page, limit, result.pagination);
 *   } else {
 *     resetPaginationTotals(setPagination, page, limit);
 *   }
 * }, [setPagination]);
 *
 * const { handlePageChange, handleRowsPerPageChange } =
 *   createPageChangeHandlers(fetchPage);
 */
export function useServerPagination(
  options: UseServerPaginationOptions = {}
) {
  const {
    initialPage = 1,
    initialLimit = 10,
    minTotalForPagination = 10,
    allOptionLimit = 999999,
  } = options;

  const [pagination, setPagination] = React.useState<ServerSidePaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });

  // Use ref to always access current pagination limit without causing handler recreation
  const paginationRef = React.useRef(pagination);
  React.useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const showPagination = pagination.total > minTotalForPagination;

  /**
   * Factory to build page-change handlers for a specific fetch function.
   * Keeps the fetch logic in the caller while standardising pagination UX.
   */
  const createPageChangeHandlers = React.useCallback(
    (fetchPage: (page: number, limit: number) => void | Promise<void>): PageChangeHandlers => {
      const handlePageChange = (page: number) => {
        // Use current limit from ref to avoid stale closure
        fetchPage(page, paginationRef.current.limit);
      };

      const handleRowsPerPageChange = (rowsPerPage: number) => {
        fetchPage(1, rowsPerPage);
      };

      return { handlePageChange, handleRowsPerPageChange };
    },
    []
  );

  /**
   * Converts UI limit (-1 for "All") to API limit using the configured allOptionLimit.
   */
  const convertLimitForApiBound = React.useCallback(
    (uiLimit: number): number => convertLimitForApi(uiLimit, allOptionLimit),
    [allOptionLimit]
  );

  /**
   * Updates pagination state from API response, preserving UI page/limit.
   */
  const updatePaginationFromApiResponseBound = React.useCallback(
    (
      currentPage: number,
      currentLimit: number,
      apiResponse: ApiPaginationResponse
    ): void => {
      updatePaginationFromApiResponse(setPagination, currentPage, currentLimit, apiResponse);
    },
    [setPagination]
  );

  /**
   * Resets pagination totals while preserving current page/limit.
   */
  const resetPaginationTotalsBound = React.useCallback(
    (currentPage: number, currentLimit: number): void => {
      resetPaginationTotals(setPagination, currentPage, currentLimit);
    },
    [setPagination]
  );

  return {
    pagination,
    setPagination,
    showPagination,
    createPageChangeHandlers,
    // Utility functions bound to hook's configuration
    convertLimitForApi: convertLimitForApiBound,
    updatePaginationFromApiResponse: updatePaginationFromApiResponseBound,
    resetPaginationTotals: resetPaginationTotalsBound,
  };
}


