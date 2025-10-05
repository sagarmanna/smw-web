import * as React from "react";
import { flexRender, Table, ColumnDef } from "@tanstack/react-table";

interface TableBodyProps<TData, TValue = unknown> {
  table: Table<TData>;
  columns: ColumnDef<TData, TValue>[];
  footerRow?: TData;
  isLoading: boolean;
  customLoadingState?: React.ReactNode;
  customEmptyState?: React.ReactNode;
  getSizeClasses: {
    cell: string;
  };
  getRowClasses: (index: number) => string;
  rowClassName?: string | ((row: TData) => string);
}

export function TableBody<TData, TValue = unknown>({
  table,
  columns,
  footerRow,
  isLoading,
  customLoadingState,
  customEmptyState,
  getSizeClasses,
  getRowClasses,
  rowClassName,
}: TableBodyProps<TData, TValue>) {
  return (
    <tbody>
      {isLoading ? (
        <tr>
          <td colSpan={columns.length} className={`h-24 border-b text-center ${getSizeClasses.cell}`}>
            {customLoadingState || (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                <span>Loading...</span>
              </div>
            )}
          </td>
        </tr>
      ) : table.getRowModel().rows?.length ? (
        <>
          {table.getRowModel().rows.map((row, index) => {
            const customRowClass = typeof rowClassName === "function" 
              ? rowClassName(row.original) 
              : rowClassName;
            return (
              <tr 
                key={row.id} 
                className={`${getRowClasses(index)} ${customRowClass || ""}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={`border-b ${getSizeClasses.cell}`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {/* Footer Row */}
          {footerRow && (
            <tr className="bg-muted/30 font-semibold">
              {columns.map((column, index) => {
                const accessorKey = 'accessorKey' in column ? column.accessorKey : `col-${index}`;
                const cellValue = (footerRow as Record<string, unknown>)[accessorKey as string];
                
                return (
                  <td key={`footer-${index}`} className={`border-b ${getSizeClasses.cell} font-bold`}>
                    {String(cellValue)}
                  </td>
                );
              })}
            </tr>
          )}
        </>
      ) : (
        <tr>
          <td colSpan={columns.length} className={`h-24 border-b text-center ${getSizeClasses.cell}`}>
            {customEmptyState || "No results."}
          </td>
        </tr>
      )}
    </tbody>
  );
}
