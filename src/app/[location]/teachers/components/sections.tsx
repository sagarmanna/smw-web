"use client";

import * as React from "react";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  TeacherAddress,
  TeacherEmail,
  TeacherPhone,
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
export function formatAddressDisplay(
  address: TeacherAddress,
  geoData?: { city: Array<{ id: number; name: string }>; province: Array<{ id: number; name: string }>; country: Array<{ id: number; name: string }> }
): string {
  // Get province and country names from geoData if available
  const province = geoData?.province.find(p => p.id === address.provinceId)?.name || address.province || 'Ontario';
  const country = geoData?.country.find(c => c.id === address.countryId)?.name || address.country || 'Canada';
  
  // Build the full address value with line breaks (same format as customer AddressCard)
  const addressValue = `${address.address}\n${address.city}, ${province}\n${country} - ${address.postalCode}${
    address.note ? `\n${address.note}` : ""
  }`;
  
  return addressValue;
}

interface AddressListProps {
  addresses: TeacherAddress[];
  loading?: boolean;
  onEdit: (e: React.MouseEvent, address: TeacherAddress) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export function AddressList({ addresses, loading = false, onEdit, onDelete }: AddressListProps) {
  const [geoData, setGeoData] = React.useState<{
    city: Array<{ id: number; name: string }>;
    province: Array<{ id: number; name: string }>;
    country: Array<{ id: number; name: string }>;
  } | null>(null);
  const [loadingGeoData, setLoadingGeoData] = React.useState(false);

  // Fetch geodata once when component mounts
  React.useEffect(() => {
    const fetchGeoData = async () => {
      setLoadingGeoData(true);
      try {
        // Import getGeoData dynamically to avoid circular dependencies
        const { getGeoData } = await import('@/app/[location]/customers/components/AddressCard/address-card.api');
        const data = await getGeoData('all');
        
        if (data) {
          setGeoData(data);
        }
      } catch (error) {
        console.error('Error fetching geodata:', error);
      } finally {
        setLoadingGeoData(false);
      }
    };

    fetchGeoData();
  }, []);

  if (loading) {
    return <ItemListSkeleton />;
  }

  if (addresses.length === 0) {
    return <EmptyState message="No addresses added" />;
  }

  return (
    <>
      {addresses.map((address) => {
        // Build the full address value with line breaks (same format as customer AddressCard)
        const addressValue = formatAddressDisplay(address, geoData || undefined);
        
        // Render address value with line breaks (convert \n to <br />)
        const addressDisplay = (
          <span className="whitespace-pre-line">{addressValue}</span>
        );
        
        return (
          <ItemRow
            key={address.id}
            item={address}
            label={address.label}
            value={addressDisplay}
            onEdit={onEdit}
            onDelete={onDelete}
            getItemId={(item) => item.id}
            editAriaLabel="Edit address"
            deleteAriaLabel="Delete address"
          />
        );
      })}
    </>
  );
}
