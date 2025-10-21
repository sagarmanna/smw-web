import React, { useState } from "react";
import { InfoCard } from "@/components/InfoCard";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface DiscountCardProps {
  discount?: number;
  onAddClick?: () => void;
  onSave?: (discount: number) => void;
  className?: string;
  loading?: boolean;
}

export function DiscountCard({ 
  discount = 0,
  onAddClick, 
  onSave,
  className,
  loading = false
}: DiscountCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discountValue, setDiscountValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);

  const handleAddClick = () => {
    setIsModalOpen(true);
    setDiscountValue(discount > 0 ? discount.toString() : "");
    if (onAddClick) {
      onAddClick();
    }
  };

  const isDiscountValid = () => {
    if (discountValue.trim() === "") return false;
    const num = parseFloat(discountValue);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  const handleSave = () => {
    if (!isDiscountValid()) {
      setShowError(true);
      return;
    }

    const numDiscount = parseFloat(discountValue);

    if (onSave) {
      onSave(numDiscount);
    }

    setDiscountValue("");
    setShowError(false);
    setHasTyped(false);
    setIsModalOpen(false);
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
      variant: "outline" as const
    },
    {
      label: "Save",
      onClick: handleSave,
      variant: "default" as const
    }
  ];

  return (
    <>
      <InfoCard 
        title="Discount (%)" 
        onAddClick={handleAddClick}
        className={className}
        loading={loading}
      >
        <div className="space-y-2">
          {loading ? (
            <Skeleton className="h-6 w-16" />
          ) : discount > 0 ? (
            <span className="font-semibold">{discount}%</span>
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