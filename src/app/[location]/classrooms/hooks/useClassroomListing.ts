"use client";

import { useCallback } from "react";
import { PayloadAction } from "@reduxjs/toolkit";

import { useGenericListing } from "@/hooks/useGenericListing";

import { ClassroomsQuery, ClassroomRow, type ClassroomsOrder, type ClassroomsSortField } from "../classrooms.api";
import {
  fetchClassrooms,
  setColumnFilters,
  setPage,
  setPageSize,
  setSorting as setSortingAction,
  setActiveFilter,
} from "../classroomsListing.slice";

export function useClassroomListing(location: string) {
  const buildQuery = useCallback(
    (
      page: number,
      pageSize: number,
      columnFilters: Record<string, unknown>,
      _activeFilter: string | undefined,
      sortBy: string | undefined,
      sortDir: "asc" | "desc"
    ): ClassroomsQuery => {
      const sort: ClassroomsSortField | undefined =
        sortBy === "description" ? "description" : sortBy === "name" ? "name" : undefined;
      const order: ClassroomsOrder | undefined = sort ? (sortDir === "desc" ? "DESC" : "ASC") : undefined;

      return {
        page,
        limit: pageSize,
        name: columnFilters.name as string | undefined,
        description: columnFilters.description as string | undefined,
        sort,
        order,
      };
    },
    []
  );

  const setSorting = (payload: {
    sortBy?: string;
    sortDir: "asc" | "desc";
  }): PayloadAction<{ sortBy?: string; sortDir: "asc" | "desc" }> => {
    return setSortingAction({
      sortBy: payload.sortBy as string | undefined,
      sortDir: payload.sortDir,
    });
  };

  return useGenericListing<ClassroomRow, ClassroomsQuery>({
    sliceName: "classroomsListing",
    fetchThunk: fetchClassrooms,
    actions: {
      setPage,
      setPageSize,
      setSorting,
      setColumnFilters,
      setActiveFilter,
    },
    buildQuery,
    location,
  });
}

