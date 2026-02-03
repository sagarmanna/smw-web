"use client";

import * as React from "react";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { DraggableItemRow } from "@/components/DraggableItemRow";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import {
  AdministratorAddress,
  AdministratorEmail,
  AdministratorPhone,
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
export function formatEmailDisplay(email: AdministratorEmail): string {
  let display = email.email;
  if (email.note && email.note.trim() !== "") {
    display += ` - ${email.note}`;
  }
  return display;
}

interface EmailListProps {
  emails: AdministratorEmail[];
  loading?: boolean;
  onEdit: (e: React.MouseEvent, email: AdministratorEmail) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onReorder?: (reorderedEmails: AdministratorEmail[]) => void;
}

export function EmailList({ emails, loading = false, onEdit, onDelete, onReorder }: EmailListProps) {
  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragging,
    isDragOver,
  } = useDragAndDrop<AdministratorEmail>({
    items: emails,
    onReorder: onReorder,
    getItemId: (email) => email.id,
  });

  if (loading) {
    return <ItemListSkeleton />;
  }

  if (emails.length === 0) {
    return <EmptyState message="No emails added" />;
  }

  return (
    <>
      {emails.map((email, index) => (
        <DraggableItemRow
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
          draggable={true}
          onDragStart={(e) => handleDragStart(e, email)}
          onDragOver={(e) => handleDragOver(e, email, index)}
          onDrop={(e) => handleDrop(e, email, index)}
          isDragging={isDragging(email)}
          isDragOver={isDragOver(email, index)}
        />
      ))}
    </>
  );
}

// Phone-specific formatting and list component
export function formatPhoneDisplay(phone: AdministratorPhone): string {
  let display = phone.number;
  if (phone.note && phone.note.trim() !== "") {
    display += ` - (${phone.note})`;
  }
  if (phone.extension) {
    display += ` Ext: ${phone.extension}`;
  }
  return display;
}

interface PhoneListProps {
  phones: AdministratorPhone[];
  loading?: boolean;
  onEdit: (e: React.MouseEvent, phone: AdministratorPhone) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onReorder?: (reorderedPhones: AdministratorPhone[]) => void;
}

export function PhoneList({ phones, loading = false, onEdit, onDelete, onReorder }: PhoneListProps) {
  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragging,
    isDragOver,
  } = useDragAndDrop<AdministratorPhone>({
    items: phones,
    onReorder: onReorder,
    getItemId: (phone) => phone.id,
  });

  if (loading) {
    return <ItemListSkeleton />;
  }

  if (phones.length === 0) {
    return <EmptyState message="No phones added" />;
  }

  return (
    <>
      {phones.map((phone, index) => (
        <DraggableItemRow
          key={phone.id}
          item={phone}
          label={phone.label}
          value={
            <span className="flex items-center gap-2">
              {formatPhoneDisplay(phone)}
              {phone.isPrimary && (
                <Badge variant="secondary" className="text-xs">
                  Primary
                </Badge>
              )}
            </span>
          }
          onEdit={onEdit}
          onDelete={onDelete}
          getItemId={(item) => item.id}
          editAriaLabel="Edit phone"
          deleteAriaLabel="Delete phone"
          draggable={true}
          onDragStart={(e) => handleDragStart(e, phone)}
          onDragOver={(e) => handleDragOver(e, phone, index)}
          onDrop={(e) => handleDrop(e, phone, index)}
          isDragging={isDragging(phone)}
          isDragOver={isDragOver(phone, index)}
        />
      ))}
    </>
  );
}

// Address-specific formatting and list component
export function formatAddressDisplay(
  address: AdministratorAddress,
  geoData?: { city: Array<{ id: number; name: string }>; province: Array<{ id: number; name: string }>; country: Array<{ id: number; name: string }> }
): string {
  // Get province and country names from geoData if available
  const province = geoData?.province.find(p => p.id === address.provinceId)?.name || address.province || 'Ontario';
  const country = geoData?.country.find(c => c.id === address.countryId)?.name || address.country || 'Canada';
  
  // Build the full address value with line breaks (same format as customer AddressCard)
  // Only show postal code with dash if it exists
  const postalCodePart = address.postalCode?.trim() ? ` - ${address.postalCode}` : '';
  const addressValue = `${address.address}\n${address.city}, ${province}\n${country}${postalCodePart}`;
  
  return addressValue;
}

interface AddressListProps {
  addresses: AdministratorAddress[];
  loading?: boolean;
  onEdit: (e: React.MouseEvent, address: AdministratorAddress) => void;
  onDelete: (e: React.MouseEvent, id: string, displayLabel?: string) => void;
  onReorder?: (reorderedAddresses: AdministratorAddress[]) => void;
}

export function AddressList({ addresses, loading = false, onEdit, onDelete, onReorder }: AddressListProps) {
  const [geoData, setGeoData] = React.useState<{
    city: Array<{ id: number; name: string }>;
    province: Array<{ id: number; name: string }>;
    country: Array<{ id: number; name: string }>;
  } | null>(null);
  // Track if we've already initiated a fetch to prevent duplicate calls
  const hasFetchedRef = React.useRef(false);

  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragging,
    isDragOver,
  } = useDragAndDrop<AdministratorAddress>({
    items: addresses,
    onReorder: onReorder,
    getItemId: (address) => address.id,
  });

  // Only fetch geodata when addresses exist and we haven't fetched yet
  React.useEffect(() => {
    // Skip if loading, no addresses, or already fetched
    if (loading || addresses.length === 0 || hasFetchedRef.current) {
      return;
    }

    const fetchGeoData = async () => {
      // Mark as fetching to prevent duplicate calls
      hasFetchedRef.current = true;
      try {
        // Import getGeoData dynamically to avoid circular dependencies
        const { getGeoData } = await import('@/app/[location]/customers/components/AddressCard/address-card.api');
        const data = await getGeoData('all');
        
        if (data) {
          setGeoData(data);
        }
      } catch (error) {
        console.error('Error fetching geodata:', error);
        // Reset ref on error so we can retry if needed
        hasFetchedRef.current = false;
      }
    };

    fetchGeoData();
  }, [addresses.length, loading]);

  if (loading) {
    return <ItemListSkeleton />;
  }

  if (addresses.length === 0) {
    return <EmptyState message="No addresses added" />;
  }

  return (
    <>
      {addresses.map((address, index) => {
        // Build the full address value with line breaks (same format as customer AddressCard)
        const addressValue = formatAddressDisplay(address, geoData || undefined);
        
        // Render address value with line breaks (convert \n to <br />)
        const addressDisplay = (
          <span className="whitespace-pre-line flex items-center gap-2">
            <span>{addressValue}</span>
            {address.isPrimary && (
              <Badge variant="secondary" className="text-xs">
                Primary
              </Badge>
            )}
          </span>
        );
        
        const formattedAddressForDelete = formatAddressDisplay(address, geoData || undefined);

        return (
          <DraggableItemRow
            key={address.id}
            item={address}
            label={address.label}
            value={addressDisplay}
            onEdit={onEdit}
            onDelete={(e, id) => onDelete(e, id, formattedAddressForDelete)}
            getItemId={(item) => item.id}
            editAriaLabel="Edit address"
            deleteAriaLabel="Delete address"
            draggable={true}
            onDragStart={(e) => handleDragStart(e, address)}
            onDragOver={(e) => handleDragOver(e, address, index)}
            onDrop={(e) => handleDrop(e, address, index)}
            isDragging={isDragging(address)}
            isDragOver={isDragOver(address, index)}
          />
        );
      })}
    </>
  );
}

