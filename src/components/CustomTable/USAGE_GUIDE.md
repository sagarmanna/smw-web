# CustomTable Component - Usage Guide

## Overview
The `CustomTable` component is a highly reusable, customizable table component built with `@tanstack/react-table`. It supports various features like sorting, filtering, pagination, export, search, and more.

## Table of Contents
1. [Basic Usage](#basic-usage)
2. [Size Variants](#size-variants)
3. [Visual Variants](#visual-variants)
4. [Features Configuration](#features-configuration)
5. [Advanced Examples](#advanced-examples)
6. [Props Reference](#props-reference)

---

## Basic Usage

### Minimal Example
```tsx
import { CustomTable } from "@/components/CustomTable";

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
];

const data = [
  { name: "John Doe", email: "john@example.com", role: "Admin" },
  { name: "Jane Smith", email: "jane@example.com", role: "User" },
];

function MyTable() {
  return <CustomTable data={data} columns={columns} />;
}
```

---

## Size Variants

The table supports three size variants:

### Compact (Default)
Best for dashboards with limited space or tables with many rows.
```tsx
<CustomTable
  data={data}
  columns={columns}
  size="compact" // Smallest padding and text
/>
```

### Normal
Balanced size for most use cases.
```tsx
<CustomTable
  data={data}
  columns={columns}
  size="normal" // Medium padding and text
/>
```

### Comfortable
Spacious layout for better readability.
```tsx
<CustomTable
  data={data}
  columns={columns}
  size="comfortable" // Largest padding and text
/>
```

---

## Visual Variants

### Default
Standard appearance with hover effects.
```tsx
<CustomTable
  data={data}
  columns={columns}
  variant="default"
/>
```

### Striped
Alternating row colors for better readability.
```tsx
<CustomTable
  data={data}
  columns={columns}
  variant="striped"
/>
```

### Bordered
Additional borders (combine with className if needed).
```tsx
<CustomTable
  data={data}
  columns={columns}
  variant="bordered"
  className="border-2"
/>
```

---

## Features Configuration

### 1. Search
Enable client-side search functionality.
```tsx
<CustomTable
  data={data}
  columns={columns}
  enableSearch={true}
  searchPlaceholder="Search customers..."
  getSearchValue={(row) => `${row.name} ${row.email}`}
/>
```

### 2. Filtering

#### Client-Side Filters (Checkboxes)
```tsx
const [showActive, setShowActive] = useState(true);

<CustomTable
  data={data}
  columns={columns}
  enableFilter={true}
  filterOptions={[
    {
      key: "active",
      label: "Show Active",
      checked: showActive,
      onToggle: setShowActive,
      predicate: (row) => row.status === "active",
    },
  ]}
/>
```

#### Server-Side Filters (Radio-style)
```tsx
const [activeFilter, setActiveFilter] = useState<string | undefined>();

<CustomTable
  data={data}
  columns={columns}
  enableFilter={true}
  serverSideFilterOptions={[
    { key: "active", label: "Active Customers" },
    { key: "inactive", label: "Inactive Customers" },
  ]}
  activeServerSideFilter={activeFilter}
  onServerSideFilterChange={setActiveFilter}
/>
```

### 3. Column-Level Filtering
Enable individual column filters (date pickers, text inputs, dropdowns, etc.).

#### Basic Setup
```tsx
// 1. Define columns with filter configuration
const columns = [
  { 
    accessorKey: "name", 
    header: "Name" 
  },
  { 
    accessorKey: "date", 
    header: "Date",
    filter: { 
      type: "date", 
      initialValue: new Date(),
      disabled: (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today; // Disable past dates
      }
    }
  },
  { 
    accessorKey: "status", 
    header: "Status",
    filter: { 
      type: "dropdown", 
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" }
      ]
    }
  },
  { 
    accessorKey: "description", 
    header: "Description",
    filter: { 
      type: "string" 
    }
  }
];

// 2. Enable column filters and provide handler
const [columnFilters, setColumnFilters] = useState({});

const handleColumnFilterChange = (columnKey, filterValue) => {
  setColumnFilters(prev => ({
    ...prev,
    [columnKey]: filterValue
  }));
  
  // Optional: Trigger API calls for specific columns
  if (columnKey === 'date' && filterValue) {
    // Fetch data for the selected date
    fetchDataForDate(filterValue);
  }
};

// 3. Use in CustomTable
<CustomTable
  data={data}
  columns={columns}
  enableColumnFilters={true}
  onColumnFilterChange={handleColumnFilterChange}
  columnFilters={columnFilters}
/>
```

#### Filter Types
- **`date`**: Date picker with calendar popup (displays in yyyy-MM-dd format)
- **`date-range`**: Date range picker (currently implemented as single date)
- **`string`**: Text input for string filtering
- **`dropdown`**: Dropdown with predefined options

#### Date Filter Options
- **`initialValue`**: Default date value (e.g., `new Date()` for today)
- **`disabled`**: Function to disable specific dates (e.g., disable past dates for future-only data)

```tsx
// Example: Disable past dates (only allow today and future)
filter: {
  type: "date",
  initialValue: new Date(),
  disabled: (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today; // Disable past dates
  }
}
```

#### External State Management
For better control and API integration, manage column filter state externally:

```tsx
const [columnFilters, setColumnFilters] = useState({
  date: new Date(),
  status: 'active'
});

<CustomTable
  data={data}
  columns={columns}
  enableColumnFilters={true}
  onColumnFilterChange={handleColumnFilterChange}
  columnFilters={columnFilters} // External state
/>
```

### 4. Export
Enable data export in multiple formats.
```tsx
<CustomTable
  data={data}
  columns={columns}
  enableExport={true}
  onExport={{
    csv: (data) => {
      // Export as CSV
      const csv = convertToCSV(data);
      downloadFile(csv, "data.csv");
    },
    excel: (data) => {
      // Export as Excel
    },
    pdf: (data) => {
      // Export as PDF
    },
  }}
/>
```

### 4. Pagination
Configure pagination settings.
```tsx
<CustomTable
  data={data}
  columns={columns}
  enablePagination={true}
  pageSize={20}
  showPageSizeOptions={true}
  pageSizeOptions={[10, 20, 50, 100]}
/>
```

### 5. Rows Per Page Selector
Enable rows per page selector in the table header (appears before filter icon).
```tsx
<CustomTable
  data={data}
  columns={columns}
  enableRowsPerPage={true}
  initialRowsPerPage={20}
  rowsPerPageOptions={[5, 10, 20, 50, 100]}
  onRowsPerPageChange={(newRowsPerPage) => {
    // Handle rows per page change (e.g., trigger API call)
    // "All" option sends -1, handle it appropriately
    const actualLimit = newRowsPerPage === -1 ? 999999 : newRowsPerPage;
    fetchData(1, actualLimit);
  }}
/>
```

**Features:**
- Shows current selection in button (e.g., "20" or "All")
- Includes "All" option to show all records
- Automatically handles large datasets with "All" selection

### 6. Server-Side Pagination
Use server-side pagination for large datasets that are fetched from the server.
```tsx
<CustomTable
  data={data}
  columns={columns}
  serverSidePagination={{
    page: 1,
    limit: 20,
    total: 1000,
    totalPages: 50
  }}
  onServerSidePageChange={(page) => {
    // Handle page change - fetch new data from server
    fetchData(page);
  }}
/>
```

**Features:**
- Server-controlled pagination for large datasets
- Shows "Showing X to Y of Z records" format with highlighted numbers
- Icon-based navigation buttons (First/Previous/Next/Last) with tooltips
- Consistent styling with subtle background and proper spacing
- Automatically disables when only one page
- Integrates with existing table features

### 7. Column Grouping
Group related columns with a header.
```tsx
<CustomTable
  data={data}
  columns={columns}
  columnGroups={[
    {
      label: "Outstanding Invoices",
      columnKeys: ["aging_0_30", "aging_31_60", "aging_61_90", "aging_90_plus"],
    },
    {
      label: "Payment Info",
      columnKeys: ["prePaid", "credits", "balance"],
    },
  ]}
/>
```

### 7. Date Range Picker
Add date range filtering.
```tsx
const [dateRange, setDateRange] = useState({ 
  from: new Date(), 
  to: new Date() 
});

<CustomTable
  data={data}
  columns={columns}
  enableDateRangePicker={true}
  dateRange={dateRange}
  onDateRangeChange={setDateRange}
/>
```

### 8. Loading State
Show loading indicator while fetching data.
```tsx
<CustomTable
  data={data}
  columns={columns}
  isLoading={isLoadingData}
  customLoadingState={
    <div className="flex items-center gap-2">
      <Spinner />
      <span>Fetching data...</span>
    </div>
  }
/>
```

### 9. Empty State
Customize the empty state message.
```tsx
<CustomTable
  data={data}
  columns={columns}
  customEmptyState={
    <div className="text-center py-8">
      <p>No customers found</p>
      <button onClick={handleAddNew}>Add New Customer</button>
    </div>
  }
/>
```

### 10. Sticky Header
Keep header visible while scrolling.
```tsx
<CustomTable
  data={data}
  columns={columns}
  stickyHeader={true}
  maxHeight="500px" // Set max height for scrolling
/>
```

### 11. Footer Row
Add a footer row with totals or summary data. The CustomTable automatically handles footer styling.
```tsx
const footerData = {
  name: "TOTALS",
  amount: 15000,
  count: 25,
};

<CustomTable
  data={data}
  columns={columns}
  footerRow={footerData} // Optional footer row
/>
```

**Smart Footer Handling:**
- Footer rows automatically get `id: -1` for identification
- Footer styling (bold, background) is applied automatically
- No need to check `isFooter` in column cell renderers
- Works with any column cell renderer

### 12. Custom Styling
Apply custom classes to table elements.
```tsx
<CustomTable
  data={data}
  columns={columns}
  className="shadow-lg" // Card wrapper class
  headerClassName="bg-blue-100" // Header row class
  rowClassName={(row) => 
    row.status === "overdue" ? "bg-red-50" : ""
  } // Conditional row styling
/>
```

---

## Advanced Examples

### Complete Example: Account Receivable Report
```tsx
function AccountReceivableReport() {
  const [data, setData] = useState<AccountReceivableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | undefined>();

  const columns = [
    { accessorKey: "customerName", header: "Customer Name" },
    { accessorKey: "aging_0_30", header: "0-30" },
    { accessorKey: "aging_31_60", header: "31-60" },
    { accessorKey: "aging_61_90", header: "61-90" },
    { accessorKey: "aging_90_plus", header: "90+" },
    { accessorKey: "total", header: "Total" },
  ];

  return (
    <CustomTable
      data={data}
      columns={columns}
      
      // Visual
      size="compact"
      variant="striped"
      title="Accounts Receivable"
      
      // Features
      enableExport={true}
      enableFilter={true}
      enablePrint={true}
      enablePagination={false}
      
      // Loading
      isLoading={isLoading}
      
      // Column Groups
      columnGroups={[
        {
          label: "Outstanding Invoices",
          columnKeys: ["aging_0_30", "aging_31_60", "aging_61_90", "aging_90_plus", "total"],
        },
      ]}
      
      // Server-side filter
      serverSideFilterOptions={[
        { key: "active", label: "Active Customers" },
        { key: "inactive", label: "Inactive Customers" },
      ]}
      activeServerSideFilter={activeFilter}
      onServerSideFilterChange={setActiveFilter}
      
      // Export
      onExport={{
        csv: exportToCSV,
        excel: exportToExcel,
        pdf: exportToPDF,
      }}
      
      // Custom styling
      rowClassName={(row) => 
        row.id === -1 ? "font-bold bg-muted" : "" // Highlight footer row
      }
    />
  );
}
```

### Example: User Management Table
```tsx
function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "status", header: "Status" },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(row.original)}>Edit</button>
          <button onClick={() => handleDelete(row.original)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <CustomTable
      data={users}
      columns={columns}
      
      // Visual
      size="normal"
      title="User Management"
      
      // Features
      enableSearch={true}
      enablePagination={true}
      enableFilter={true}
      
      // Search
      searchPlaceholder="Search users..."
      getSearchValue={(row) => `${row.name} ${row.email} ${row.role}`}
      
      // Pagination
      pageSize={10}
      
      // Conditional row styling
      rowClassName={(row) => 
        row.status === "inactive" ? "opacity-50" : ""
      }
    />
  );
}
```

### Example: Compact Dashboard Table
```tsx
function DashboardSummary() {
  const [data, setData] = useState<SummaryRow[]>([]);

  const columns = [
    { accessorKey: "metric", header: "Metric" },
    { accessorKey: "value", header: "Value" },
    { accessorKey: "change", header: "Change" },
  ];

  return (
    <CustomTable
      data={data}
      columns={columns}
      
      // Visual - Compact for dashboard
      size="compact"
      maxHeight="300px"
      stickyHeader={true}
      
      // No features needed
      enablePagination={false}
      enableSearch={false}
      enableExport={false}
      
      // Custom styling
      className="shadow-sm"
      rowClassName={(row) => 
        row.change > 0 ? "text-green-600" : row.change < 0 ? "text-red-600" : ""
      }
    />
  );
}
```

---

## Props Reference

### Visual Configuration
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `"compact" \| "normal" \| "comfortable"` | `"compact"` | Table size/density |
| `variant` | `"default" \| "bordered" \| "striped"` | `"default"` | Visual style |
| `stickyHeader` | `boolean` | `false` | Keep header visible on scroll |
| `maxHeight` | `string` | `undefined` | Max height (e.g., "500px") |
| `className` | `string` | `undefined` | Custom class for card wrapper |
| `headerClassName` | `string` | `undefined` | Custom class for header |
| `rowClassName` | `string \| (row) => string` | `undefined` | Custom class for rows |

### Feature Flags
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableSearch` | `boolean` | `false` | Enable client-side search |
| `enableExport` | `boolean` | `false` | Enable export functionality |
| `enableFilter` | `boolean` | `false` | Enable filtering |
| `enablePagination` | `boolean` | `true` | Enable pagination |
| `enablePrint` | `boolean` | `true` | Enable print functionality |
| `enableShowAll` | `boolean` | `true` | Enable show all toggle |
| `enableSorting` | `boolean` | `true` | Enable column sorting |
| `enableDateRangePicker` | `boolean` | `false` | Enable date range picker |
| `enableRowsPerPage` | `boolean` | `false` | Enable rows per page selector |

### Data & Loading
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | **required** | Table data |
| `columns` | `ColumnDef[]` | **required** | Column definitions |
| `footerRow` | `TData` | `undefined` | Optional footer row data |
| `isLoading` | `boolean` | `false` | Show loading state |
| `customLoadingState` | `ReactNode` | Default spinner | Custom loading component |
| `customEmptyState` | `ReactNode` | "No results." | Custom empty state |

### Column Configuration
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columnGroups` | `ColumnGroup[]` | `undefined` | Group columns with headers |

### Export Configuration
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onExport` | `object` | `undefined` | Export handlers (csv, excel, pdf, etc.) |

### Filter Configuration
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filterOptions` | `FilterOption[]` | `undefined` | Client-side filter options |
| `serverSideFilterOptions` | `ServerSideFilterOption[]` | `undefined` | Server-side filter options |
| `activeServerSideFilter` | `string` | `undefined` | Active server filter key |
| `onServerSideFilterChange` | `(key) => void` | `undefined` | Server filter change handler |

### Rows Per Page Configuration
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialRowsPerPage` | `number` | `20` | Initial rows per page |
| `rowsPerPageOptions` | `number[]` | `[5, 10, 20, 50, 100]` | Available options |
| `onRowsPerPageChange` | `(rowsPerPage: number) => void` | `undefined` | Change handler |

---

## Best Practices

### 1. Choose the Right Size
- **Compact**: Dashboards, overview tables, many rows
- **Normal**: General-purpose tables
- **Comfortable**: Detail views, forms, fewer rows

### 2. Use Server-Side Features for Large Datasets
For datasets with 1000+ rows, implement server-side:
- Pagination
- Filtering
- Sorting
- Search

### 3. Optimize Column Definitions
```tsx
// ✅ Good: Memoized columns
const columns = React.useMemo(() => [...], []);

// ❌ Bad: Columns recreated every render
const columns = [...];
```

### 4. Custom Cell Rendering
```tsx
const columns = [
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
];
```

### 5. Responsive Design
The table automatically handles responsive design with horizontal scroll on mobile.

---

## Support
For issues or questions, please refer to the main documentation or contact the development team.

