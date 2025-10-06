"use client";

import * as React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  onRefresh: () => void;
  refreshButtonText?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, onRefresh, refreshButtonText = "Refresh Data" }) => (
  <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
    <div className="text-center max-w-md">
      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      <button
        onClick={onRefresh}
        className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700"
      >
        {refreshButtonText}
      </button>
    </div>
  </div>
);

interface ReportPageLayoutProps {
  title: string;
  subtitle: string;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  children: React.ReactNode;
}

export const ReportPageLayout: React.FC<ReportPageLayoutProps> = ({
  title,
  subtitle,
  isLoading,
  error,
  onRetry,
  children,
}) => {
  return (
    <div className="w-full">
      <div className="mx-auto">
        {/* Heading */}
        <div className="mb-4 sm:mb-6 px-2 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {subtitle}
              </p>
            </div>
          </div>
          {error && (
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-xs sm:text-sm text-red-700 dark:text-red-400">
              <span className="break-words">Failed to load data: {error}</span>
              <button
                onClick={onRetry}
                className="rounded bg-red-100 dark:bg-red-800 px-3 py-1.5 text-xs hover:bg-red-200 dark:hover:bg-red-700 whitespace-nowrap self-start sm:self-auto"
              >
                Retry
              </button>
            </div>
          )}
        </div>
        
        {children}
      </div>
    </div>
  );
};
