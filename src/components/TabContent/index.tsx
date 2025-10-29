import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface TabContentProps<TData = unknown> {
  title: string;
  data: TData[];
  columns: ColumnDef<TData>[];
  loading?: boolean;
  error?: string | null;
  hasAddButton?: boolean;
  onAdd?: () => void;
  emptyState?: string;
  hasTable?: boolean;
  footerRow?: TData;
  bottomContent?: React.ReactNode;
  customContent?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  rowClassName?: string | ((row: TData) => string);
  showMoreButton?: boolean;
  onShowMore?: () => void;
  showAllCheckbox?: boolean;
  showAllChecked?: boolean;
  onShowAllChange?: (checked: boolean) => void;
  dropdownItems?: DropdownMenuItem[];
  dropdownLabel?: string;
  
  // Pagination props
  enablePagination?: boolean;
  serverSidePagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  initialRowsPerPage?: number;
}

export function TabContent<TData = unknown>({
  title,
  data,
  columns,
  loading = false,
  error = null,
  hasAddButton = true,
  onAdd,
  emptyState = "No data available",
  hasTable = true,
  footerRow,
  bottomContent,
  customContent,
  onRowClick,
  rowClassName,
  showMoreButton = false,
  onShowMore,
  showAllCheckbox = false,
  showAllChecked = false,
  onShowAllChange,
  dropdownItems = [],
  dropdownLabel = "Actions",
  
  // Pagination props with defaults
  enablePagination = true,
  serverSidePagination,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPage,
  rowsPerPageOptions = [5, 10, 20, 50, 100],
  initialRowsPerPage = 10,
}: TabContentProps<TData>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {hasAddButton && onAdd && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
          {dropdownItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {dropdownItems.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={item.onClick}
                    disabled={item.disabled}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {error ? (
          <div className="text-center py-8 text-red-500">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : hasTable ? (
          <>
            {showAllCheckbox && onShowAllChange && (
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${title}-checkbox`}
                    checked={showAllChecked}
                    onCheckedChange={(checked: boolean) => onShowAllChange(checked)}
                  />
                  <label
                    htmlFor={`${title}-checkbox`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show All
                  </label>
                </div>
              </div>
            )}
            <CustomTable
              data={data}
              columns={columns}
              size="compact"
              variant="striped"
              enableSorting={true}
              enableExport={false}
              enablePrint={false}
              enableSearch={false}
              enableFilter={false}
              enableRowsPerPage={enablePagination}
              className="border-0 w-full"
              isLoading={loading}
              footerRow={footerRow}
              onRowClick={onRowClick}
              rowClassName={rowClassName}
              serverSidePagination={serverSidePagination}
              onServerSidePageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={rowsPerPageOptions}
              initialRowsPerPage={initialRowsPerPage}
            />
          </>
        ) : (
          <div>
            {customContent ? (
              <div>{customContent}</div>
            ) : (
              <div className="text-center py-8 text-gray-500">{emptyState}</div>
            )}
          </div>
        )}
        {bottomContent}
        {showMoreButton && onShowMore && (
          <div className="flex justify-end mt-4">
            <Button 
              variant="link" 
              onClick={onShowMore}
              className="text-blue-600 hover:text-blue-800 p-0 h-auto"
            >
              Show More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
