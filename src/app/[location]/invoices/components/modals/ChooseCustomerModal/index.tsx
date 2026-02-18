"use client";

import * as React from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomTable } from "@/components/CustomTable";
import { getCustomers } from "@/app/[location]/customers/customers.api";

interface CustomerOption {
  firstName: string;
  lastName: string;
  email: string;
  students: string;
  customerId?: number;
  phone?: string;
}

interface ChooseCustomerModalProps {
  location: string;
  open: boolean;
  onClose: () => void;
  onSelect: (customer: CustomerOption) => void;
  currentCustomerId?: number;
}

export function ChooseCustomerModal({
  location,
  open,
  onClose,
  onSelect,
}: ChooseCustomerModalProps) {
  const [customers, setCustomers] = React.useState<CustomerOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<Record<string, unknown>>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);

  React.useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setIsLoading(true);

    (async () => {
      try {
        const result = await getCustomers(location, {
          page: 1,
          limit: -1,
          showActive: true,
          showInActive: true,
        });

        const body = result?.success ? result.data.body : [];
        const mapped: CustomerOption[] = (body || []).map((c) => ({
          firstName: c.firstName || "",
          lastName: c.lastName || "",
          email: c.email || "",
          students: c.students || "",
          customerId: c.id,
        }));

        if (!cancelled) setCustomers(mapped);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, location]);

  const columns = React.useMemo<ColumnDef<CustomerOption>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "First Name",
        enableSorting: true,
        filter: {
          type: "string",
        },
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
        enableSorting: true,
        filter: {
          type: "string",
        },
      },
      {
        accessorKey: "email",
        header: "E-mail",
        enableSorting: true,
        filter: {
          type: "string",
        },
      },
      {
        accessorKey: "students",
        header: "student",
        enableSorting: false,
        filter: {
          type: "string",
        },
      },
    ],
    []
  );

  /**
   * Helper function to safely extract string filter values from column filters
   */
  const getFilterValue = React.useCallback((key: string): string => {
    const value = columnFilters[key];
    return typeof value === 'string' ? value : '';
  }, [columnFilters]);

  const handleColumnFilterChange = React.useCallback(
    (columnId: string, value: unknown) => {
      setColumnFilters((prev) => ({
        ...prev,
        [columnId]: value,
      }));
    },
    []
  );

  // Filter customers based on column filters
  const filteredCustomers = React.useMemo(() => {
    // Handle empty customer list
    if (!customers || customers.length === 0) {
      return [];
    }

    let filtered = customers.filter((customer) => {
      const firstNameFilter = getFilterValue('firstName');
      const lastNameFilter = getFilterValue('lastName');
      const emailFilter = getFilterValue('email');
      const studentsFilter = getFilterValue('students');

      const matchesFirstName =
        !firstNameFilter.trim() ||
        (customer.firstName?.toLowerCase() || '').includes(firstNameFilter.toLowerCase());
      
      const matchesLastName =
        !lastNameFilter.trim() ||
        (customer.lastName?.toLowerCase() || '').includes(lastNameFilter.toLowerCase());

      const matchesEmail =
        !emailFilter.trim() ||
        (customer.email?.toLowerCase() || '').includes(emailFilter.toLowerCase());

      const matchesStudents =
        !studentsFilter.trim() ||
        (customer.students?.toLowerCase() || '').includes(studentsFilter.toLowerCase());

      return matchesFirstName && matchesLastName && matchesEmail && matchesStudents;
    });

    // Apply sorting
    if (sorting.length > 0) {
      const sort = sorting[0];
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sort.id as keyof CustomerOption] || "";
        const bValue = b[sort.id as keyof CustomerOption] || "";
        
        const comparison = String(aValue).localeCompare(String(bValue));
        return sort.desc ? -comparison : comparison;
      });
    }

    return filtered;
  }, [customers, sorting, getFilterValue]);

  const handleRowClick = React.useCallback(
    (customer: CustomerOption) => {
      onSelect(customer);
      onClose();
    },
    [onSelect, onClose]
  );

  // Reset filters when modal closes
  React.useEffect(() => {
    if (!open) {
      setColumnFilters({});
      setSorting([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle id="choose-customer-modal-title" className="text-lg font-semibold">
            Choose Customer
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden px-6 py-4">
          <CustomTable
            data={filteredCustomers}
            columns={columns}
            isLoading={isLoading}
            size="compact"
            variant="default"
            stickyHeader={true}
            maxHeight="calc(90vh - 200px)"
            enableSearch={false}
            enableFilter={false}
            enablePrint={false}
            enableExport={false}
            enableColumnFilters={true}
            onColumnFilterChange={handleColumnFilterChange}
            columnFilters={columnFilters}
            columnFilterPlaceholders={{
              firstName: "Search...",
              lastName: "Search...",
              email: "Search...",
              students: "Search...",
            }}
            enableSorting={true}
            manualSorting={false}
            sorting={sorting}
            onSortingChange={setSorting}
            hideRecordCount={true}
            onRowClick={handleRowClick}
            rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            customEmptyState="No customers found"
          />
        </div>
        <DialogFooter className="px-6 py-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

