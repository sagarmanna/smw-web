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
import { mockInvoiceData } from "../../../mockData/invoiceMockData";

interface CustomerOption {
  firstName: string;
  lastName: string;
  email: string;
  students: string;
  customerId?: number;
  phone?: string;
}

interface ChooseCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: CustomerOption) => void;
  currentCustomerId?: number;
}

/**
 * Generates a list of unique customers from mock invoice data.
 * Groups invoices by customer name and aggregates their students.
 * 
 * @returns An array of unique customer options with aggregated student information
 */
function generateCustomerList(): CustomerOption[] {
  const customerMap = new Map<string, CustomerOption>();
  let customerIdCounter = 1;

  // Handle empty or invalid mock data
  if (!mockInvoiceData || mockInvoiceData.length === 0) {
    return [];
  }

  mockInvoiceData.forEach((invoice) => {
    const customerName = invoice.customer?.trim();
    if (!customerName) return;

    // Parse name into first and last name
    const nameParts = customerName.split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Generate email if not available
    const email = `${customerName.toLowerCase().replace(/\s+/g, "")}@example.com`;

    // Use customer name as key to group by customer
    const key = customerName.toLowerCase();
    
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        firstName,
        lastName,
        email,
        students: invoice.student || "",
        customerId: customerIdCounter++,
        phone: invoice.phone || "",
      });
    } else {
      // Append student if customer already exists
      const existing = customerMap.get(key);
      if (existing) {
        if (existing.students && invoice.student && !existing.students.includes(invoice.student)) {
          existing.students = `${existing.students}, ${invoice.student}`;
        } else if (!existing.students && invoice.student) {
          existing.students = invoice.student;
        }
      }
    }
  });

  return Array.from(customerMap.values());
}

export function ChooseCustomerModal({
  open,
  onClose,
  onSelect,
}: ChooseCustomerModalProps) {
  const [customers] = React.useState<CustomerOption[]>(() => generateCustomerList());
  const [columnFilters, setColumnFilters] = React.useState<Record<string, unknown>>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);

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

