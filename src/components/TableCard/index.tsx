import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomTable } from "@/components/CustomTable";
import { Plus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

interface TableCardProps {
  title: string;
  data: unknown[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<any>[];
  loading?: boolean;
  onAdd?: () => void;
  footerRow?: unknown;
  size?: "compact" | "normal" | "comfortable";
  variant?: "default" | "striped";
  enableSorting?: boolean;
  enableExport?: boolean;
  enablePrint?: boolean;
  enableSearch?: boolean;
  enableFilter?: boolean;
  enableRowsPerPage?: boolean;
  className?: string;
}

export function TableCard({ 
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
  className = "border-0 w-full"
}: TableCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {onAdd && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
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
