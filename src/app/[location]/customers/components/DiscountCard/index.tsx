import React, { useState } from "react";
import { InfoCard } from "@/components/InfoCard";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Pencil } from "lucide-react";
import { updateCustomerDiscount, createCustomerDiscount } from "./discount-card.api";
import { toast } from "sonner";

interface DiscountCardProps {
  discount?: number;
  onAddClick?: () => void;
  onSave?: (discount: number) => void;
  className?: string;
  loading?: boolean;
  location: string;
  customerId: number;
}

export function DiscountCard({ 
  discount = 0,
  onAddClick, 
  onSave,
  className,
  loading = false,
  location,
  customerId
}: DiscountCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discountValue, setDiscountValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleAddClick = () => {
    setIsEditMode(false);
    setIsModalOpen(true);
    setDiscountValue("");
    if (onAddClick) {
      onAddClick();
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditMode(true);
    setIsModalOpen(true);
    setDiscountValue(discount > 0 ? discount.toString() : "");
  };

  const isDiscountValid = () => {
    if (discountValue.trim() === "") return false;
    const num = parseFloat(discountValue);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  const handleSave = async () => {
    if (!isDiscountValid()) {
      setShowError(true);
      return;
    }

    const numDiscount = parseFloat(discountValue);

    setIsSaving(true);
    try {
      let response;
      
      if (isEditMode) {
        // Use PUT for editing existing discount
        response = await updateCustomerDiscount(
          location,
          customerId,
          numDiscount
        );
      } else {
        // Use POST for creating new discount
        response = await createCustomerDiscount(
          location,
          customerId,
          numDiscount
        );
      }

      if (response?.success) {
        toast.success(response.message || `Discount ${isEditMode ? 'updated' : 'created'} successfully`);

        if (onSave) {
          onSave(numDiscount);
        }

        setDiscountValue("");
        setShowError(false);
        setHasTyped(false);
        setIsModalOpen(false);
      } else {
        toast.error(response?.message || `Failed to ${isEditMode ? 'update' : 'create'} discount`);
      }
    } catch (error) {
      console.error("Error saving discount:", error);
      toast.error("An unexpected error occurred while saving the discount");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDiscountValue("");
    setShowError(false);
    setHasTyped(false);
    setIsModalOpen(false);
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiscountValue(value);
    setHasTyped(true);
  };

  const modalActions = [
    {
      label: "Cancel",
      onClick: handleCancel,
      variant: "outline" as const,
      disabled: isSaving
    },
    {
      label: isSaving ? "Saving..." : "Save",
      onClick: handleSave,
      variant: "default" as const,
      disabled: isSaving
    }
  ];

  return (
    <>
      <InfoCard 
        title="Discount (%)" 
        onAddClick={handleAddClick}
        showAddButton={!discount || discount === 0}
        className={className}
        loading={loading}
      >
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-between p-2 rounded -mx-2">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ) : discount > 0 ? (
            <div className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded -mx-2 group">
              <KeyValueDisplay
                label="Discount"
                value={`${discount}%`}
                className="justify-start flex-1"
              />
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleEditClick}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  aria-label="Edit discount"
                >
                  <Pencil className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">No discounts added</span>
          )}
        </div>
      </InfoCard>

      <ReusableModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Discount"
        size="xl"
        actions={modalActions}
        showFooter={true}
      >
        <div className="space-y-4">
          {/* Warning Alert */}
          <div className="flex items-start gap-3 p-4 bg-[#f3573f] text-white rounded-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              You have entered a non-approved Arcadia discount. All non-approved discounts must be 
              submitted in writing and approved by Head Office prior to entering a discount, otherwise you 
              are in breach of your agreement.
            </p>
          </div>

          {/* Discount Input */}
          <div className="space-y-2">
            <Label 
              htmlFor="discount" 
              className={`text-sm font-medium ${
                hasTyped && discountValue.trim() !== "" && !isDiscountValid() 
                  ? "text-red-600 dark:text-red-400" 
                  : isDiscountValid() 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              Discount
            </Label>
            <div className="relative">
              <Input
                id="discount"
                type="text"
                inputMode="decimal"
                value={discountValue}
                onChange={handleDiscountChange}
                disabled={isSaving}
                className={`text-right pr-10 focus:ring-0 focus:outline-none bg-white dark:bg-gray-800 ${
                  hasTyped && discountValue.trim() !== "" && !isDiscountValid() 
                    ? "border-red-600 dark:border-red-500 text-gray-900 dark:text-gray-100" 
                    : isDiscountValid() 
                    ? "border-green-600 dark:border-green-500 text-gray-900 dark:text-gray-100" 
                    : "border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                }`}
                style={{
                  boxShadow: 'none'
                }}
                placeholder=""
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                %
              </span>
            </div>
            {hasTyped && discountValue.trim() !== "" && !isDiscountValid() && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Discount must be a number between 0 and 100.
              </p>
            )}
            {showError && discountValue.trim() === "" && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Discount cannot be blank.
              </p>
            )}
          </div>
        </div>
      </ReusableModal>
    </>
  );
}