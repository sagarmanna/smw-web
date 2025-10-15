import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomTable } from "@/components/CustomTable";
import { Plus, ChevronDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
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

interface TableCardProps<TData = unknown> {
  title: string;
  data: TData[];
  columns: ColumnDef<TData>[];
  loading?: boolean;
  onAdd?: () => void;
  footerRow?: TData;
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
}

export function TableCard<TData = unknown>({ 
  title,
  data, 
  columns,
  loading, 
  onAdd, 
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
  dropdownLabel = "Actions"
}: TableCardProps<TData>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {showCheckbox && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${title}-checkbox`}
                checked={checkboxChecked}
                onCheckedChange={(checked: boolean) => onCheckboxChange?.(checked)}
              />
              <label
                htmlFor={`${title}-checkbox`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                  {/* <DropdownMenuLabel>{dropdownLabel}</DropdownMenuLabel>
                  <DropdownMenuSeparator /> */}
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
        />
      </CardContent>
    </Card>
  );
}
