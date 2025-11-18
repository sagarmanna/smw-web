"use client";

import * as React from "react";
import { SortingState } from "@tanstack/react-table";
import { TeacherRow, mockTeachersData } from "../teachers.api";
import { filterTeachers, TeacherFilters } from "../utils/filterTeachers";
import { sortTeachers, SortField } from "../utils/sortTeachers";

export function useTeacherListing() {
  const [rows, setRows] = React.useState<TeacherRow[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [totalPages, setTotalPages] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [columnFilters, setColumnFilters] = React.useState<Record<string, unknown>>({});
  const [activeFilter, setActiveFilter] = React.useState<string | undefined>(undefined);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build filters object
      const filters: TeacherFilters = {
        firstName: columnFilters.firstName as string | undefined,
        lastName: columnFilters.lastName as string | undefined,
        email: columnFilters.email as string | undefined,
        phone: columnFilters.phone as string | undefined,
        status: activeFilter === "inactive" ? "inactive" : undefined,
      };

      // Apply filters
      let filteredData = filterTeachers(mockTeachersData, filters);

      // Apply sorting
      const sortBy = sorting[0]?.id as SortField | undefined;
      const sortDir = sorting[0]?.desc ? "desc" : "asc";

      if (sortBy) {
        filteredData = sortTeachers(filteredData, sortBy, sortDir);
      }

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      setRows(paginatedData);
      setTotal(filteredData.length);
      setTotalPages(Math.ceil(filteredData.length / pageSize));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load teachers");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sorting, columnFilters, activeFilter]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleColumnFilterChange = React.useCallback(
    async (columnKey: string, filterValue: unknown) => {
      setColumnFilters((prev) => ({
        ...prev,
        [columnKey]: filterValue,
      }));
      setPage(1);
    },
    []
  );

  const handleColumnFilterEnter = React.useCallback(async () => {
    setPage(1);
    fetchData();
  }, [fetchData]);

  const handleServerSideFilterChange = React.useCallback(
    (filterKey: string | undefined) => {
      setActiveFilter(filterKey);
      setPage(1);
    },
    []
  );

  return {
    rows,
    total,
    totalPages,
    isLoading,
    error,
    sorting,
    setSorting,
    page,
    setPage,
    pageSize,
    setPageSize,
    columnFilters,
    activeFilter,
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
    handleServerSideFilterChange,
  };
}

