"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { TimelineRow } from "./timelineListing.api";
import { getTimelineColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useTimelineListing } from "./hooks/useTimelineListing";

interface TimelineListingClientProps {
  location: string;
}

export function TimelineListingClient({ location }: TimelineListingClientProps) {
  const {
    rows,
    total,
    totalPages,
    isLoading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    columnFilters,
    handleColumnFilterChange,
    handleColumnFilterEnter,
    createdUsers,
    fetchData,
    fetchUsers,
  } = useTimelineListing();

  // Fetch users on mount and when location changes
  React.useEffect(() => {
    fetchUsers(location);
  }, [location, fetchUsers]);

  // Fetch timeline data on mount and when location changes
  React.useEffect(() => {
    fetchData(location);
  }, [location, fetchData]);

  // Prepare filter options for Created User dropdown
  const createdUserFilterOptions = React.useMemo(() => {
    return [
      { value: "all", label: "Select User" },
      ...createdUsers.map(user => ({ 
        value: user.id.toString(), 
        label: user.publicIdentity 
      })),
    ];
  }, [createdUsers]);

  // Update columns with dynamic filter options for createdUser dropdown
  const columns = React.useMemo(() => {
    return getTimelineColumns(location).map((col, index) => {
      // createdUser is the second column (index 1)
      if (index === 1 && col.filter && 'accessorKey' in col && col.accessorKey === "createdUser") {
        return {
          ...col,
          filter: {
            ...col.filter,
            options: createdUserFilterOptions,
          },
        };
      }
      return col;
    });
  }, [location, createdUserFilterOptions]);

  return (
    <ReportPageLayout
      title="Timeline"
      subtitle="View system events and activities"
      isLoading={isLoading}
      error={error}
      onRetry={() => fetchData(location)}
    >
      <CustomTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        size="compact"
        variant="default"
        stickyHeader={true}
        enableSearch={false}
        enableFilter={false}
        enablePrint={false}
        enableRowsPerPage={true}
        enableColumnFilters={true}
        onColumnFilterChange={handleColumnFilterChange}
        onColumnFilterEnter={() => {
          handleColumnFilterEnter();
          fetchData(location);
        }}
        columnFilters={columnFilters}
        columnFilterPlaceholders={{
          date: "Select date range",
          createdUser: "Select User",
          message: "Enter message",
        }}
        serverSidePagination={{ page, limit: pageSize, total, totalPages }}
        onServerSidePageChange={(newPage) => setPage(newPage)}
        hideRecordCount={true}
        showRecordCountInToolbar={true}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 20, 50, 100]}
        onRowsPerPageChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />
    </ReportPageLayout>
  );
}

