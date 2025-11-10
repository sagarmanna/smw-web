// components/PaymentTable.tsx
import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ColumnDefinition, ColumnFilter, PaginationState } from '../types';

interface PaymentTableProps {
  data: unknown[];
  columns: ColumnDefinition[];
  columnFilters?: ColumnFilter;
  onFilterChange?: (columnKey: string, filterValue: unknown) => void;
  serverSidePagination?: PaginationState;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
}

/**
 * Payment table component with optional server-side pagination
 */
export const PaymentTable: React.FC<PaymentTableProps> = ({
  data,
  columns,
  columnFilters,
  onFilterChange,
  serverSidePagination,
  loading = false,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 20, 50, 100],
}) => {
  const hasPagination = serverSidePagination && onPageChange && onRowsPerPageChange;

  const handlePreviousPage = () => {
    if (serverSidePagination && onPageChange && serverSidePagination.page > 1) {
      onPageChange(serverSidePagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (
      serverSidePagination &&
      onPageChange &&
      serverSidePagination.page < serverSidePagination.totalPages
    ) {
      onPageChange(serverSidePagination.page + 1);
    }
  };

  const handleRowsPerPageChange = (value: string) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(parseInt(value));
    }
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead
                    key={column.id || column.accessorKey || index}
                    style={{ width: column.size ? `${column.size}px` : 'auto' }}
                  >
                    <div className="space-y-2">
                      <div className="font-semibold">
                        {typeof column.header === 'function'
                          ? column.header()
                          : column.header}
                      </div>
                      
                      {/* Filter for this column */}
                      {column.filter && columnFilters && onFilterChange && (
                        <div className="mt-2">
                          {column.filter.type === 'dropdown' && column.filter.options && (
                            <Select
                              value={
                                (columnFilters[column.accessorKey || ''] as string) || 'all'
                              }
                              onValueChange={(value) =>
                                onFilterChange(column.accessorKey || '', value)
                              }
                            >
                              <SelectTrigger className="h-8 w-full text-xs">
                                <SelectValue placeholder="All" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {column.filter.options.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-8 text-gray-500"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex}>
                        {column.cell
                          ? column.cell({ row: { original: row } })
                          : column.accessorKey
                          ? String(
                              (row as Record<string, unknown>)[column.accessorKey] ?? ''
                            )
                          : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {hasPagination && serverSidePagination.total > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <Select
              value={serverSidePagination.limit.toString()}
              onValueChange={handleRowsPerPageChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rowsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-6">
            <span className="text-sm text-gray-700">
              Page {serverSidePagination.page} of {serverSidePagination.totalPages} (
              {serverSidePagination.total} total)
            </span>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={serverSidePagination.page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={
                  serverSidePagination.page === serverSidePagination.totalPages || loading
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};