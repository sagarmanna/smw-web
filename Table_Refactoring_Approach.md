# Table Refactoring Approach
## Clean Architecture for Multi-Feature Table Management

---

## 📋 **Table of Contents**

1. [Overview](#overview)
2. [Current Problems](#current-problems)
3. [Proposed Solution](#proposed-solution)
4. [Implementation Structure](#implementation-structure)
5. [Code Examples](#code-examples)
6. [Migration Strategy](#migration-strategy)
7. [Benefits](#benefits)
8. [Best Practices](#best-practices)

---

## 🎯 **Overview**

This document outlines a clean architecture approach for managing tables across multiple features in a React/Next.js application. The solution focuses on:

- **Per-feature configuration files** (`tableConfigs.ts`)
- **Mock data in API files** (`customers.api.ts`)
- **Reusable table components** (`TableCard.tsx`)
- **Clean separation of concerns**

---

## ⚠️ **Current Problems**

### **1. Monolithic Component**
```typescript
// CustomerDetailClient.tsx (821 lines)
- Multiple table data definitions
- Column configurations mixed with UI
- Business logic scattered throughout
- Difficult to maintain and test
```

### **2. Code Duplication**
```typescript
// Repeated across features
const invoiceColumns = [...]; // 50 lines
const paymentColumns = [...]; // 50 lines
// Same patterns in students, schedule, reports
```

### **3. Poor Maintainability**
- Changes require touching multiple files
- No centralized table behavior management
- Hard to add new features consistently

---

## 🚀 **Proposed Solution**

### **Architecture Principles**

1. **Single Responsibility**: Each file has one clear purpose
2. **Feature Isolation**: Each feature manages its own table configs
3. **Reusability**: Common components shared across features
4. **API Consistency**: Mock data follows same pattern as real API

---

## 📁 **Implementation Structure**

```
src/app/[location]/
├── customers/
│   ├── customers.api.ts          # Mock data + API calls
│   ├── tableConfigs.ts           # Table configurations
│   ├── components/
│   │   └── TableCard.tsx         # Reusable table wrapper
│   └── CustomerDetailClient.tsx  # Clean main component
├── students/
│   ├── students.api.ts           # Student-specific API
│   ├── tableConfigs.ts           # Student table configs
│   └── components/
│       └── TableCard.tsx         # Reusable table wrapper
└── schedule/
    ├── schedule.api.ts           # Schedule-specific API
    ├── tableConfigs.ts           # Schedule table configs
    └── components/
        └── TableCard.tsx         # Reusable table wrapper
```

---

## 💻 **Code Examples**

### **1. Table Configuration File**

```typescript
// customers/tableConfigs.ts
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatCurrency";

// Column definitions
export const invoiceColumns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("total"))}</div>
    ),
  },
  // ... more columns
];

// Table configurations
export const CUSTOMER_TABLE_CONFIGS = {
  invoices: {
    title: "Invoices",
    columns: invoiceColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  },
  payments: {
    title: "Payments",
    columns: paymentColumns,
    // ... other props
  },
};
```

### **2. API File with Mock Data**

```typescript
// customers.api.ts
export interface InvoiceData {
  id: string;
  date: string;
  status: string;
  total: number;
  balance: number;
}

export async function getCustomerInvoices(
  location: string,
  customerId: number
): Promise<InvoiceData[]> {
  const USE_MOCK = true;
  
  if (USE_MOCK) {
    return [
      { id: "I-92268", date: "Oct 09, 2025", status: "Owing", total: 32.50, balance: 32.50 },
      { id: "I-92031", date: "Oct 06, 2025", status: "Owing", total: 31.53, balance: 31.53 },
      // ... more mock data
    ];
  }
  
  // Future API call
  // const response = await apiClient.get(`/admin/v2/${location}/customers/${customerId}/invoices`);
  // return response.data;
}
```

### **3. Reusable Table Component (Multiple Tables Support)**

```typescript
// customers/components/TableCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomTable } from "@/components/CustomTable";
import { Plus } from "lucide-react";
import { CUSTOMER_TABLE_CONFIGS } from "../tableConfigs";

interface TableCardProps {
  tableId: keyof typeof CUSTOMER_TABLE_CONFIGS;
  data: any[];
  loading?: boolean;
  onAdd?: () => void;
  footerRow?: any;
}

export function TableCard({ tableId, data, loading, onAdd, footerRow }: TableCardProps) {
  const config = CUSTOMER_TABLE_CONFIGS[tableId];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">{config.title}</CardTitle>
        {onAdd && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <CustomTable
          data={data}
          columns={config.columns}
          footerRow={footerRow}
          size={config.size}
          variant={config.variant}
          enableSorting={config.enableSorting}
          enableExport={config.enableExport}
          enablePrint={config.enablePrint}
          enableSearch={config.enableSearch}
          enableFilter={config.enableFilter}
          enableRowsPerPage={config.enableRowsPerPage}
          className="border-0 w-full"
          isLoading={loading}
        />
      </CardContent>
    </Card>
  );
}
```

#### **How TableCard Handles Multiple Tables**

**TableCard is designed to handle MULTIPLE tables with different configurations:**

1. **Configuration-Based Approach**: Uses `tableId` to select the appropriate table configuration
2. **Single Component, Multiple Uses**: One component handles all table types
3. **Type Safety**: TypeScript ensures only valid table IDs are used
4. **Dynamic Rendering**: Renders different tables based on configuration

#### **TableCard Usage Examples**

```typescript
// Multiple tables in one component
<TableCard tableId="invoices" data={invoiceData} />
<TableCard tableId="payments" data={paymentData} />
<TableCard tableId="equipment" data={equipmentData} />
<TableCard tableId="lessons" data={lessonData} />

// Different features, same component
// In customers feature
<TableCard tableId="invoices" data={customerInvoices} />

// In students feature  
<TableCard tableId="progress" data={studentProgress} />

// In schedule feature
<TableCard tableId="appointments" data={appointments} />
```

#### **TableCard Benefits for Multiple Tables**

- ✅ **One Component**: Handles all table types
- ✅ **Configuration-Driven**: Different configs per table
- ✅ **Consistent UI**: Same look and feel across all tables
- ✅ **Easy to Add**: New tables just need new config
- ✅ **Type Safe**: Only valid table IDs allowed
- ✅ **Reusable**: Works across different features

### **4. Clean Main Component**

```typescript
// CustomerDetailClient.tsx (much cleaner)
import { getCustomerInvoices, getCustomerPayments } from "./customers.api";
import { TableCard } from "./components/TableCard";

export function CustomerDetailClient({ location, id }) {
  const [invoiceData, setInvoiceData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [invoices, payments] = await Promise.all([
        getCustomerInvoices(location, Number(id)),
        getCustomerPayments(location, Number(id))
      ]);
      setInvoiceData(invoices || []);
      setPaymentData(payments || []);
      setLoading(false);
    };
    loadData();
  }, [location, id]);

  return (
    <div className="space-y-4">
      {/* Existing breadcrumb, metrics, details cards */}
      
      {/* Tables section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <TableCard 
            tableId="invoices" 
            data={invoiceData} 
            loading={loading}
            onAdd={() => console.log('Add invoice')}
          />
        </div>
        
        <div className="space-y-4">
          <TableCard 
            tableId="payments" 
            data={paymentData} 
            loading={loading}
            onAdd={() => console.log('Add payment')}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 🔄 **Multiple Tables Implementation Details**

### **1. Table Configuration Structure**

```typescript
// customers/tableConfigs.ts
export const CUSTOMER_TABLE_CONFIGS = {
  // Invoice table configuration
  invoices: {
    title: "Invoices",
    columns: invoiceColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  },
  
  // Payment table configuration
  payments: {
    title: "Payments",
    columns: paymentColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  },
  
  // Equipment rental table configuration
  equipment: {
    title: "Equipment Rentals",
    columns: equipmentColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  },
  
  // Lesson due table configuration
  lessons: {
    title: "Private Lesson Due",
    columns: lessonColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  },
  
  // Add more tables as needed
  reports: {
    title: "Reports",
    columns: reportColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: true,  // Different setting for reports
    enablePrint: true,   // Different setting for reports
    enableSearch: true,  // Different setting for reports
    enableFilter: true,  // Different setting for reports
    enableRowsPerPage: true, // Different setting for reports
  }
};
```

### **2. Multiple Tables in Single Component**

```typescript
// CustomerDetailClient.tsx - Multiple tables usage
export function CustomerDetailClient({ location, id }) {
  const [invoiceData, setInvoiceData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [equipmentData, setEquipmentData] = useState([]);
  const [lessonData, setLessonData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [invoices, payments, equipment, lessons] = await Promise.all([
        getCustomerInvoices(location, Number(id)),
        getCustomerPayments(location, Number(id)),
        getCustomerEquipment(location, Number(id)),
        getCustomerLessons(location, Number(id))
      ]);
      setInvoiceData(invoices || []);
      setPaymentData(payments || []);
      setEquipmentData(equipment || []);
      setLessonData(lessons || []);
      setLoading(false);
    };
    loadData();
  }, [location, id]);

  // Calculate footer for payments
  const paymentRemainingTotal = paymentData.reduce((sum, item) => sum + item.remaining, 0);
  const paymentFooterRow = {
    date: "",
    notes: "",
    amount: 0,
    used: 0,
    remaining: paymentRemainingTotal,
  };

  return (
    <div className="space-y-4">
      {/* Existing breadcrumb, metrics, details cards */}
      
      {/* Multiple tables section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* Left column tables */}
          <TableCard 
            tableId="invoices" 
            data={invoiceData} 
            loading={loading}
            onAdd={() => console.log('Add invoice')}
          />
          
          <TableCard 
            tableId="equipment" 
            data={equipmentData} 
            loading={loading}
            onAdd={() => console.log('Add equipment')}
          />
        </div>
        
        <div className="space-y-4">
          {/* Right column tables */}
          <TableCard 
            tableId="payments" 
            data={paymentData} 
            loading={loading}
            footerRow={paymentFooterRow}
            onAdd={() => console.log('Add payment')}
          />
          
          <TableCard 
            tableId="lessons" 
            data={lessonData} 
            loading={loading}
            onAdd={() => console.log('Add lesson')}
          />
        </div>
      </div>
    </div>
  );
}
```

### **3. Cross-Feature Table Usage**

```typescript
// students/tableConfigs.ts
export const STUDENT_TABLE_CONFIGS = {
  progress: {
    title: "Student Progress",
    columns: progressColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  },
  attendance: {
    title: "Attendance",
    columns: attendanceColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  }
};

// schedule/tableConfigs.ts
export const SCHEDULE_TABLE_CONFIGS = {
  appointments: {
    title: "Appointments",
    columns: appointmentColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  },
  classes: {
    title: "Classes",
    columns: classColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  }
};
```

### **4. Type Safety for Multiple Tables**

```typescript
// Type-safe table ID usage
interface TableCardProps {
  tableId: keyof typeof CUSTOMER_TABLE_CONFIGS; // Only valid table IDs allowed
  data: any[];
  loading?: boolean;
  onAdd?: () => void;
  footerRow?: any;
}

// Usage with type safety
<TableCard tableId="invoices" data={data} />     // ✅ Valid
<TableCard tableId="payments" data={data} />     // ✅ Valid
<TableCard tableId="invalid" data={data} />      // ❌ TypeScript error
```

### **5. Adding New Tables**

```typescript
// Step 1: Add column definition
export const newTableColumns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("id")}</div>
    ),
  },
  // ... more columns
];

// Step 2: Add to table configs
export const CUSTOMER_TABLE_CONFIGS = {
  // ... existing configs
  newTable: {
    title: "New Table",
    columns: newTableColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  }
};

// Step 3: Add API function
export async function getCustomerNewTable(
  location: string,
  customerId: number
): Promise<NewTableData[]> {
  // Implementation
}

// Step 4: Use in component
<TableCard 
  tableId="newTable" 
  data={newTableData} 
  loading={loading}
  onAdd={() => console.log('Add new item')}
/>
```

---

## 🔄 **Migration Strategy**

### **Phase 1: Extract Table Configurations**
1. Create `tableConfigs.ts` file
2. Move column definitions from component
3. Create table configuration objects
4. Update component to use configs

### **Phase 2: Add Mock Data to API**
1. Add table data interfaces to API file
2. Create mock data functions
3. Update component to use API functions
4. Remove hardcoded data from component

### **Phase 3: Create Reusable Components**
1. Create `TableCard.tsx` component
2. Update main component to use `TableCard`
3. Test functionality

### **Phase 4: Apply to Other Features**
1. Create similar structure for students feature
2. Create similar structure for schedule feature
3. Ensure consistency across features

---

## ✅ **Benefits**

### **1. Code Organization**
- **Before**: 821 lines in single component
- **After**: ~200 lines in main component + organized configs

### **2. Maintainability**
- Table configurations in dedicated files
- Easy to update table behavior globally
- Clear separation of concerns

### **3. Reusability**
- `TableCard` component can be used across features
- Table configurations can be shared
- Consistent table behavior everywhere

### **4. Scalability**
- Easy to add new tables
- Easy to add new features
- Consistent patterns across codebase

### **5. API Migration**
- Simple switch from mock to real API
- No changes to component structure
- Consistent data flow patterns

---

## 🎯 **Best Practices**

### **1. Naming Conventions**
```typescript
// Table configs
export const CUSTOMER_TABLE_CONFIGS = { ... }
export const STUDENT_TABLE_CONFIGS = { ... }

// API functions
export async function getCustomerInvoices() { ... }
export async function getStudentProgress() { ... }

// Components
TableCard.tsx
TableWrapper.tsx
```

### **2. Type Safety**
```typescript
// Define interfaces for all data types
export interface InvoiceData {
  id: string;
  date: string;
  // ... other fields
}

// Use proper typing in table configs
export const invoiceColumns: ColumnDef<InvoiceData>[] = [...]
```

### **3. Error Handling**
```typescript
// Always handle API errors
try {
  const data = await getCustomerInvoices(location, id);
  setInvoiceData(data || []);
} catch (error) {
  console.error('Error loading invoices:', error);
  setInvoiceData([]);
}
```

### **4. Loading States**
```typescript
// Always show loading states
<TableCard 
  tableId="invoices" 
  data={invoiceData} 
  loading={loading}  // ← Important for UX
/>
```

---

## 🚀 **Future Enhancements**

### **1. Global Table Configuration**
```typescript
// config/globalTableConfig.ts
export const GLOBAL_TABLE_DEFAULTS = {
  size: "compact",
  variant: "striped",
  enableSorting: true,
  // ... other defaults
};
```

### **2. Table Registry**
```typescript
// utils/tableRegistry.ts
export const TABLE_REGISTRY = {
  'customers.invoices': CUSTOMER_TABLE_CONFIGS.invoices,
  'students.progress': STUDENT_TABLE_CONFIGS.progress,
  // ... other tables
};
```

### **3. Dynamic Table Loading**
```typescript
// components/DynamicTable.tsx
export function DynamicTable({ tableId, feature, data }) {
  const config = TABLE_REGISTRY[`${feature}.${tableId}`];
  return <TableCard config={config} data={data} />;
}
```

---

## 📊 **Summary**

This approach provides:

✅ **Clean Architecture** - Well-organized, maintainable code  
✅ **Feature Isolation** - Each feature manages its own tables  
✅ **Reusability** - Common components shared across features  
✅ **API Ready** - Easy migration from mock to real data  
✅ **Scalability** - Easy to add new features and tables  
✅ **Consistency** - Uniform table behavior across application  

The solution balances simplicity with flexibility, making it easy to maintain while providing room for future enhancements.

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Author**: Development Team
