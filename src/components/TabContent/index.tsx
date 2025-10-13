import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

interface TabContentProps<TData = unknown> {
  title: string;
  data: TData[];
  columns: ColumnDef<TData>[];
  loading?: boolean;
  hasAddButton?: boolean;
  onAdd?: () => void;
  emptyState?: string;
  hasTable?: boolean;
  footerRow?: TData;
  bottomContent?: React.ReactNode;
}

export function TabContent<TData = unknown>({
  title,
  data,
  columns,
  loading = false,
  hasAddButton = true,
  onAdd,
  emptyState = "No data available",
  hasTable = true,
  footerRow,
  bottomContent,
}: TabContentProps<TData>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {hasAddButton && onAdd && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {hasTable ? (
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
            enableRowsPerPage={false}
            className="border-0 w-full"
            isLoading={loading}
            footerRow={footerRow}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            {emptyState}
          </div>
        )}
        {bottomContent}
      </CardContent>
    </Card>
  );
}
