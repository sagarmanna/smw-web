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
          <td colSpan={columns.length} className={`h-32 text-center ${getSizeClasses.cell}`}>
            {customLoadingState || (
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                <span className="text-sm font-medium">Loading...</span>
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
                  <td key={cell.id} className={`${getSizeClasses.cell} text-muted-foreground`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {/* Footer Row */}
          {footerRow && (
            <tr className="bg-muted/50 border-t-2 border-border/50 font-semibold">
              {columns.map((column, index) => {
                const accessorKey = 'accessorKey' in column ? column.accessorKey : `col-${index}`;
                const cellValue = (footerRow as Record<string, unknown>)[accessorKey as string];
                
                return (
                  <td key={`footer-${index}`} className={`${getSizeClasses.cell} font-bold text-foreground bg-muted/30`}>
                    {String(cellValue)}
                  </td>
                );
              })}
            </tr>
          )}
        </>
      ) : (
        <tr>
          <td colSpan={columns.length} className={`h-32 text-center ${getSizeClasses.cell}`}>
            {customEmptyState || (
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <div className="text-4xl">📋</div>
                <span className="text-sm font-medium">No results found</span>
              </div>
            )}
          </td>
        </tr>
      )}
    </tbody>
  );
}
