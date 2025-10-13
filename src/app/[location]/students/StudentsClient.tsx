/* eslint-disable react-hooks/exhaustive-deps */
// StudentsClient.tsx - List Page
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { Card } from "@/components/ui/card";
import { getStudents, Student } from "./students.api";
import { useExportableData } from "@/hooks/useExportableData";

interface StudentsClientProps {
  location: string;
}

const columns = [
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }: { row: { original: Student } }) => row.original.firstName || '-'
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    cell: ({ row }: { row: { original: Student } }) => row.original.lastName || '-'
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }: { row: { original: Student } }) => row.original.customer || '-'
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }: { row: { original: Student } }) => row.original.phone || '-'
  },
];

export function StudentsClient({ location }: StudentsClientProps) {
  const router = useRouter();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(20);
  const [activeFilter, setActiveFilter] = React.useState<string | undefined>(undefined);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData({
    reportTitle: "Students List",
    columns,
    data: students,
  });

  const load = React.useCallback(async (page = 1, limit = 20, filter?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getStudents(location, page, limit, filter);

      if (result.success) {
        setStudents(result.data);
        setPagination(result.pagination);
      } else {
        setError(result.message || "Failed to fetch students");
        setStudents([]);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setError(msg);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  React.useEffect(() => {
    load(1, rowsPerPage, activeFilter);
  }, [load, activeFilter]);

  const handlePageChange = React.useCallback((page: number) => {
    load(page, rowsPerPage, activeFilter);
  }, [load, rowsPerPage, activeFilter]);

  const handleRowsPerPageChange = React.useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    const actualLimit = newRowsPerPage === -1 ? 999999 : newRowsPerPage;
    load(1, actualLimit, activeFilter);
  }, [load, activeFilter]);

  const handleFilterChange = React.useCallback((filterKey: string | undefined) => {
    setActiveFilter(filterKey);
    load(1, rowsPerPage, filterKey);
  }, [load, rowsPerPage]);

  const handleRowClick = React.useCallback((row: Student) => {
    router.push(`/${location}/students/${row.id}`);
  }, [location, router]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const tableRows = students.map(student => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${student.firstName}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${student.lastName}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${student.customer}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${student.phone}</td>
      </tr>
    `).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Students List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { font-size: 24px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #f0f0f0; border: 1px solid #ddd; padding: 10px; text-align: left; }
            td { border: 1px solid #ddd; padding: 8px; }
          </style>
        </head>
        <body>
          <h1>Students List</h1>
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Customer</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading students..." className="text-center" />
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white px-2 sm:px-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md px-2 sm:px-3 py-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Students</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage student records</p>
        </div>
      </div>

      {/* Table Card */}
      <Card className="p-3 md:p-4">
        <CustomTable
          data={students}
          columns={columns}
          enableSearch={true}
          searchPlaceholder="Search students..."
          getSearchValue={(row) => `${row.firstName} ${row.lastName} ${row.customer} ${row.phone}`}
          enableExport={true}
          enableFilter={true}
          enablePrint={true}
          enableRowsPerPage={true}
          enableSorting={false}
          onPrint={handlePrint}
          onExport={{
            html: exportToHtml,
            csv: exportToCsv,
            text: exportToText,
            excel: exportToExcel,
            pdf: exportToPdf,
            json: exportToJson,
          }}
          serverSideFilterOptions={[
            { key: 'all', label: 'All Students' },
            { key: 'active', label: 'Active' },
            { key: 'inactive', label: 'Inactive' },
          ]}
          activeServerSideFilter={activeFilter}
          onServerSideFilterChange={handleFilterChange}
          initialRowsPerPage={rowsPerPage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 20, 50, 100]}
          onRowsPerPageChange={handleRowsPerPageChange}
          serverSidePagination={pagination}
          onServerSidePageChange={handlePageChange}
          onRowClick={handleRowClick}
        />
      </Card>

      {error && <div className="text-sm text-red-600 px-2">{error}</div>}
    </div>
  );
}