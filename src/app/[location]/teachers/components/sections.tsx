"use client";

import * as React from "react";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DraggableItemRow } from "@/components/DraggableItemRow";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
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

// Re-export DraggableItemRow for backward compatibility
export { DraggableItemRow as ItemRow } from "@/components/DraggableItemRow";

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
  onReorder?: (reorderedEmails: TeacherEmail[]) => void;
}

export function EmailList({ emails, loading = false, onEdit, onDelete, onReorder }: EmailListProps) {
  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragging,
    isDragOver,
  } = useDragAndDrop<TeacherEmail>({
    items: emails,
    onReorder,
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
export function formatPhoneDisplay(phone: TeacherPhone): string {
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
  phones: TeacherPhone[];
  loading?: boolean;
  onEdit: (e: React.MouseEvent, phone: TeacherPhone) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onReorder?: (reorderedPhones: TeacherPhone[]) => void;
}

export function PhoneList({ phones, loading = false, onEdit, onDelete, onReorder }: PhoneListProps) {
  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragging,
    isDragOver,
  } = useDragAndDrop<TeacherPhone>({
    items: phones,
    onReorder,
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
  address: TeacherAddress,
  geoData?: { city: Array<{ id: number; name: string }>; province: Array<{ id: number; name: string }>; country: Array<{ id: number; name: string }> }
): string {
  // Get province and country names from geoData if available
  const province = geoData?.province.find(p => p.id === address.provinceId)?.name || address.province || 'Ontario';
  const country = geoData?.country.find(c => c.id === address.countryId)?.name || address.country || 'Canada';
  
  // Build the full address value with line breaks (same format as customer AddressCard)
  const addressValue = `${address.address}\n${address.city}, ${province}\n${country} - ${address.postalCode}`;
  
  return addressValue;
}

interface AddressListProps {
  addresses: TeacherAddress[];
  loading?: boolean;
  onEdit: (e: React.MouseEvent, address: TeacherAddress) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onReorder?: (reorderedAddresses: TeacherAddress[]) => void;
}

export function AddressList({ addresses, loading = false, onEdit, onDelete, onReorder }: AddressListProps) {
  const [geoData, setGeoData] = React.useState<{
    city: Array<{ id: number; name: string }>;
    province: Array<{ id: number; name: string }>;
    country: Array<{ id: number; name: string }>;
  } | null>(null);
  const [loadingGeoData, setLoadingGeoData] = React.useState(false);
  // Track if we've already initiated a fetch to prevent duplicate calls
  const hasFetchedRef = React.useRef(false);
  // Only fetch geodata when addresses exist and we haven't fetched yet
  React.useEffect(() => {
    // Skip if loading, no addresses, or already fetched
    if (loading || addresses.length === 0 || hasFetchedRef.current) {
      return;
    }

    const fetchGeoData = async () => {
      // Mark as fetching to prevent duplicate calls
      hasFetchedRef.current = true;
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
        // Reset ref on error so we can retry if needed
        hasFetchedRef.current = false;
      } finally {
        setLoadingGeoData(false);
      }
    };

    fetchGeoData();
  }, [addresses.length, loading]);

  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragging,
    isDragOver,
  } = useDragAndDrop<TeacherAddress>({
    items: addresses,
    onReorder,
    getItemId: (address) => address.id,
  });

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
        
        return (
          <DraggableItemRow
            key={address.id}
            item={address}
            label={address.label}
            value={addressDisplay}
            onEdit={onEdit}
            onDelete={onDelete}
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

// Qualification-specific formatting and list component
export function formatQualificationDisplay(qualification: TeacherQualification): string {
  const parts: string[] = [qualification.name];
  if (qualification.rate !== undefined && qualification.rate !== null) {
    const rateValue = typeof qualification.rate === 'number' 
      ? qualification.rate 
      : parseFloat(String(qualification.rate));
    if (!isNaN(rateValue)) {
      parts.push(`$${rateValue.toFixed(2)}/hr`);
    }
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
  onRowClick?: (qualification: TeacherQualification) => void;
  hideRateColumn?: boolean;
}

export function QualificationList({ 
  qualifications, 
  loading = false,
  currentPage = 1,
  totalPages = 1,
  showPagination = false,
  onPageChange,
  onRowClick,
  hideRateColumn = false,
}: QualificationListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        <div className={`grid ${hideRateColumn ? 'grid-cols-1' : 'grid-cols-2'} gap-4 pb-2 border-b`}>
          <Skeleton className="h-4 w-20" />
          {!hideRateColumn && <Skeleton className="h-4 w-24 ml-auto" />}
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`grid ${hideRateColumn ? 'grid-cols-1' : 'grid-cols-2'} gap-4 py-2`}>
            <Skeleton className="h-4 w-32" />
            {!hideRateColumn && <Skeleton className="h-4 w-20 ml-auto" />}
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
      <div className={`grid ${hideRateColumn ? 'grid-cols-1' : 'grid-cols-2'} gap-4 pb-2 border-b font-semibold text-sm`}>
        <div className="text-left">Name</div>
        {!hideRateColumn && <div className="text-right">Rate ($/hr)</div>}
      </div>
      
      {/* Table Rows */}
      <div className="divide-y">
        {qualifications.map((qualification, index) => (
          <div
            key={qualification.id}
            onClick={() => onRowClick?.(qualification)}
            className={`grid ${hideRateColumn ? 'grid-cols-1' : 'grid-cols-2'} gap-4 py-2 ${onRowClick ? 'cursor-pointer' : 'cursor-default'} transition-colors ${
              index % 2 === 0 ? "bg-white dark:bg-black" : "bg-gray-50 dark:bg-gray-900"
            } ${onRowClick ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : ''}`}
          >
            <div className="text-left">
              <span>{qualification.name}</span>
            </div>
            {!hideRateColumn && (
              <div className="text-right">
                {qualification.rate !== undefined && qualification.rate !== null
                  ? (() => {
                      const rateValue = typeof qualification.rate === 'number' 
                        ? qualification.rate 
                        : parseFloat(String(qualification.rate));
                      return !isNaN(rateValue) ? `$${rateValue.toFixed(2)}` : "";
                    })()
                  : ""}
              </div>
            )}
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
