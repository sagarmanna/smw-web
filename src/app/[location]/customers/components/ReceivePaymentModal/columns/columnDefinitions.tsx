// columns/columnDefinitions.tsx
import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { LessonItem, InvoiceItem, CreditItem, TableRow, GroupLessonItem } from '../types';
import { STUDENT_FILTER_OPTIONS } from '../constants';
// import { DateUtils } from '../utils';

/**
 * Column definitions for Lessons table
 * Following Open/Closed Principle - can be extended without modification
 */
export const createLessonColumns = (
  lessons: LessonItem[],
  toggleAllLessons: (checked: boolean) => void,
  toggleLesson: (id: string) => void,
  handleLessonPaymentChange: (id: string, value: string) => void
) => [
  {
    id: 'selected',
    header: () => (
      <Checkbox
        checked={lessons.every(l => l.selected)}
        onCheckedChange={checked => toggleAllLessons(!!checked)}
      />
    ),
    cell: ({ row }: { row: TableRow<LessonItem> }) => (
      <Checkbox
        checked={row.original.selected}
        onCheckedChange={() => toggleLesson(row.original.id)}
      />
    ),
    size: 40,
  },
  { 
    accessorKey: 'date', 
    header: 'Date', 
    size: 180 
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    size: 240,
    // filter: {
    //   type: 'date-range' as const,
    //   disabled: (date: Date) => DateUtils.isBeforeToday(date),
    // },
  },
  {
    accessorKey: 'student',
    header: 'Student',
    size: 140,
    filter: {
      type: 'dropdown' as const,
      options: STUDENT_FILTER_OPTIONS,
    },
  },
  { 
    accessorKey: 'program', 
    header: 'Program', 
    size: 140 
  },
  { 
    accessorKey: 'teacher', 
    header: 'Teacher', 
    size: 140 
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    size: 100,
    cell: ({ row }: { row: TableRow<LessonItem> }) =>
      `$${row.original.amount.toFixed(2)}`,
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    size: 100,
    cell: ({ row }: { row: TableRow<LessonItem> }) => (
      <span className="text-blue-600">${row.original.balance.toFixed(2)}</span>
    ),
  },
  {
    accessorKey: 'payment',
    header: 'Payment',
    size: 100,
    cell: ({ row }: { row: TableRow<LessonItem> }) => (
      <Input
        type="text"
        value={row.original.payment}
        onChange={e => handleLessonPaymentChange(row.original.id, e.target.value)}
        className="h-8 w-20 text-sm text-right"
      />
    ),
  },
];

/**
 * Column definitions for Group Lessons table
 */
/**
 * Column definitions for Group Lessons table
 */
export const createGroupLessonColumns = (
  groupLessons: GroupLessonItem[],
  toggleAllGroupLessons: (checked: boolean) => void,
  toggleGroupLesson: (id: string) => void,
  handleGroupLessonPaymentChange: (id: string, value: string) => void
) => [
  {
    id: 'selected',
    header: () => (
      <Checkbox
        checked={groupLessons.every(gl => gl.selected)}
        onCheckedChange={checked => toggleAllGroupLessons(!!checked)}
      />
    ),
    cell: ({ row }: { row: TableRow<GroupLessonItem> }) => (
      <Checkbox
        checked={row.original.selected}
        onCheckedChange={() => toggleGroupLesson(row.original.id)}
      />
    ),
    size: 40,
  },
  { 
    accessorKey: 'date', 
    header: 'Date', 
    size: 180 
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    size: 240,
  },
  {
    accessorKey: 'student',
    header: 'Student',
    size: 140,
    filter: {
      type: 'dropdown' as const,
      options: STUDENT_FILTER_OPTIONS,
    },
  },
  { 
    accessorKey: 'program', 
    header: 'Program', 
    size: 140 
  },
  { 
    accessorKey: 'teacher', 
    header: 'Teacher', 
    size: 140 
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    size: 100,
    cell: ({ row }: { row: TableRow<GroupLessonItem> }) =>
      `$${row.original.amount.toFixed(2)}`,
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    size: 100,
    cell: ({ row }: { row: TableRow<GroupLessonItem> }) => (
      <span className="text-blue-600">${row.original.balance.toFixed(2)}</span>
    ),
  },
  {
    accessorKey: 'payment',
    header: 'Payment',
    size: 100,
    cell: ({ row }: { row: TableRow<GroupLessonItem> }) => (
      <Input
        type="text"
        value={row.original.payment}
        onChange={e => handleGroupLessonPaymentChange(row.original.id, e.target.value)}
        className="h-8 w-20 text-sm text-right"
      />
    ),
  },
];
/**
 * Column definitions for Invoices table
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
      <Checkbox
        checked={invoices.every(i => i.selected)}
        onCheckedChange={checked => toggleAllInvoices(!!checked)}
      />
    ),
    cell: ({ row }: { row: TableRow<InvoiceItem> }) => (
      <Checkbox
        checked={row.original.selected}
        onCheckedChange={() => toggleInvoice(row.original.id)}
      />
    ),
    size: 40,
  },
  { 
    accessorKey: 'date', 
    header: 'Date', 
    size: 180 
  },
  { 
    accessorKey: 'number', 
    header: 'Number', 
    size: 150 
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    size: 100,
    cell: ({ row }: { row: TableRow<InvoiceItem> }) =>
      `$${row.original.amount.toFixed(2)}`,
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    size: 100,
    cell: ({ row }: { row: TableRow<InvoiceItem> }) => (
      <span className="text-blue-600">${row.original.balance.toFixed(2)}</span>
    ),
  },
  {
    accessorKey: 'payment',
    header: 'Payment',
    size: 100,
    cell: ({ row }: { row: TableRow<InvoiceItem> }) => (
      <Input
        type="text"
        value={row.original.payment}
        onChange={e => handleInvoicePaymentChange(row.original.id, e.target.value)}
        className="h-8 w-20 text-sm text-right"
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
      <Checkbox
        checked={credits.every(c => c.selected)}
        onCheckedChange={checked => toggleAllCredits(!!checked)}
      />
    ),
    cell: ({ row }: { row: TableRow<CreditItem> }) => (
      <Checkbox
        checked={row.original.selected}
        onCheckedChange={() => toggleCredit(row.original.id)}
      />
    ),
    size: 40,
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
    size: 100,
    cell: ({ row }: { row: TableRow<CreditItem> }) =>
      `$${row.original.amount.toFixed(2)}`,
  },
  {
    accessorKey: 'payment',
    header: 'Payment',
    size: 100,
    cell: ({ row }: { row: TableRow<CreditItem> }) => (
      <Input
        type="text"
        value={row.original.payment}
        onChange={e => handleCreditPaymentChange(row.original.id, e.target.value)}
        className="h-8 w-20 text-sm text-right"
      />
    ),
  },
];