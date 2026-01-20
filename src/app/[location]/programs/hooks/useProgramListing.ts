"use client";

import { useCallback, useMemo } from "react";
import { PayloadAction } from "@reduxjs/toolkit";

import { useGenericListing } from "@/hooks/useGenericListing";

import { ProgramRow, ProgramsQuery } from "../programs.api";
import { buildProgramsActiveFlags } from "../utils/programsUtils";
import {
  fetchPrograms,
  setActiveFilter,
  setColumnFilters,
  setPage,
  setPageSize,
  setSorting as setSortingAction,
} from "../programsListing.slice";

export function useProgramListing(location: string, type: "PRIVATE" | "GROUP") {
  const setSorting = useCallback(
    (payload: {
      sortBy?: string;
      sortDir: "asc" | "desc";
    }): PayloadAction<{ sortBy?: string; sortDir: "asc" | "desc" }> => {
      return setSortingAction({
        sortBy: payload.sortBy as string | undefined,
        sortDir: payload.sortDir,
      });
    },
    []
  );

  const buildQuery = useCallback(
    (
      page: number,
      pageSize: number,
      _columnFilters: Record<string, unknown>,
      activeFilter: string | undefined,
      sortBy: string | undefined,
      sortDir: "asc" | "desc"
    ): ProgramsQuery => {
      const { showActive, showInActive } = buildProgramsActiveFlags(activeFilter);

      const query: ProgramsQuery = {
        page,
        limit: pageSize,
        type,
        sortBy: sortBy || "name",
        sortOrder: sortDir.toUpperCase() as "ASC" | "DESC",
        showActive,
        showInActive,
      };

      return query;
    },
    [type]
  );

  // Memoize actions object so `useGenericListing` callbacks stay stable.
  // Without this, `handleServerSideFilterChange` can change identity every render,
  // causing consuming effects to re-run and clear the selected filter back to "All".
  const actions = useMemo(
    () => ({
      setPage,
      setPageSize,
      setSorting,
      setColumnFilters,
      setActiveFilter,
    }),
    [setSorting]
  );

  return useGenericListing<ProgramRow, ProgramsQuery>({
    sliceName: "programsListing",
    fetchThunk: fetchPrograms,
    actions,
    buildQuery,
    location,
    defaultSortField: "name",
    defaultSortDir: "asc",
  });
}



