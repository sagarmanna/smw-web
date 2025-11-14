"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  TeacherAddress,
  TeacherEmail,
  TeacherPhone,
  TeacherQualification,
} from "../types";
import { EditDeleteActions } from "./EditDeleteActions";
import { formatCurrency } from "@/utils/formatCurrency";

interface EmailListProps {
  emails: TeacherEmail[];
  onEdit?: (email: TeacherEmail) => void;
  onDelete?: (id: string) => void;
}

export function EmailList({ emails, onEdit, onDelete }: EmailListProps) {
  return (
    <div className="space-y-0">
      {emails.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between px-4 py-2.5 mb-2 last:mb-0 relative"
        >
          <div className="flex-1 flex justify-center">
            <div className="flex items-center">
              <span className="text-sm font-semibold text-foreground min-w-[120px] text-right pr-6">
                {item.label}
              </span>
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                {item.email}
                {item.note && ` - ${item.note}`}
              </span>
              {item.isPrimary && (
                <Badge variant="secondary" className="ml-2">Primary</Badge>
              )}
            </div>
          </div>
          <EditDeleteActions
            onEdit={onEdit ? () => onEdit(item) : undefined}
            onDelete={onDelete ? () => onDelete(item.id) : undefined}
          />
        </div>
      ))}
    </div>
  );
}

interface PhoneListProps {
  phones: TeacherPhone[];
  onEdit?: (phone: TeacherPhone) => void;
  onDelete?: (id: string) => void;
}

export function PhoneList({ phones, onEdit, onDelete }: PhoneListProps) {
  return (
    <div className="space-y-0">
      {phones.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between px-4 py-2.5 mb-2 last:mb-0 text-sm relative"
        >
          <div className="flex-1 flex justify-center">
            <div className="flex items-center">
              <span className="font-semibold text-foreground min-w-[120px] text-right pr-6">
                {item.label}
              </span>
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                {item.number}
                {item.extension && ` Ext: ${item.extension}`}
                {item.note && ` - ${item.note}`}
              </span>
            </div>
          </div>
          <EditDeleteActions
            onEdit={onEdit ? () => onEdit(item) : undefined}
            onDelete={onDelete ? () => onDelete(item.id) : undefined}
          />
        </div>
      ))}
    </div>
  );
}

interface AddressListProps {
  addresses: TeacherAddress[];
  onEdit?: (address: TeacherAddress) => void;
  onDelete?: (id: string) => void;
}

export function AddressList({ addresses, onEdit, onDelete }: AddressListProps) {
  return (
    <div className="space-y-0">
      {addresses.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-center px-4 py-3 text-sm gap-2 relative"
        >
          <div className="min-w-0">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-foreground flex-shrink-0">{item.label}</span>
              <div className="flex flex-col gap-0.5 text-gray-700 dark:text-gray-300">
                <div>{item.address}</div>
                {item.city && (
                  <div>
                    {item.city}
                    {item.province && `,${item.province}`}
                  </div>
                )}
                {item.country && (
                  <div>{item.country}</div>
                )}
              </div>
            </div>
          </div>
          <EditDeleteActions
            onEdit={onEdit ? () => onEdit(item) : undefined}
            onDelete={onDelete ? () => onDelete(item.id) : undefined}
          />
        </div>
      ))}
    </div>
  );
}

interface QualificationsListProps {
  items: TeacherQualification[];
  page?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
}

export function QualificationsList({ 
  items, 
  page = 1, 
  onPageChange,
  itemsPerPage = 10 
}: QualificationsListProps) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const showPagination = totalItems > itemsPerPage;
  
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = showPagination ? items.slice(startIndex, endIndex) : items;

  const handlePageChange = (newPage: number) => {
    if (onPageChange && newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-2 gap-4 px-4 py-3 border-b border-border">
        <div className="text-sm font-semibold text-foreground">Name</div>
        <div className="text-sm font-semibold text-foreground text-right">Rate ($/hr)</div>
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-border">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-2 gap-4 px-4 py-3 text-sm"
          >
            <div className="font-medium text-foreground">{item.name}</div>
            <div className="text-gray-700 dark:text-gray-300 text-right">
              {formatCurrency(item.rate)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination Controls */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
            className="h-8 px-3 text-xs"
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="h-8 w-8 p-0"
            title="Previous pages"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className="h-8 w-8 p-0 text-xs"
            >
              {pageNum}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="h-8 w-8 p-0"
            title="Next pages"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={page === totalPages}
            className="h-8 px-3 text-xs"
          >
            Last
          </Button>
        </div>
      )}
    </div>
  );
}

