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
  PaymentCalculations 
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