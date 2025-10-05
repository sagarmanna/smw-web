# CustomTable Component

A highly reusable, feature-rich table component built with `@tanstack/react-table` and Tailwind CSS.

## 🎯 Key Features

- ✅ **Multiple Size Variants** - Compact, Normal, Comfortable
- ✅ **Visual Variants** - Default, Bordered, Striped
- ✅ **Responsive Design** - Mobile-first with horizontal scroll
- ✅ **Search** - Client-side search with custom predicates
- ✅ **Filtering** - Client-side and server-side filtering
- ✅ **Sorting** - Built-in column sorting
- ✅ **Pagination** - Client-side and server-side pagination
- ✅ **Export** - CSV, Excel, PDF, HTML, JSON, Text
- ✅ **Print** - Print-optimized layouts
- ✅ **Column Grouping** - Multi-tier column headers
- ✅ **Date Range Picker** - Built-in date filtering
- ✅ **Loading States** - Customizable loading indicators
- ✅ **Empty States** - Customizable empty messages
- ✅ **Sticky Headers** - Keep headers visible on scroll
- ✅ **Custom Styling** - Row-level and cell-level customization
- ✅ **Dark Mode** - Full dark mode support

## 📁 Files

- `index.tsx` - Main component implementation
- `USAGE_GUIDE.md` - Comprehensive usage documentation
- `TEMPLATES.tsx` - Ready-to-use templates for common patterns
- `README.md` - This file

## 🚀 Quick Start

### Basic Usage

```tsx
import { CustomTable } from "@/components/CustomTable";

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
];

const data = [
  { name: "John Doe", email: "john@example.com" },
  { name: "Jane Smith", email: "jane@example.com" },
];

function MyTable() {
  return (
    <CustomTable 
      data={data} 
      columns={columns}
      size="compact" // Default size
    />
  );
}
```

### Advanced Usage

```tsx
<CustomTable
  data={data}
  columns={columns}
  
  // Visual
  size="compact"
  variant="striped"
  stickyHeader={true}
  maxHeight="600px"
  
  // Features
  enableSearch={true}
  enableFilter={true}
  enableExport={true}
  enablePrint={true}
  enablePagination={true}
  
  // Search
  searchPlaceholder="Search..."
  getSearchValue={(row) => `${row.name} ${row.email}`}
  
  // Server-side filters
  serverSideFilterOptions={[
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ]}
  activeServerSideFilter={activeFilter}
  onServerSideFilterChange={setActiveFilter}
  
  // Column groups
  columnGroups={[
    {
      label: "User Information",
      columnKeys: ["name", "email", "phone"],
    },
  ]}
  
  // Export
  onExport={{
    csv: (data) => exportToCSV(data),
    excel: (data) => exportToExcel(data),
  }}
  
  // Loading
  isLoading={isLoading}
  
  // Custom styling
  rowClassName={(row) => 
    row.status === "active" ? "bg-green-50" : ""
  }
/>
```

## 📖 Documentation

### Complete Guide
See [USAGE_GUIDE.md](./USAGE_GUIDE.md) for:
- Detailed prop documentation
- Feature configuration examples
- Best practices
- Responsive design patterns

### Templates
See [TEMPLATES.tsx](./TEMPLATES.tsx) for ready-to-use templates:
1. Simple Data Table
2. Searchable Table with Export
3. Server-Side Pagination & Filtering
4. Grouped Columns (Financial Reports)
5. Compact Dashboard Table
6. Table with Custom Actions
7. Date Range Filter Table

## 🎨 Size Variants

### Compact (Default)
**Best for:** Dashboards, overview tables, many rows
- Smallest padding and text
- Maximum data density
- Mobile-optimized

```tsx
<CustomTable data={data} columns={columns} size="compact" />
```

### Normal
**Best for:** General-purpose tables
- Balanced spacing
- Good for most use cases

```tsx
<CustomTable data={data} columns={columns} size="normal" />
```

### Comfortable
**Best for:** Detail views, fewer rows, accessibility
- Largest padding
- Best readability
- Spacious layout

```tsx
<CustomTable data={data} columns={columns} size="comfortable" />
```

