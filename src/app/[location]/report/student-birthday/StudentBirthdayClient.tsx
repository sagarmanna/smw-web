"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { getStudentBirthdayList, StudentBirthday } from "./student-birthday.api";
import { addDays } from "date-fns";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { usePrintReport } from "@/hooks/usePrintReport";

// Client Component
export const StudentBirthdayClient = ({ location }: { location: string }) => {
  const [data, setData] = React.useState<StudentBirthday[]>([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dateRange, setDateRange] = React.useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const fetchStudentBirthdays = React.useCallback(async (page: number, startDate?: Date, endDate?: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getStudentBirthdayList(location, {
        page,
        startDate: startDate || dateRange.from,
        endDate: endDate || dateRange.to,
      });

      if (response.success) {
        setData(response.data.body);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || "An unknown error occurred");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Failed to fetch student birthdays:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [location, dateRange]);

  React.useEffect(() => {
    fetchStudentBirthdays(1, dateRange.from, dateRange.to);
  }, [fetchStudentBirthdays, dateRange]);

  const handlePageChange = (newPage: number) => {
    fetchStudentBirthdays(newPage, dateRange.from, dateRange.to);
  };
  
  const handleDateRangeChange = (newDateRange: { from: Date; to: Date }) => {
    setDateRange(newDateRange);
    fetchStudentBirthdays(1, newDateRange.from, newDateRange.to);
  };

  const refetch = () => {
    fetchStudentBirthdays(1, dateRange.from, dateRange.to);
  };

  const { handlePrint } = usePrintReport<StudentBirthday>();

  const columns: ColumnDef<StudentBirthday>[] = [
    {
      accessorKey: "studentName",
      header: "Name",
      size: 200,
      meta: {
        printable: true,
        printableName: "Name",
      },
    },
    {
      accessorKey: "birthDate",
      header: "Birth Date",
      size: 150,
      meta: {
        printable: true,
        printableName: "Birth Date",
      },
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      size: 200,
      meta: {
        printable: true,
        printableName: "Customer",
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone",
      size: 150,
      meta: {
        printable: true,
        printableName: "Phone",
      },
    },
    {
      accessorKey: "email",
      header: "E-mail",
      size: 200,
      meta: {
        printable: true,
        printableName: "E-mail",
      },
    },
  ];

  return (
    <ReportPageLayout
      title="Student Birthdays"
      subtitle="View upcoming student birthdays"
      isLoading={isLoading}
      error={error}
      isEmpty={data.length === 0}
      onRetry={refetch}
      emptyStateProps={{
        title: "No student birthdays found",
        description: "There are no student birthdays available for the selected date range.",
      }}
    >
      <CustomTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        
        // Features
        enablePrint={true}
        onPrint={() => handlePrint({
          reportTitle: 'Student Birthdays Report',
          columns,
          data,
        })}
        enableDateRangePicker={true}
        
        // Server-side Pagination
        serverSidePagination={pagination}
        onServerSidePageChange={handlePageChange}
  
        // Date Range Picker
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
  
        // Disabled Features
        enableSearch={false}
        enableExport={false}
        enableFilter={false}
        enableShowAll={false}
        enableRowsPerPage={false}
      />
    </ReportPageLayout>
  );
};
