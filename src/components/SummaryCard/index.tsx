"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBackgroundColor?: string;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
}

export function SummaryCard({
  title,
  value,
  icon,
  iconBackgroundColor = "bg-blue-500",
  loading = false,
  className,
  onClick,
  trend,
}: SummaryCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200",
        "hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50",
        "border border-gray-200/60 dark:border-gray-700/60",
        "bg-white dark:bg-gray-800",
        onClick && "cursor-pointer hover:border-gray-300/80 dark:hover:border-gray-600/80",
        className
      )}
      onClick={onClick}
    >
      <div className="flex h-full">
        {icon && (
          <div className={cn(
            "flex items-center justify-center flex-shrink-0",
            "p-3 sm:p-4",
            iconBackgroundColor
          )}>
            <div className="h-5 w-5 sm:h-6 sm:w-6 text-white">
              {icon}
            </div>
          </div>
        )}
        <div className="flex-1 p-3 sm:p-4 min-w-0">
          <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide truncate">
            {title}
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1 truncate">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400" />
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading...</span>
              </div>
            ) : (
              value
            )}
          </div>
          {trend && (
            <div className="flex items-center gap-1 mt-1 text-xs sm:text-sm">
              <span className={cn(
                "font-medium",
                trend.isPositive 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-gray-500 dark:text-gray-400 ml-1 truncate">{trend.label}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