## 🎭 Visual Variants

### Default
Standard appearance with hover effects

```tsx
<CustomTable data={data} columns={columns} variant="default" />
```

### Striped
Alternating row colors for better readability

```tsx
<CustomTable data={data} columns={columns} variant="striped" />
```

## 💡 Common Use Cases

### 1. Dashboard Summary Table
```tsx
<CustomTable
  data={summaryData}
  columns={columns}
  size="compact"
  maxHeight="300px"
  stickyHeader={true}
  enablePagination={false}
  variant="striped"
/>
```

### 2. Admin User Management
```tsx
<CustomTable
  data={users}
  columns={columnsWithActions}
  size="normal"
  enableSearch={true}
  enablePagination={true}
  enableFilter={true}
  searchPlaceholder="Search users..."
/>
```

### 3. Financial Report
```tsx
<CustomTable
  data={reportData}
  columns={columns}
  size="compact"
  columnGroups={[
    {
      label: "Q1-Q4 Sales",
      columnKeys: ["q1", "q2", "q3", "q4"],
    },
  ]}
  enableExport={true}
  enablePrint={true}
/>
```

### 4. Large Dataset (Server-Side)
```tsx
<CustomTable
  data={data}
  columns={columns}
  size="compact"
  enableFilter={true}
  enablePagination={false} // Using custom pagination
  isLoading={isLoading}
  serverSideFilterOptions={filterOptions}
  activeServerSideFilter={activeFilter}
  onServerSideFilterChange={handleFilterChange}
/>
```

## 🔧 Configuration Props

### Essential Props
| Prop | Type | Description |
|------|------|-------------|
| `data` | `TData[]` | Table data (required) |
| `columns` | `ColumnDef[]` | Column definitions (required) |
| `size` | `"compact" \| "normal" \| "comfortable"` | Table size |
| `variant` | `"default" \| "striped"` | Visual style |

### Feature Flags
| Prop | Default | Description |
|------|---------|-------------|
| `enableSearch` | `false` | Enable search |
| `enableExport` | `false` | Enable export |
| `enableFilter` | `false` | Enable filtering |
| `enablePagination` | `true` | Enable pagination |
| `enablePrint` | `true` | Enable print |
| `enableSorting` | `true` | Enable sorting |
| `enableDateRangePicker` | `false` | Enable date picker |

## 📱 Responsive Design

The table automatically handles responsive design:
- **Mobile (<640px)**: Horizontal scroll, stacked controls, smaller text
- **Tablet (640px-768px)**: Better spacing, side-by-side layouts
- **Desktop (>768px)**: Full layout, optimal spacing

## 🎯 Best Practices

### 1. Choose the Right Size
```tsx
// Dashboard/Overview → compact
<CustomTable size="compact" />

// General tables → normal
<CustomTable size="normal" />

// Detail views → comfortable
<CustomTable size="comfortable" />
```

### 2. Memoize Columns
```tsx
const columns = React.useMemo(() => [
  { accessorKey: "name", header: "Name" },
  // ...
], []);
```

### 3. Use Server-Side for Large Data
For 1000+ rows, implement:
- Server-side pagination
- Server-side filtering
- Server-side sorting

### 4. Custom Cell Formatting
```tsx
const columns = [
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
];
```

## 🔗 Integration Example

See the Account Receivable report for a complete real-world example:
```
src/app/[location]/report/account-receivable/AccountReceivableClient.tsx
```

## 🛠 Development

### Adding New Features
1. Add prop to `CustomTableProps` interface
2. Update function signature
3. Implement feature logic
4. Update documentation
5. Add template example

### Testing
Test the component with:
- Different data sizes (0, 1, 100, 1000+ rows)
- Different screen sizes (mobile, tablet, desktop)
- Different browsers
- Light and dark mode
- All feature combinations

## 📝 License

Part of the SMW project. Internal use only.

## 👥 Contributors

Development Team - SMW Project

## 📞 Support

For questions or issues:
1. Check [USAGE_GUIDE.md](./USAGE_GUIDE.md)
2. Review [TEMPLATES.tsx](./TEMPLATES.tsx)
3. Contact the development team

