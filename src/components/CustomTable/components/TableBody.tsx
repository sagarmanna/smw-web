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
  onRowClick?: (row: TData) => void;
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
  onRowClick,
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
                className={`${getRowClasses(index)} ${customRowClass || ""} border-b border-border/50 hover:bg-primary/10 transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <td 
                    key={cell.id} 
                    className={`${getSizeClasses.cell} text-muted-foreground border-r border-border/50`}
                    style={{
                      width: cell.column.columnDef.size ? `${cell.column.columnDef.size}px` : undefined,
                      minWidth: cell.column.columnDef.minSize ? `${cell.column.columnDef.minSize}px` : undefined,
                      maxWidth: cell.column.columnDef.maxSize ? `${cell.column.columnDef.maxSize}px` : undefined,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {/* Footer Row */}
          {footerRow && (
            <tr data-footer="true" className="bg-muted/50 border-t-2 border-b border-border/50 font-semibold">
              {columns.map((column, index) => {
                const accessorKey = 'accessorKey' in column ? column.accessorKey : `col-${index}`;
                const cellValue = (footerRow as Record<string, unknown>)[accessorKey as string];
                
                // Use the column's cell renderer if available, otherwise fallback to string
                let renderedValue: React.ReactNode;
                if (column.cell) {
                  try {
                    // Create a minimal mock context for the cell renderer
                    const mockContext = {
                      column: column,
                      row: { original: footerRow },
                      cell: { 
                        id: `footer-${index}`, 
                        column: column, 
                        row: { original: footerRow }, 
                        getValue: () => cellValue, 
                        renderValue: () => cellValue,
                        getContext: () => mockContext,
                        getIsAggregated: () => false,
                        getIsGrouped: () => false,
                        getIsPlaceholder: () => false
                      },
                      table: {} as never,
                      getValue: () => cellValue,
                      renderValue: () => cellValue,
                    } as never;
                    renderedValue = flexRender(column.cell, mockContext as never);
                  } catch (error) {
                    // Fallback to string if cell renderer fails
                    renderedValue = String(cellValue);
                  }
                } else {
                  renderedValue = String(cellValue);
                }
                
                return (
                  <td 
                    key={`footer-${index}`} 
                    className={`${getSizeClasses.cell} font-bold text-foreground bg-muted/30 border-r border-border/50`}
                    style={{
                      width: column.size ? `${column.size}px` : undefined,
                      minWidth: column.minSize ? `${column.minSize}px` : undefined,
                      maxWidth: column.maxSize ? `${column.maxSize}px` : undefined,
                    }}
                  >
                    {renderedValue}
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
