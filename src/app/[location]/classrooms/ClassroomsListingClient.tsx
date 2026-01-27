"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { CustomTable } from "@/components/CustomTable";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { Button } from "@/components/ui/button";

import { ClassroomRow } from "./classrooms.api";
import { classroomColumns } from "./tableConfigs";
import { useClassroomListing } from "./hooks/useClassroomListing";
import { AddClassroomModal } from "./components/modals/AddClassroomModal";

interface ClassroomsListingClientProps {
  location: string;
}

export function ClassroomsListingClient({ location }: ClassroomsListingClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const columns = React.useMemo<ColumnDef<ClassroomRow>[]>(() => classroomColumns, []);

  const {
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
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
  } = useClassroomListing(location);

  const openAddModal = () => {
    setIsModalOpen(true);
  };

  const handleRowClick = React.useCallback(
    (classroom: ClassroomRow) => {
      router.push(`/${location}/classrooms/${classroom.id}`);
    },
    [location, router]
  );

  return (
    <ReportPageLayout
      title="Classrooms"
      subtitle="Manage classrooms"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
      actions={
        <Button
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-white"
          aria-label="Add Classroom"
        >
          <Plus className="h-5 w-5" /> 
          Add Classroom
        </Button>
      }
    >
      <CustomTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        size="compact"
        variant="default"
        stickyHeader={true}
        enableSearch={false}
        enableFilter={true}
        enablePrint={false}
        enableRowsPerPage={true}
        enableColumnFilters={true}
        onColumnFilterChange={handleColumnFilterChange}
        onColumnFilterEnter={handleColumnFilterEnter}
        columnFilters={columnFilters}
        columnFilterPlaceholders={{
          name: "Enter shortname",
          description: "Enter longname",
        }}
        serverSidePagination={{ page, limit: pageSize, total, totalPages }}
        onServerSidePageChange={(newPage) => setPage(newPage)}
        manualSorting={true}
        sorting={sorting}
        onSortingChange={(s) => {
          setSorting(s);
          setPage(1);
        }}
        hideRecordCount={true}
        showRecordCountInToolbar={true}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 20, 50, 100]}
        enableExport={false}
        onRowsPerPageChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        onRowClick={handleRowClick}
      />

      <AddClassroomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchData()}
        location={location}
        mode="add"
        initialData={null}
      />
    </ReportPageLayout>
  );
}

