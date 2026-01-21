/// columns/columnDefinitions.tsx
import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { LessonItem, InvoiceItem, CreditItem, TableRow, GroupLessonItem } from '../types';

/**
 * Payment Input Component for Lessons
 */
const LessonPaymentInput: React.FC<{
  row: TableRow<LessonItem>;
  handleLessonPaymentChange: (id: string, value: string) => void;
}> = ({ row, handleLessonPaymentChange }) => {
  const [localValue, setLocalValue] = React.useState(row.original.payment);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    setLocalValue(row.original.payment);
    setError(null);
  }, [row.original.payment]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setError(null);
  };
  
  const handleBlur = () => {
    const numericValue = parseFloat(localValue) || 0;
    
    if (numericValue > row.original.balance) {
      setError("Can't over pay!");
      setLocalValue(row.original.payment); // Reset to previous valid value
      return;
    }
    
    handleLessonPaymentChange(row.original.id, localValue);
  };
  
  return (
    <div className="flex flex-col items-end">
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`h-8 w-24 text-sm text-right ${error ? 'border-red-500' : ''}`}
        placeholder="0.00"
      />
      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
};

/**
 * Payment Input Component for Group Lessons
 */
const GroupLessonPaymentInput: React.FC<{
  row: TableRow<GroupLessonItem>;
  handleGroupLessonPaymentChange: (id: string, value: string) => void;
}> = ({ row, handleGroupLessonPaymentChange }) => {
  const [localValue, setLocalValue] = React.useState(row.original.payment);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    setLocalValue(row.original.payment);
    setError(null);
  }, [row.original.payment]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setError(null);
  };
  
  const handleBlur = () => {
    const numericValue = parseFloat(localValue) || 0;
    
    if (numericValue > row.original.balance) {
      setError("Can't over pay!");
      setLocalValue(row.original.payment); // Reset to previous valid value
      return;
    }
    
    handleGroupLessonPaymentChange(row.original.id, localValue);
  };
  
  return (
    <div className="flex flex-col items-end">
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`h-8 w-24 text-sm text-right ${error ? 'border-red-500' : ''}`}
        placeholder="0.00"
      />
      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
};

/**
 * Payment Input Component for Invoices
 */
const InvoicePaymentInput: React.FC<{
  row: TableRow<InvoiceItem>;
  handleInvoicePaymentChange: (id: string, value: string) => void;
}> = ({ row, handleInvoicePaymentChange }) => {
  const [localValue, setLocalValue] = React.useState(row.original.payment);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    setLocalValue(row.original.payment);
    setError(null);
  }, [row.original.payment]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setError(null);
  };
  
  const handleBlur = () => {
    const numericValue = parseFloat(localValue) || 0;
    
    if (numericValue > row.original.balance) {
      setError("Can't over pay!");
      setLocalValue(row.original.payment); // Reset to previous valid value
      return;
    }
    
    handleInvoicePaymentChange(row.original.id, localValue);
  };
  
  return (
    <div className="flex flex-col items-end">
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`h-8 w-24 text-sm text-right ${error ? 'border-red-500' : ''}`}
        placeholder="0.00"
      />
      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
};

/**
 * Payment Input Component for Credits
 */
const CreditPaymentInput: React.FC<{
  row: TableRow<CreditItem>;
  handleCreditPaymentChange: (id: string, value: string) => void;
}> = ({ row, handleCreditPaymentChange }) => {
  const [localValue, setLocalValue] = React.useState(row.original.payment);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    setLocalValue(row.original.payment);
    setError(null);
  }, [row.original.payment]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setError(null);
  };
  
  const handleBlur = () => {
    const numericValue = parseFloat(localValue) || 0;
    
    if (numericValue > row.original.amount) {
      setError("Can't over pay!");
      setLocalValue(row.original.payment); // Reset to previous valid value
      return;
    }
    
    handleCreditPaymentChange(row.original.id, localValue);
  };
  
  return (
    <div className="flex flex-col items-end">
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`h-8 w-24 text-sm text-right ${error ? 'border-red-500' : ''}`}
        placeholder="0.00"
      />
      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
};

/**
 * Column definitions for Lessons table with dynamic student filter and date range filter on Due Date
 */
