import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomTable } from "@/components/CustomTable";
import { Plus, ChevronDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface ServerSidePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TableCardProps<TData = unknown> {
  title: string;
  data: TData[];
  columns: ColumnDef<TData>[];
  loading?: boolean;
  onAdd?: () => void;
  bottomContent?: React.ReactNode;
  footerRow?: TData;
  onRowClick?: (row: TData) => void;
  rowClassName?: string | ((row: TData) => string);
  size?: "compact" | "normal" | "comfortable";
  variant?: "default" | "striped";
  enableSorting?: boolean;
  enableExport?: boolean;
  enablePrint?: boolean;
  enableSearch?: boolean;
  enableFilter?: boolean;
  enableRowsPerPage?: boolean;
  className?: string;
  iconType?: "plus" | "chevron" | "none";
  showCheckbox?: boolean;
  checkboxLabel?: string;
  checkboxChecked?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
  dropdownItems?: DropdownMenuItem[];
  dropdownLabel?: string;
  // Server-side pagination props
  serverSidePagination?: ServerSidePagination;
  onServerSidePageChange?: (page: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
  // Show All feature
  enableShowAll?: boolean;
  showAllLabel?: string;
  onShowAllChange?: (showAll: boolean) => void;
}

export function TableCard<TData = unknown>({ 
  title,
  data, 
  columns,
  loading, 
  onAdd, 
  bottomContent,
  onRowClick,
  rowClassName,
  footerRow,
  size = "compact",
  variant = "striped",
  enableSorting = true,
  enableExport = false,
  enablePrint = false,
  enableSearch = false,
  enableFilter = false,
  enableRowsPerPage = false,
  className = "border-0 w-full",
  iconType = "plus",
  showCheckbox = false,
  checkboxLabel = "Show All",
  checkboxChecked = false,
  onCheckboxChange,
  dropdownItems = [],
  dropdownLabel = "Actions",
  // Server-side pagination props
  serverSidePagination,
  onServerSidePageChange,
  rowsPerPage,
  onRowsPerPageChange,
  rowsPerPageOptions,
  // Show All feature
  enableShowAll = false,
  showAllLabel = "Show All",
  onShowAllChange,
}: TableCardProps<TData>) {
  const [showAll, setShowAll] = React.useState(false);

  const handleShowAllChange = (checked: boolean) => {
    setShowAll(checked);
    onShowAllChange?.(checked);
    
    // When "Show All" is checked, request all data by setting limit to a very high number
    if (checked && onRowsPerPageChange) {
      onRowsPerPageChange(99999);
    } else if (!checked && onRowsPerPageChange) {
      // When unchecked, reset to default page size
      onRowsPerPageChange(rowsPerPageOptions?.[0] || 10);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {enableShowAll && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${title}-show-all`}
                checked={showAll}
                onCheckedChange={handleShowAllChange}
              />
              <label
                htmlFor={`${title}-show-all`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {showAllLabel}
              </label>
            </div>
          )}
          {showCheckbox && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${title}-checkbox`}
                checked={checkboxChecked}
                onCheckedChange={(checked: boolean) => onCheckboxChange?.(checked)}
              />
              <label
                htmlFor={`${title}-checkbox`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {checkboxLabel}
              </label>
            </div>
          )}
          {onAdd && iconType !== "none" && (
            iconType === "chevron" && dropdownItems.length > 0 ? (
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
            ) : (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAdd}>
                <Plus className="h-4 w-4" />
              </Button>
            )
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CustomTable
          data={data}
          columns={columns}
          footerRow={footerRow}
          size={size}
          variant={variant}
          enableSorting={enableSorting}
          enableExport={enableExport}
          enablePrint={enablePrint}
          enableSearch={enableSearch}
          enableFilter={enableFilter}
          enableRowsPerPage={enableRowsPerPage}
          className={className}
          isLoading={loading}
          rowClassName={rowClassName}
          onRowClick={onRowClick}
          // Pass through server-side pagination props (hide when showing all)
          serverSidePagination={!showAll ? serverSidePagination : undefined}
          onServerSidePageChange={!showAll ? onServerSidePageChange : undefined}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={rowsPerPageOptions}
        />
        {bottomContent && (
          <div className="flex justify-end mt-2">
            {bottomContent}
          </div>
        )}
      </CardContent>
    </Card>
  );
}