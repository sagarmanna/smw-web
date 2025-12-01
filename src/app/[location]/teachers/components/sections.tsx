"use client";

import * as React from "react";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import {
  TeacherAddress,
  TeacherEmail,
  TeacherPhone,
  TeacherQualification,
} from "../types";

// Reusable skeleton loader component
export function ItemListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="flex items-center justify-between p-2 rounded -mx-2">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      ))}
    </>
  );
}

// Reusable item row component with edit/delete actions
interface ItemRowProps<T> {
  item: T;
  label: string;
  value: React.ReactNode;
  onEdit: (e: React.MouseEvent, item: T) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  getItemId: (item: T) => string;
  editAriaLabel: string;
  deleteAriaLabel: string;
}

export function ItemRow<T>({
  item,
  label,
  value,
  onEdit,
  onDelete,
  getItemId,
  editAriaLabel,
  deleteAriaLabel,
}: ItemRowProps<T>) {
  return (
    <div
      className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded -mx-2 cursor-pointer"
      onClick={(e) => onEdit(e, item)}
    >
      <KeyValueDisplay
        label={label}
        value={value}
        className="justify-start flex-1"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => onEdit(e, item)}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          aria-label={editAriaLabel}
        >
          <Pencil className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button
          onClick={(e) => onDelete(e, getItemId(item))}
          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
          aria-label={deleteAriaLabel}
        >
          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
}

// Reusable empty state component
export function EmptyState({ message }: { message: string }) {
  return (
    <span className="text-gray-500 dark:text-gray-400 text-sm">
      {message}
    </span>
  );
}

// Email-specific formatting and list component
export function formatEmailDisplay(email: TeacherEmail): string {
  let display = email.email;
  if (email.note && email.note.trim() !== "") {
    display += ` - ${email.note}`;
  }
  return display;
}

interface EmailListProps {
  emails: TeacherEmail[];
  loading?: boolean;
  onEdit: (e: React.MouseEvent, email: TeacherEmail) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export function EmailList({ emails, loading = false, onEdit, onDelete }: EmailListProps) {
  if (loading) {
    return <ItemListSkeleton />;
  }

  if (emails.length === 0) {
    return <EmptyState message="No emails added" />;
  }

  return (
    <>
      {emails.map((email) => (
        <ItemRow
          key={email.id}
          item={email}
          label={email.label}
          value={
            <span className="flex items-center gap-2">
              {formatEmailDisplay(email)}
              {email.isPrimary && (
                <Badge variant="secondary" className="text-xs">
                  Primary
                </Badge>
              )}
            </span>
          }
          onEdit={onEdit}
          onDelete={onDelete}
          getItemId={(item) => item.id}
          editAriaLabel="Edit email"
          deleteAriaLabel="Delete email"
        />
      ))}
    </>
  );
}

// Phone-specific formatting and list component
export function formatPhoneDisplay(phone: TeacherPhone): string {
  let display = phone.number;
  if (phone.extension) {
    display += ` Ext: ${phone.extension}`;
  }
  if (phone.note && phone.note.trim() !== "") {
    display += ` - ${phone.note}`;
  }
  return display;
}

interface PhoneListProps {
  phones: TeacherPhone[];
  loading?: boolean;
  onEdit: (e: React.MouseEvent, phone: TeacherPhone) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export function PhoneList({ phones, loading = false, onEdit, onDelete }: PhoneListProps) {
  if (loading) {
    return <ItemListSkeleton />;
  }

  if (phones.length === 0) {
    return <EmptyState message="No phones added" />;
  }

  return (
    <>
      {phones.map((phone) => (
        <ItemRow
          key={phone.id}
          item={phone}
          label={phone.label}
          value={formatPhoneDisplay(phone)}
          onEdit={onEdit}
          onDelete={onDelete}
          getItemId={(item) => item.id}
          editAriaLabel="Edit phone"
          deleteAriaLabel="Delete phone"
        />
      ))}
    </>
  );
}

// Address-specific formatting and list component
export function formatAddressDisplay(address: TeacherAddress): string {
  const parts = [address.address];
  if (address.city) {
    const cityPart = address.province
      ? `${address.city},${address.province}`
      : address.city;
    parts.push(cityPart);
  }
  if (address.country) {
    parts.push(address.country);
  }
  return parts.join(" / ");
}

interface AddressListProps {
  addresses: TeacherAddress[];
  loading?: boolean;
  onEdit: (e: React.MouseEvent, address: TeacherAddress) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export function AddressList({ addresses, loading = false, onEdit, onDelete }: AddressListProps) {
  if (loading) {
    return <ItemListSkeleton />;
  }

  if (addresses.length === 0) {
    return <EmptyState message="No addresses added" />;
  }

  return (
    <>
      {addresses.map((address) => (
        <ItemRow
          key={address.id}
          item={address}
          label={address.label}
          value={formatAddressDisplay(address)}
          onEdit={onEdit}
          onDelete={onDelete}
          getItemId={(item) => item.id}
          editAriaLabel="Edit address"
          deleteAriaLabel="Delete address"
        />
      ))}
    </>
  );
}

// Qualification-specific formatting and list component
export function formatQualificationDisplay(qualification: TeacherQualification): string {
  const parts: string[] = [qualification.name];
  if (qualification.rate !== undefined && qualification.rate !== null) {
    parts.push(`$${qualification.rate.toFixed(2)}/hr`);
  }
  if (qualification.dateObtained) {
    parts.push(`Obtained: ${qualification.dateObtained}`);
  }
  return parts.join(" • ");
}

interface QualificationListProps {
  qualifications: TeacherQualification[];
  loading?: boolean;
  currentPage?: number;
  totalPages?: number;
  showPagination?: boolean;
  onPageChange?: (page: number) => void;
}

export function QualificationList({ 
  qualifications, 
  loading = false,
  currentPage = 1,
  totalPages = 1,
  showPagination = false,
  onPageChange,
}: QualificationListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4 pb-2 border-b">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="grid grid-cols-2 gap-4 py-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (qualifications.length === 0) {
    return <EmptyState message="No qualifications added" />;
  }

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-2 gap-4 pb-2 border-b font-semibold text-sm">
        <div className="text-left">Name</div>
        <div className="text-right">Rate ($/hr)</div>
      </div>
      
      {/* Table Rows */}
      <div className="divide-y">
        {qualifications.map((qualification, index) => (
          <div
            key={qualification.id}
            className={`grid grid-cols-2 gap-4 py-2 ${
              index % 2 === 0 ? "bg-white dark:bg-black" : "bg-gray-50 dark:bg-gray-900"
            }`}
          >
            <div className="text-left">
              <span>{qualification.name}</span>
            </div>
            <div className="text-right">
              {qualification.rate !== undefined && qualification.rate !== null
                ? `$${qualification.rate.toFixed(2)}`
                : ""}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {showPagination && totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
