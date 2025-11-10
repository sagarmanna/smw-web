"use client";

import React, { useState } from "react";
import { InfoCard } from "@/components/InfoCard";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { formatCurrency } from "@/utils/formatCurrency";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { createCustomerOpeningBalance } from "./opening-balance.api";

interface OpeningBalanceCardProps {
  amount?: number;
  hasBalance?: boolean;
  customerId?: string;
  openingBalanceId?: string | number; // This should be the opening balance invoice ID
  location?: string;
  onAddClick?: () => void;
  onSave?: (amount: number, balanceType: "owing" | "credit", invoiceId: number) => void;
  className?: string;
  loading?: boolean;
}

export function OpeningBalanceCard({ 
  amount = 0, 
  hasBalance = false,
  customerId,
  openingBalanceId, // Invoice ID from openingBalance.id
  location,
  onAddClick, 
  onSave,
  className,
  loading = false
}: OpeningBalanceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceType, setBalanceType] = useState<"owing" | "credit" | null>(null);
  const [showError, setShowError] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Determine display values based on amount
  const displayAmount = Math.abs(amount);
  // Format with sign
  const formattedAmount = amount < 0 
    ? `-${formatCurrency(displayAmount)}` 
    : `+${formatCurrency(displayAmount)}`;

  const handleAddClick = () => {
    setIsModalOpen(true);
    if (onAddClick) {
      onAddClick();
    }
  };

  const handleViewClick = () => {
    // Use openingBalanceId (which is openingBalance.id from the API response)
    if (openingBalanceId && location) {
      const url = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/invoice/view?id=${openingBalanceId}`;
      window.open(url, '_blank');
    }
  };

  const isAmountValid = balanceAmount.trim() !== "" && !isNaN(parseFloat(balanceAmount)) && parseFloat(balanceAmount) >= 0.1;
  const isTypeSelected = balanceType !== null;

  const handleSave = async () => {
    // Show error state if validation fails
    if (!isAmountValid || !isTypeSelected) {
      setShowError(true);
      return;
    }

    if (!location || !customerId) {
      toast.error("Missing location or customer ID");
      return;
    }

    setIsSaving(true);

    try {
      const numAmount = parseFloat(balanceAmount);
      const isCredit = balanceType === "credit";

      const result = await createCustomerOpeningBalance(
        location,
        Number(customerId),
        numAmount,
        isCredit
      );

      if (result?.success) {
        toast.success("Opening balance created successfully");
        
        // Call onSave callback with the new invoice ID from the response
        if (onSave && result.data?.invoiceId) {
          onSave(numAmount, balanceType, result.data.invoiceId);
        }

        // Reset and close
        setBalanceAmount("");
        setBalanceType(null);
        setShowError(false);
        setHasTyped(false);
        setIsModalOpen(false);
      } else {
        toast.error(result?.message || "Failed to create opening balance");
      }
    } catch (error) {
      console.error("Error creating opening balance:", error);
      toast.error("Failed to create opening balance");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setBalanceAmount("");
    setBalanceType(null);
    setShowError(false);
    setHasTyped(false);
    setIsModalOpen(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBalanceAmount(value);
    setHasTyped(true);
  };

  const handleTypeSelect = (type: "owing" | "credit") => {
    setBalanceType(type);
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
        title="Opening Balance" 
        onAddClick={!hasBalance ? handleAddClick : undefined}
        showAddButton={!hasBalance}
        className={className}
        loading={loading}
      >
        {loading ? (
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ) : hasBalance ? (
          <div className="flex items-center justify-between">
            <KeyValueDisplay 
              label="Amount" 
              value={formattedAmount}
              className="justify-start flex-1"
            />
            {/* View button - only show if openingBalanceId exists */}
            {openingBalanceId && (
              <button
                onClick={handleViewClick}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="View opening balance"
                title="View opening balance"
              >
                <Eye className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No opening balance set</p>
        )}
      </InfoCard>

      <ReusableModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Opening Balance"
        size="sm"
        actions={modalActions}
        showFooter={true}
      >
        <div className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label 
              htmlFor="amount" 
              className={`text-sm font-medium ${
                hasTyped && balanceAmount.trim() !== "" && !isAmountValid 
                  ? "text-red-500 dark:text-red-400" 
                  : isAmountValid 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              Amount (minimum 0.1)
            </Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              value={balanceAmount}
              onChange={handleAmountChange}
              className={`text-right focus:ring-0 focus:outline-none ${
                hasTyped && balanceAmount.trim() !== "" && !isAmountValid 
                  ? "border-red-500 dark:border-red-400 text-gray-500 dark:text-gray-400" 
                  : isAmountValid 
                  ? "border-green-600 dark:border-green-400 text-gray-900 dark:text-gray-100" 
                  : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
              }`}
              style={{
                boxShadow: 'none'
              }}
              placeholder="0.00"
              disabled={isSaving}
            />
            {hasTyped && balanceAmount.trim() !== "" && !isAmountValid && (
              <p className="text-sm text-red-500 dark:text-red-400">
                Amount must be at least 0.1
              </p>
            )}
            {showError && balanceAmount.trim() === "" && (
              <p className="text-sm text-red-500 dark:text-red-400">
                Amount cannot be blank.
              </p>
            )}
          </div>

          {/* Balance Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Balance Type</Label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleTypeSelect("owing")}
                className={`flex items-center space-x-2 ${
                  balanceType === "owing"
                    ? "text-[#f3573f]" 
                    : showError && !isTypeSelected
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
                disabled={isSaving}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  balanceType === "owing" 
                    ? "border-[#f3573f]" 
                    : showError && !isTypeSelected
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-400 dark:border-gray-500"
                }`}>
                  {balanceType === "owing" && (
                    <div className="w-2 h-2 rounded-full bg-[#f3573f]"></div>
                  )}
                </div>
                <span className="text-sm font-normal">Owing</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect("credit")}
                className={`flex items-center space-x-2 ${
                  balanceType === "credit"
                    ? "text-[#f3573f]" 
                    : showError && !isTypeSelected
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
                disabled={isSaving}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  balanceType === "credit" 
                    ? "border-[#f3573f]" 
                    : showError && !isTypeSelected
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-400 dark:border-gray-500"
                }`}>
                  {balanceType === "credit" && (
                    <div className="w-2 h-2 rounded-full bg-[#f3573f]"></div>
                  )}
                </div>
                <span className="text-sm font-normal">Credit</span>
              </button>
            </div>
            {showError && !isTypeSelected && (
              <p className="text-sm text-red-500 dark:text-red-400">
                Please select a balance type.
              </p>
            )}
          </div>
        </div>
      </ReusableModal>
    </>
  );
}