"use client";

import { useCallback } from "react";
import { PayloadAction } from "@reduxjs/toolkit";

import { useGenericListing } from "@/hooks/useGenericListing";

import { ProgramsQuery, ProgramRow } from "../programs.api";
import { fetchPrograms, setColumnFilters, setPage, setPageSize, setSorting as setSortingAction, setActiveFilter } from "../programsListing.slice";

export function useProgramListing(location: string, type: "PRIVATE" | "GROUP") {
  const buildQuery = useCallback((
    page: number,
    pageSize: number,
    columnFilters: Record<string, unknown>,
    activeFilter: string | undefined,
    sortBy: string | undefined,
    sortDir: "asc" | "desc"
  ): ProgramsQuery => {
    // Map active filter to API parameters
    const showActive = activeFilter === "active" ? true : activeFilter === "inactive" ? false : undefined;
    const showInActive = activeFilter === "inactive" ? true : activeFilter === "active" ? false : undefined;

    return {
      page,
      limit: pageSize,
      type,
      sortBy: sortBy || "name",
      sortOrder: sortDir.toUpperCase() as "ASC" | "DESC",
      showAll: false,
      showActive,
      showInActive,
    };
  }, [type]);

  const setSorting = (payload: {
    sortBy?: string;
    sortDir: "asc" | "desc";
  }): PayloadAction<{ sortBy?: string; sortDir: "asc" | "desc" }> => {
    return setSortingAction({
      sortBy: payload.sortBy as string | undefined,
      sortDir: payload.sortDir,
    });
  };

  return useGenericListing<ProgramRow, ProgramsQuery>({
    sliceName: "programsListing",
    fetchThunk: fetchPrograms,
    actions: {
      setPage,
      setPageSize,
      setSorting,
      setColumnFilters,
      setActiveFilter,
    },
    buildQuery,
    location,
    defaultSortField: "name",
    defaultSortDir: "asc",
  });
}

