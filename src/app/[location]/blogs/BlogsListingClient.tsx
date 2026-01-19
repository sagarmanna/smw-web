"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { BlogRow } from "./blogs.api";
import { blogColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useBlogListing } from "./hooks/useBlogListing";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { BlogCrudModal } from "./components/modals/BlogCrudModal";

interface BlogsClientProps {
  location: string;
}

/**
 * Client component for displaying blogs listing table
 * 
 * Features:
 * - Server-side pagination
 * - Loading and error states
 * - Responsive table layout
 * 
 * @param location - Current location context
 */
export function BlogsListingClient({ location }: BlogsClientProps) {
  // Static columns don't need memoization
  const columns = blogColumns;
  const [isBlogModalOpen, setIsBlogModalOpen] = React.useState(false);
  const [blogModalMode, setBlogModalMode] = React.useState<"add" | "edit">("add");
  const [selectedBlog, setSelectedBlog] = React.useState<(BlogRow & { id: number }) | null>(null);

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
    fetchData,
  } = useBlogListing(location);

  if (error) {
    return (
      <ReportPageLayout
        title="Blogs"
        subtitle="Browse all blogs, search and sort"
        isLoading={isLoading}
        error={error}
        onRetry={fetchData}
      >
        <div />
      </ReportPageLayout>
    );
  }

  return (
    <ReportPageLayout
      title="Blogs"
      subtitle="Browse all blogs, search and sort"
      isLoading={isLoading}
      error={null}
      onRetry={fetchData}
      actions={
        <Button 
          onClick={() => {
            setBlogModalMode("add");
            setSelectedBlog(null);
            setIsBlogModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Blog
        </Button>
      }
    >
      <CustomTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        onRowClick={(row) => {
          if (!row?.id) {
            toast.error("This blog cannot be edited because it has no id.");
            return;
          }
          setSelectedBlog(row as BlogRow & { id: number });
          setBlogModalMode("edit");
          setIsBlogModalOpen(true);
        }}

        // Visual configuration
        size="compact"
        variant="default"
        stickyHeader={true}

        // Features
        enableSearch={false}
        searchPlaceholder="Search blogs..."
        getSearchValue={(r) => `${r.userName || ''} ${r.title} ${r.content}`}
        enableFilter={false}
        enableRowsPerPage={true}
        enablePrint={false}
        enableColumnFilters={false}

        // Sorting and pagination (server-side)
        manualSorting={false}
        sorting={sorting}
        onSortingChange={(s) => {
          setSorting(s);
          setPage(1);
        }}
        serverSidePagination={{ page, limit: pageSize, total, totalPages }}
        onServerSidePageChange={(newPage) => setPage(newPage)}
        hideRecordCount={true}
        showRecordCountInToolbar={true}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 20, 50, 100]}
        enableExport={false}
        onRowsPerPageChange={(newSize) => { setPageSize(newSize); setPage(1); }}
      />

      <BlogCrudModal
        isOpen={isBlogModalOpen}
        onClose={() => {
          setIsBlogModalOpen(false);
          setSelectedBlog(null);
          setBlogModalMode("add");
        }}
        onSuccess={() => {
          fetchData();
        }}
        location={location}
        mode={blogModalMode}
        initialData={selectedBlog}
      />
    </ReportPageLayout>
  );
}

