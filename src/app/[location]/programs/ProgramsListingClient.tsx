"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { CustomTable } from "@/components/CustomTable";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProgramRow } from "./programs.api";
import { createProgramColumns } from "./tableConfigs";
import { useProgramListing } from "./hooks/useProgramListing";
import { AddProgramModal } from "./components/modals/AddProgramModal";

interface ProgramsListingClientProps {
  location: string;
}

export function ProgramsListingClient({ location }: ProgramsListingClientProps) {
  const [activeType, setActiveType] = React.useState<"PRIVATE" | "GROUP">("PRIVATE");
  const [isAddProgramModalOpen, setIsAddProgramModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");
  const [selectedProgram, setSelectedProgram] = React.useState<ProgramRow | null>(null);
  const columns = React.useMemo<ColumnDef<ProgramRow>[]>(
    () => createProgramColumns(activeType),
    [activeType]
  );

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
    activeFilter,
    fetchData,
    handleServerSideFilterChange,
  } = useProgramListing(location, activeType);

  // Reset to page 1 and clear filters when switching tabs
  React.useEffect(() => {
    setPage(1);
    handleServerSideFilterChange(undefined);
  }, [activeType, setPage, handleServerSideFilterChange]);

  const handleTypeChange = (value: string) => {
    setActiveType(value as "PRIVATE" | "GROUP");
  };

  const openAddModal = () => {
    setSelectedProgram(null);
    setModalMode("add");
    setIsAddProgramModalOpen(true);
  };

  const openEditModal = (program: ProgramRow) => {
    setSelectedProgram(program);
    setModalMode("edit");
    setIsAddProgramModalOpen(true);
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="mb-4">
        <Tabs value={activeType} onValueChange={handleTypeChange} className="w-full">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
            <TabsTrigger
              value="PRIVATE"
              className="px-4 py-2 text-sm font-medium"
            >
              Private
            </TabsTrigger>
            <TabsTrigger
              value="GROUP"
              className="px-4 py-2 text-sm font-medium"
            >
              Group
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Programs Section */}
      <ReportPageLayout
        title="Programs"
        subtitle={`Manage ${activeType.toLowerCase()} programs`}
        isLoading={isLoading}
        error={error}
        onRetry={fetchData}
        actions={
          <div className="flex gap-2">
            <Button
              onClick={openAddModal}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />Add Program
            </Button>
          </div>
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
          serverSideFilterOptions={[
            { key: "active", label: "Active" },
            { key: "inactive", label: "Inactive" },
          ]}
          activeServerSideFilter={activeFilter}
          onServerSideFilterChange={handleServerSideFilterChange}
          enablePrint={false}
          enableRowsPerPage={true}
          enableColumnFilters={false}
          serverSidePagination={{ page, limit: pageSize, total, totalPages }}
          onServerSidePageChange={(newPage) => setPage(newPage)}
          hideRecordCount={true}
          showRecordCountInToolbar={true}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 20, 50, 100]}
          enableExport={false}
          onRowsPerPageChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          onRowClick={(row) => openEditModal(row)}
        />

        <AddProgramModal
          isOpen={isAddProgramModalOpen}
          onClose={() => setIsAddProgramModalOpen(false)}
          onSuccess={() => {
            fetchData();
          }}
          location={location}
          mode={modalMode}
          initialData={selectedProgram}
          programType={activeType}
        />
      </ReportPageLayout>
    </div>
  );
}