export const createLessonColumns = (
  lessons: LessonItem[],
  toggleAllLessons: (checked: boolean) => void,
  toggleLesson: (id: string) => void,
  handleLessonPaymentChange: (id: string, value: string) => void,
  studentFilterOptions: Array<{ value: string; label: string }>
) => [
  {
    id: 'selected',
    header: () => (
      <div className="flex items-center justify-center py-2">
        <Checkbox
          checked={lessons.every(l => l.selected)}
          onCheckedChange={checked => toggleAllLessons(!!checked)}
        />
      </div>
    ),
    cell: ({ row }: { row: TableRow<LessonItem> }) => (
      <div className="flex items-center justify-center py-3">
        <Checkbox
          checked={row.original.selected}
          onCheckedChange={() => toggleLesson(row.original.id)}
        />
      </div>
    ),
    size: 50,
  },
  { 
    accessorKey: 'date', 
    header: 'Date', 
    size: 180 
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    size: 180,
    filter: {
      type: 'date-range' as const,
      initialValue: undefined,
      quickPreset: 'receivePayment',
    },
  },
  {
    accessorKey: 'student',
    header: 'Student',
    size: 150,
    filter: {
      type: 'dropdown' as const,
      options: studentFilterOptions,
    },
  },
  { 
    accessorKey: 'program', 
    header: 'Program', 
    size: 150 
  },
  { 
    accessorKey: 'teacher', 
    header: 'Teacher', 
    size: 150 
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    size: 110,
    cell: ({ row }: { row: TableRow<LessonItem> }) => (
      <div className="text-right">${row.original.amount.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    size: 110,
    cell: ({ row }: { row: TableRow<LessonItem> }) => (
      <div className="text-right">${row.original.balance.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: 'payment',
    header: 'Payment',
    size: 110,
    cell: ({ row }: { row: TableRow<LessonItem> }) => (
      <LessonPaymentInput 
        row={row} 
        handleLessonPaymentChange={handleLessonPaymentChange} 
      />
    ),
  },
];

/**
 * Column definitions for Group Lessons table with dynamic student filter and date range filter on Due Date
 */
export const createGroupLessonColumns = (
  groupLessons: GroupLessonItem[],
  toggleAllGroupLessons: (checked: boolean) => void,
  toggleGroupLesson: (id: string) => void,
  handleGroupLessonPaymentChange: (id: string, value: string) => void,
  studentFilterOptions: Array<{ value: string; label: string }>
) => [
  {
    id: 'selected',
    header: () => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={groupLessons.every(gl => gl.selected)}
          onCheckedChange={checked => toggleAllGroupLessons(!!checked)}
        />
      </div>
    ),
    cell: ({ row }: { row: TableRow<GroupLessonItem> }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.original.selected}
          onCheckedChange={() => toggleGroupLesson(row.original.id)}
        />
      </div>
    ),
    size: 50,
  },
  { 
    accessorKey: 'date', 
    header: 'Date', 
    size: 180 
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    size: 180,
    filter: {
      type: 'date-range' as const,
      initialValue: undefined,
      quickPreset: 'receivePayment',
    },
  },
  {
    accessorKey: 'student',
    header: 'Student',
    size: 150,
    filter: {
      type: 'dropdown' as const,
      options: studentFilterOptions,
    },
  },
  { 
    accessorKey: 'program', 
    header: 'Program', 
    size: 150 
  },
  { 
    accessorKey: 'teacher', 
    header: 'Teacher', 
    size: 150 
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    size: 110,
    cell: ({ row }: { row: TableRow<GroupLessonItem> }) => (
      <div className="text-right">${row.original.amount.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    size: 110,
    cell: ({ row }: { row: TableRow<GroupLessonItem> }) => (
      <div className="text-right">${row.original.balance.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: 'payment',
    header: 'Payment',
    size: 110,
    cell: ({ row }: { row: TableRow<GroupLessonItem> }) => (
      <GroupLessonPaymentInput 
        row={row} 
        handleGroupLessonPaymentChange={handleGroupLessonPaymentChange} 
      />
    ),
  },
];

/**
 * Column definitions for Invoices table - NO STATUS COLUMN
 * Payment column pre-filled with balance amount from API (editable)
 */
export const createInvoiceColumns = (
  invoices: InvoiceItem[],
  toggleAllInvoices: (checked: boolean) => void,
  toggleInvoice: (id: string) => void,
  handleInvoicePaymentChange: (id: string, value: string) => void
) => [
  {
    id: 'selected',
    header: () => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={invoices.every(i => i.selected)}
          onCheckedChange={checked => toggleAllInvoices(!!checked)}
        />
      </div>
    ),
    cell: ({ row }: { row: TableRow<InvoiceItem> }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.original.selected}
          onCheckedChange={() => toggleInvoice(row.original.id)}
        />
      </div>
    ),
    size: 50,
  },
  { 
    accessorKey: 'date', 
    header: 'Date', 
    size: 130 
  },
  { 
    accessorKey: 'number', 
    header: 'Number', 
    size: 130 
  },
  {
    accessorKey: 'amount',
    header: 'Total',
    size: 110,
    cell: ({ row }: { row: TableRow<InvoiceItem> }) => (
      <div className="text-right">${row.original.amount.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: 'payments',
    header: 'Paid',
    size: 110,
    cell: ({ row }: { row: TableRow<InvoiceItem> }) => (
      <div className="text-right">
        <span className="text-gray-600">${row.original.payments.toFixed(2)}</span>
      </div>
    ),
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    size: 110,
    cell: ({ row }: { row: TableRow<InvoiceItem> }) => (
      <div className="text-right">
        <span className="font-medium">${row.original.balance.toFixed(2)}</span>
      </div>
    ),
  },
  {
    accessorKey: 'payment',
    header: 'Payment',
    size: 110,
    cell: ({ row }: { row: TableRow<InvoiceItem> }) => (
      <InvoicePaymentInput 
        row={row} 
        handleInvoicePaymentChange={handleInvoicePaymentChange} 
      />
    ),
  },
];

/**
 * Column definitions for Credits table
 */
export const createCreditColumns = (
  credits: CreditItem[],
  toggleAllCredits: (checked: boolean) => void,
  toggleCredit: (id: string) => void,
  handleCreditPaymentChange: (id: string, value: string) => void
) => [
  {
    id: 'selected',
    header: () => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={credits.every(c => c.selected)}
          onCheckedChange={checked => toggleAllCredits(!!checked)}
        />
      </div>
    ),
    cell: ({ row }: { row: TableRow<CreditItem> }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.original.selected}
          onCheckedChange={() => toggleCredit(row.original.id)}
        />
      </div>
    ),
    size: 50,
  },
  { 
    accessorKey: 'type', 
    header: 'Type', 
    size: 300 
  },
  { 
    accessorKey: 'reference', 
    header: 'Reference', 
    size: 200 
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    size: 110,
    cell: ({ row }: { row: TableRow<CreditItem> }) => (
      <div className="text-right">${row.original.amount.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: 'payment',
    header: 'Payment',
    size: 110,
    cell: ({ row }: { row: TableRow<CreditItem> }) => (
      <CreditPaymentInput 
        row={row} 
        handleCreditPaymentChange={handleCreditPaymentChange} 
      />
    ),
  },
];
