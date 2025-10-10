import React from "react";
import { InfoCard } from "@/components/InfoCard";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { formatCurrency } from "@/utils/formatCurrency";

interface OpeningBalanceCardProps {
  amount?: number;
  onAddClick?: () => void;
  className?: string;
}

export function OpeningBalanceCard({ 
  amount = 0, 
  onAddClick, 
  className 
}: OpeningBalanceCardProps) {
  return (
    <InfoCard 
      title="Opening Balance" 
      onAddClick={onAddClick}
      className={className}
    >
      <KeyValueDisplay 
        label="Amount" 
        value={formatCurrency(amount)} 
      />
    </InfoCard>
  );
}
