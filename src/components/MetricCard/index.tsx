"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DollarSign } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBackgroundColor?: string;
  loading?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  iconBackgroundColor = "bg-blue-500",
  loading = false,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex">
        {icon && (
          <div className={cn("p-4 flex items-center justify-center", iconBackgroundColor)}>
            {icon}
          </div>
        )}
        <div className="flex-1 p-4">
          <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">
            {loading ? "..." : value}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Predefined metric cards for common financial metrics
export function LessonsDueCard({ value, loading }: { value: string | number; loading?: boolean }) {
  return (
    <MetricCard
      title="Lessons Due"
      value={value}
      loading={loading}
      iconBackgroundColor="bg-cyan-500"
      icon={<DollarSign className="h-10 w-10 text-white" />}
    />
  );
}

export function OutstandingInvoiceCard({ value, loading }: { value: string | number; loading?: boolean }) {
  return (
    <MetricCard
      title="Outstanding Invoice"
      value={value}
      loading={loading}
      iconBackgroundColor="bg-orange-500"
      icon={<DollarSign className="h-10 w-10 text-white" />}
    />
  );
}

export function CreditsCard({ value, loading }: { value: string | number; loading?: boolean }) {
  return (
    <MetricCard
      title="Credits"
      value={value}
      loading={loading}
      iconBackgroundColor="bg-green-500"
      icon={<DollarSign className="h-10 w-10 text-white" />}
    />
  );
}

export function BalanceCard({ value, loading }: { value: string | number; loading?: boolean }) {
  return (
    <MetricCard
      title="Balance"
      value={value}
      loading={loading}
      iconBackgroundColor="bg-orange-400"
      icon={<DollarSign className="h-10 w-10 text-white" />}
    />
  );
}
