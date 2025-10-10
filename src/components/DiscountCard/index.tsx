import React from "react";
import { InfoCard } from "@/components/InfoCard";

interface DiscountCardProps {
  onAddClick?: () => void;
  className?: string;
}

export function DiscountCard({ onAddClick, className }: DiscountCardProps) {
  return (
    <InfoCard 
      title="Discount (%)" 
      onAddClick={onAddClick}
      className={className}
    >
      <div className="space-y-2">
        <span className="font-semibold">Discount</span>
      </div>
    </InfoCard>
  );
}
