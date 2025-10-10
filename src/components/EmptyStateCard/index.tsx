import React from "react";
import { InfoCard } from "@/components/InfoCard";

interface EmptyStateCardProps {
  title: string;
  emptyMessage: string;
  onAddClick?: () => void;
  className?: string;
}

export function EmptyStateCard({ 
  title, 
  emptyMessage, 
  onAddClick,
  className 
}: EmptyStateCardProps) {
  return (
    <InfoCard 
      title={title} 
      onAddClick={onAddClick}
      className={className}
    >
      <div className="space-y-2">
        <div className="text-sm text-gray-500">{emptyMessage}</div>
      </div>
    </InfoCard>
  );
}
