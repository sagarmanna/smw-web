// Example usage of CustomTable with different feature configurations

import { CustomTable } from "./index";

// Example 1: Basic table with minimal features
export function BasicTableExample() {
  const data = [
    { id: "1", name: "John", email: "john@example.com" },
    { id: "2", name: "Jane", email: "jane@example.com" },
  ];

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
  ];

  return (
    <CustomTable
      data={data}
      columns={columns}
      title="Basic Table"
      enableSearch={false}
      enableExport={false}
      enableFilter={false}
      enablePrint={false}
      enableShowAll={false}
    />
  );
}

// Example 2: Full-featured table
export function FullFeaturedTableExample() {
  const data = [
    { id: "1", name: "John", email: "john@example.com", status: "Active" },
    { id: "2", name: "Jane", email: "jane@example.com", status: "Inactive" },
  ];

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "status", header: "Status" },
  ];

  return (
    <CustomTable
      data={data}
      columns={columns}
      title="Full Featured Table"
      
      // Enable all features
      enableSearch={true}
      enableExport={true}
      enableFilter={true}
      enablePrint={true}
      enableShowAll={true}
      
      // Search configuration
      searchPlaceholder="Search users..."
      getSearchValue={(row) => `${row.name} ${row.email}`}
      
      // Filter configuration
      filterOptions={[
        { key: 'active', label: 'Active Users', predicate: (row) => row.status === 'Active' },
        { key: 'inactive', label: 'Inactive Users', predicate: (row) => row.status === 'Inactive' },
      ]}
      
      // Export configuration
      onExport={{
        csv: (data) => console.log('Export CSV:', data),
        json: (data) => console.log('Export JSON:', data),
      }}
      
      // Pagination configuration (removed - using server-side only)
    />
  );
}

// Example 3: Read-only table (no interactions)
export function ReadOnlyTableExample() {
  const data = [
    { id: "1", product: "Laptop", price: "$999" },
    { id: "2", product: "Mouse", price: "$29" },
  ];

  const columns = [
    { accessorKey: "product", header: "Product" },
    { accessorKey: "price", header: "Price" },
  ];

  return (
    <CustomTable
      data={data}
      columns={columns}
      title="Product List"
      
      // Disable all interactive features
      enableSearch={false}
      enableExport={false}
      enableFilter={false}
      enablePrint={false}
      enableShowAll={false}
    />
  );
}

// Example 4: Export-only table
export function ExportOnlyTableExample() {
  const data = [
    { id: "1", report: "Sales Report", date: "2024-01-01" },
    { id: "2", report: "Inventory Report", date: "2024-01-02" },
  ];

  const columns = [
    { accessorKey: "report", header: "Report" },
    { accessorKey: "date", header: "Date" },
  ];

  return (
    <CustomTable
      data={data}
      columns={columns}
      title="Reports"
      
      // Only enable export and print
      enableSearch={false}
      enableExport={true}
      enableFilter={false}
      enablePrint={true}
      enableShowAll={false}
      
      onExport={{
        pdf: (data) => console.log('Export PDF:', data),
        excel: (data) => console.log('Export Excel:', data),
      }}
    />
  );
}
