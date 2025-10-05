/**
 * CustomTable Component Templates
 * 
 * Ready-to-use templates for common table patterns.
 * Copy and modify these templates for your specific use case.
 */

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";

// =============================================================================
// TEMPLATE 1: Simple Data Table
// Use case: Basic data display with pagination
// =============================================================================

interface SimpleDataRow {
  id: number;
  name: string;
  email: string;
  status: string;
}

export function SimpleDataTableTemplate() {
  const [data, setData] = React.useState<SimpleDataRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const columns: ColumnDef<SimpleDataRow>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "status", header: "Status" },
  ];

  React.useEffect(() => {
    // Fetch data
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Replace with your API call
      const response = await fetch("/api/data");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Data Table</h1>
      <CustomTable
        data={data}
        columns={columns}
        size="compact"
        enableRowsPerPage={true}
        isLoading={isLoading}
        initialRowsPerPage={20}
        onRowsPerPageChange={(newRowsPerPage) => {
          // Handle rows per page change
          console.log("Rows per page changed to:", newRowsPerPage);
        }}
      />
    </div>
  );
}

// =============================================================================
// TEMPLATE 2: Table with Search and Export
// Use case: Tables where users need to search and export data
// =============================================================================

interface SearchableRow {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  status: string;
}

export function SearchableTableTemplate() {
  const [data] = React.useState<SearchableRow[]>([]);

  const columns: ColumnDef<SearchableRow>[] = [
    { accessorKey: "customerName", header: "Customer Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "status", header: "Status" },
  ];

  const exportToCSV = (data: SearchableRow[]) => {
    const headers = ["Customer Name", "Email", "Phone", "Status"];
    const rows = data.map((row) => [
      row.customerName,
      row.email,
      row.phone,
      row.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "customers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CustomTable
      data={data}
      columns={columns}
      size="compact"
      enableSearch={true}
      enableExport={true}
      searchPlaceholder="Search customers..."
      getSearchValue={(row) => `${row.customerName} ${row.email} ${row.phone}`}
      onExport={{
        csv: exportToCSV,
      }}
    />
  );
}

// =============================================================================
// TEMPLATE 3: Server-Side Pagination & Filtering
// Use case: Large datasets requiring server-side operations
// =============================================================================

interface ServerSideRow {
  id: number;
  name: string;
  status: string;
  amount: number;
}

export function ServerSideTableTemplate() {
  const [data, setData] = React.useState<ServerSideRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<string | undefined>();
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  const columns: ColumnDef<ServerSideRow>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "status", header: "Status" },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => `$${row.original.amount.toFixed(2)}`,
    },
  ];

  const fetchData = React.useCallback(
    async (page: number, limit: number, filter?: string) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(filter && { status: filter }),
        });
        const response = await fetch(`/api/data?${params}`);
        const result = await response.json();
        setData(result.data);
        setPagination({
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchData(1, 20);
  }, [fetchData]);

  const handleFilterChange = (filterKey: string | undefined) => {
    setActiveFilter(filterKey);
    fetchData(1, pagination.limit, filterKey);
  };

  const handlePageChange = (page: number) => {
    fetchData(page, pagination.limit, activeFilter);
  };

  return (
    <div>
      <CustomTable
        data={data}
        columns={columns}
        size="compact"
        enableFilter={true}
        // Using custom pagination
        isLoading={isLoading}
        serverSideFilterOptions={[
          { key: "active", label: "Active" },
          { key: "inactive", label: "Inactive" },
          { key: "pending", label: "Pending" },
        ]}
        activeServerSideFilter={activeFilter}
        onServerSideFilterChange={handleFilterChange}
      />

      {/* Custom Server-Side Pagination */}
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="text-sm text-muted-foreground">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
          {pagination.total} records
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={
              pagination.page * pagination.limit >= pagination.total
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TEMPLATE 4: Grouped Columns Table
// Use case: Financial reports, analytics with related columns
// =============================================================================

interface GroupedColumnsRow {
  id: number;
  product: string;
  q1Sales: number;
  q2Sales: number;
  q3Sales: number;
  q4Sales: number;
  totalSales: number;
}

export function GroupedColumnsTableTemplate() {
  const [data] = React.useState<GroupedColumnsRow[]>([]);

  const columns: ColumnDef<GroupedColumnsRow>[] = [
    { accessorKey: "product", header: "Product" },
    {
      accessorKey: "q1Sales",
      header: "Q1",
      cell: ({ row }) => `$${row.original.q1Sales.toLocaleString()}`,
    },
    {
      accessorKey: "q2Sales",
      header: "Q2",
      cell: ({ row }) => `$${row.original.q2Sales.toLocaleString()}`,
    },
    {
      accessorKey: "q3Sales",
      header: "Q3",
      cell: ({ row }) => `$${row.original.q3Sales.toLocaleString()}`,
    },
    {
      accessorKey: "q4Sales",
      header: "Q4",
      cell: ({ row }) => `$${row.original.q4Sales.toLocaleString()}`,
    },
    {
      accessorKey: "totalSales",
      header: "Total",
      cell: ({ row }) => `$${row.original.totalSales.toLocaleString()}`,
    },
  ];

  return (
    <CustomTable
      data={data}
      columns={columns}
      size="compact"
      columnGroups={[
        {
          label: "Quarterly Sales",
          columnKeys: ["q1Sales", "q2Sales", "q3Sales", "q4Sales"],
        },
      ]}
      enableExport={true}
      enablePrint={true}
    />
  );
}

// =============================================================================
// TEMPLATE 5: Compact Dashboard Table
// Use case: Summary tables in dashboards
// =============================================================================

interface DashboardRow {
  metric: string;
  value: string;
  change: number;
}

export function CompactDashboardTableTemplate() {
  const data: DashboardRow[] = [
    { metric: "Total Revenue", value: "$125,430", change: 12.5 },
    { metric: "Active Users", value: "1,243", change: -5.2 },
    { metric: "Conversion Rate", value: "3.24%", change: 0.8 },
  ];

  const columns: ColumnDef<DashboardRow>[] = [
    { accessorKey: "metric", header: "Metric" },
    { accessorKey: "value", header: "Value" },
    {
      accessorKey: "change",
      header: "Change",
      cell: ({ row }) => {
        const change = row.original.change;
        const color = change > 0 ? "text-green-600" : "text-red-600";
        return (
          <span className={color}>
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        );
      },
    },
  ];

  return (
    <CustomTable
      data={data}
      columns={columns}
      size="compact"
      maxHeight="300px"
      stickyHeader={true}
      enableSearch={false}
      enableExport={false}
      variant="striped"
    />
  );
}

// =============================================================================
// TEMPLATE 6: Table with Custom Actions
// Use case: User management, admin panels
// =============================================================================

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export function TableWithActionsTemplate() {
  const [data] = React.useState<UserRow[]>([]);

  const handleEdit = (user: UserRow) => {
    console.log("Edit user:", user);
    // Implement edit logic
  };

  const handleDelete = (user: UserRow) => {
    console.log("Delete user:", user);
    // Implement delete logic
  };

  const columns: ColumnDef<UserRow>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "status", header: "Status" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row.original)}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <CustomTable
      data={data}
      columns={columns}
      size="normal"
      enableSearch={true}
      searchPlaceholder="Search users..."
      getSearchValue={(row) => `${row.name} ${row.email} ${row.role}`}
      rowClassName={(row) => (row.status === "inactive" ? "opacity-50" : "")}
    />
  );
}

// =============================================================================
// TEMPLATE 7: Table with Date Range Filter
// Use case: Reports, analytics with time-based data
// =============================================================================

interface TimeBasedRow {
  id: number;
  date: string;
  orders: number;
  revenue: number;
}

export function DateRangeTableTemplate() {
  const [data] = React.useState<TimeBasedRow[]>([]);
  const [dateRange, setDateRange] = React.useState({
    from: new Date(),
    to: new Date(),
  });

  const columns: ColumnDef<TimeBasedRow>[] = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "orders", header: "Orders" },
    {
      accessorKey: "revenue",
      header: "Revenue",
      cell: ({ row }) => `$${row.original.revenue.toLocaleString()}`,
    },
  ];

  React.useEffect(() => {
    // Fetch data based on date range
    fetchDataForDateRange(dateRange.from, dateRange.to);
  }, [dateRange]);

  const fetchDataForDateRange = async (from: Date, to: Date) => {
    // Implement API call with date range
    console.log("Fetching data from", from, "to", to);
  };

  return (
    <CustomTable
      data={data}
      columns={columns}
      size="compact"
      enableDateRangePicker={true}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      enableExport={true}
      enablePrint={true}
    />
  );
}

