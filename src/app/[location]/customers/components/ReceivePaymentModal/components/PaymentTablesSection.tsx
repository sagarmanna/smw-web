// components/PaymentTablesSection.tsx
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CustomTable } from '@/components/CustomTable';
import { SectionTitle } from './SectionTitle';
import { PaymentSummary } from './PaymentSummary';
import { 
  LessonItem,
  GroupLessonItem,
  InvoiceItem, 
  CreditItem, 
  ColumnFilter, 
  PaymentCalculations,
  PaginationState
} from '../types';
import { MESSAGES, TABLE_CONFIG } from '../constants';

interface PaymentTablesSectionProps {
  lessons: LessonItem[];
  lessonColumns: ColumnDef<LessonItem, unknown>[];
  lessonColumnFilters: ColumnFilter;
  onLessonFilterChange: (columnKey: string, filterValue: unknown) => void;
  
  groupLessons: GroupLessonItem[];
  groupLessonColumns: ColumnDef<GroupLessonItem, unknown>[];
  groupLessonColumnFilters: ColumnFilter;
  onGroupLessonFilterChange: (columnKey: string, filterValue: unknown) => void;
  
  invoices: InvoiceItem[];
  invoiceColumns: ColumnDef<InvoiceItem, unknown>[];
  
  credits: CreditItem[];
  creditColumns: ColumnDef<CreditItem, unknown>[];
  
  calculations: PaymentCalculations;
  
  // Pagination for lessons
  lessonsPagination?: PaginationState;
  lessonsLoading?: boolean;
  onLessonsPageChange?: (page: number) => void;
  onLessonsRowsPerPageChange?: (rowsPerPage: number) => void;
  
  // Pagination for group lessons
  groupLessonsPagination?: PaginationState;
  groupLessonsLoading?: boolean;
  onGroupLessonsPageChange?: (page: number) => void;
  onGroupLessonsRowsPerPageChange?: (rowsPerPage: number) => void;
  
  // Pagination for invoices
  invoicesPagination?: PaginationState;
  invoicesLoading?: boolean;
  onInvoicesPageChange?: (page: number) => void;
  onInvoicesRowsPerPageChange?: (rowsPerPage: number) => void;
}

/**
 * Payment tables section containing all data tables
 * Following Single Responsibility Principle - handles only tables display
 */
export const PaymentTablesSection: React.FC<PaymentTablesSectionProps> = ({
  lessons,
  lessonColumns,
  lessonColumnFilters,
  onLessonFilterChange,
  groupLessons,
  groupLessonColumns,
  groupLessonColumnFilters,
  onGroupLessonFilterChange,
  invoices,
  invoiceColumns,
  credits,
  creditColumns,
  calculations,
  lessonsPagination,
  lessonsLoading,
  onLessonsPageChange,
  onLessonsRowsPerPageChange,
  groupLessonsPagination,
  groupLessonsLoading,
  onGroupLessonsPageChange,
  onGroupLessonsRowsPerPageChange,
  invoicesPagination,
  invoicesLoading,
  onInvoicesPageChange,
  onInvoicesRowsPerPageChange,
}) => (
  <>
    <div>
      <SectionTitle>Lessons</SectionTitle>
      <CustomTable
        data={lessons}
        columns={lessonColumns}
        enableSearch={TABLE_CONFIG.enableSearch}
        enableExport={TABLE_CONFIG.enableExport}
        enableFilter={TABLE_CONFIG.enableFilter}
        enablePrint={TABLE_CONFIG.enablePrint}
        enableColumnFilters={true}
        onColumnFilterChange={onLessonFilterChange}
        columnFilters={lessonColumnFilters}
        size={TABLE_CONFIG.size}
        variant={TABLE_CONFIG.variant}
        isLoading={lessonsLoading}
        serverSidePagination={lessonsPagination}
        onServerSidePageChange={onLessonsPageChange}
        rowsPerPage={lessonsPagination?.limit}
        onRowsPerPageChange={onLessonsRowsPerPageChange}
        rowsPerPageOptions={[10, 20, 50, 100]}
      />
    </div>

    <div>
      <SectionTitle>Group Lessons</SectionTitle>
      <CustomTable
        data={groupLessons}
        columns={groupLessonColumns}
        enableSearch={TABLE_CONFIG.enableSearch}
        enableExport={TABLE_CONFIG.enableExport}
        enableFilter={TABLE_CONFIG.enableFilter}
        enablePrint={TABLE_CONFIG.enablePrint}
        enableColumnFilters={true}
        onColumnFilterChange={onGroupLessonFilterChange}
        columnFilters={groupLessonColumnFilters}
        size={TABLE_CONFIG.size}
        variant={TABLE_CONFIG.variant}
        isLoading={groupLessonsLoading}
        serverSidePagination={groupLessonsPagination}
        onServerSidePageChange={onGroupLessonsPageChange}
        rowsPerPage={groupLessonsPagination?.limit}
        onRowsPerPageChange={onGroupLessonsRowsPerPageChange}
        rowsPerPageOptions={[10, 20, 50, 100]}
        customEmptyState={
          <div className="px-4 py-8 text-center text-sm text-gray-600">
            {MESSAGES.NO_LESSONS}
          </div>
        }
      />
    </div>

    <div>
      <SectionTitle>Invoices</SectionTitle>
      <CustomTable
        data={invoices}
        columns={invoiceColumns}
        enableSearch={TABLE_CONFIG.enableSearch}
        enableExport={TABLE_CONFIG.enableExport}
        enableFilter={TABLE_CONFIG.enableFilter}
        enablePrint={TABLE_CONFIG.enablePrint}
        size={TABLE_CONFIG.size}
        variant={TABLE_CONFIG.variant}
        isLoading={invoicesLoading}
        serverSidePagination={invoicesPagination}
        onServerSidePageChange={onInvoicesPageChange}
        rowsPerPage={invoicesPagination?.limit}
        onRowsPerPageChange={onInvoicesRowsPerPageChange}
        rowsPerPageOptions={[10, 20, 50, 100]}
      />
    </div>

    <div>
      <SectionTitle>Credits</SectionTitle>
      <CustomTable
        data={credits}
        columns={creditColumns}
        enableSearch={TABLE_CONFIG.enableSearch}
        enableExport={TABLE_CONFIG.enableExport}
        enableFilter={TABLE_CONFIG.enableFilter}
        enablePrint={TABLE_CONFIG.enablePrint}
        size={TABLE_CONFIG.size}
        variant={TABLE_CONFIG.variant}
      />
      <PaymentSummary calculations={calculations} />
    </div>
  </>
);