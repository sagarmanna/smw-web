import React, { useState } from "react";
import { InfoCard } from "@/components/InfoCard";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { formatCurrency } from "@/utils/formatCurrency";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OpeningBalanceCardProps {
  amount?: number;
  onAddClick?: () => void;
  onSave?: (amount: number, type: "owing" | "credit") => void;
  className?: string;
}

export function OpeningBalanceCard({ 
  amount = 0, 
  onAddClick, 
  onSave,
  className 
}: OpeningBalanceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceType, setBalanceType] = useState<"owing" | "credit" | null>(null);
  const [showError, setShowError] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);

  const handleAddClick = () => {
    setIsModalOpen(true);
    if (onAddClick) {
      onAddClick();
    }
  };

  const isAmountValid = balanceAmount.trim() !== "" && !isNaN(parseFloat(balanceAmount)) && parseFloat(balanceAmount) >= 0;
  const isTypeSelected = balanceType !== null;

  const handleSave = () => {
    // Show error state if validation fails
    if (!isAmountValid || !isTypeSelected) {
      setShowError(true);
      return;
    }

    const numAmount = parseFloat(balanceAmount);

    // Call onSave callback if provided
    if (onSave) {
      onSave(numAmount, balanceType);
    }

    // Reset and close
    setBalanceAmount("");
    setBalanceType(null);
    setShowError(false);
    setHasTyped(false);
    setIsModalOpen(false);
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

  return (
    <>
      <InfoCard 
        title="Opening Balance" 
        onAddClick={handleAddClick}
        className={className}
      >
        <KeyValueDisplay 
          label="Amount" 
          value={formatCurrency(amount)} 
        />
      </InfoCard>

      <ReusableModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Opening Balance"
        size="sm"
        showFooter={false}
      >
        <div className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label 
              htmlFor="amount" 
              className={`text-sm font-medium ${
                hasTyped && balanceAmount.trim() !== "" && !isAmountValid 
                  ? "text-red-600" 
                  : isAmountValid 
                  ? "text-green-600" 
                  : "text-gray-700"
              }`}
            >
              Amount
            </Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              value={balanceAmount}
              onChange={handleAmountChange}
              className={`text-right focus:ring-0 focus:outline-none ${
                hasTyped && balanceAmount.trim() !== "" && !isAmountValid 
                  ? "border-red-600 text-gray-500" 
                  : isAmountValid 
                  ? "border-green-600 text-blue-600" 
                  : "border-gray-300 text-gray-500"
              }`}
              style={{
                boxShadow: 'none'
              }}
              placeholder="0.00"
            />
            {hasTyped && balanceAmount.trim() !== "" && !isAmountValid && (
              <p className="text-sm text-red-600">
                Amount must be a number.
              </p>
            )}
            {showError && balanceAmount.trim() === "" && (
              <p className="text-sm text-red-600">
                Amount cannot be blank.
              </p>
            )}
          </div>

          {/* Balance Type Buttons */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleTypeSelect("owing")}
                className={`flex items-center space-x-2 ${
                  balanceType === "owing"
                    ? "text-green-600" 
                    : showError && !isTypeSelected
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  balanceType === "owing" 
                    ? "border-green-600" 
                    : showError && !isTypeSelected
                    ? "border-red-600"
                    : "border-gray-400"
                }`}>
                  {balanceType === "owing" && (
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  )}
                </div>
                <span className="font-normal">Owing</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect("credit")}
                className={`flex items-center space-x-2 ${
                  balanceType === "credit"
                    ? "text-green-600" 
                    : showError && !isTypeSelected
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  balanceType === "credit" 
                    ? "border-green-600" 
                    : showError && !isTypeSelected
                    ? "border-red-600"
                    : "border-gray-400"
                }`}>
                  {balanceType === "credit" && (
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  )}
                </div>
                <span className="font-normal">Credit</span>
              </button>
            </div>
            {showError && !isTypeSelected && (
              <p className="text-sm text-red-600">
                Please select a balance type.
              </p>
            )}
          </div>

          {/* Custom Footer */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-500 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              Save
            </button>
          </div>
        </div>
      </ReusableModal>
    </>
  );
}