"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Slash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

export interface ActionMenuGroup {
  label?: string;
  items: ActionMenuItem[];
  separator?: boolean;
}

export interface DetailHeaderProps {
  // Breadcrumb configuration
  breadcrumbItems: {
    label: string;
    href?: string;
    onClick?: () => void;
  }[];
  currentPageTitle: string;
  loading?: boolean;
  showActions?: boolean;
  // Actions configuration
  actionMenuGroups?: ActionMenuGroup[];
  actionButtonAriaLabel?: string;
  
  // Optional left-side custom content (e.g., status badge)
  leftContent?: React.ReactNode;
  
  // Optional right-side custom content (e.g., a print button)
  rightContent?: React.ReactNode;
  
  // Optional styling
  className?: string;
}

export function DetailHeader({
  breadcrumbItems,
  currentPageTitle,
  loading = false,
  actionMenuGroups = [],
  actionButtonAriaLabel = "Action",
  showActions = true,
  leftContent,
  rightContent,
  className = "",
}: DetailHeaderProps) {
  return (
    <div className={`flex items-center justify-between py-3 sm:py-4 ${className}`}>
      {/* Left Content Section */}
      {leftContent && (
        <div className="flex-shrink-0 mr-4">
          {leftContent}
        </div>
      )}
      
      {/* Breadcrumb Section */}
      <div className="flex-1 min-w-0">
        <Breadcrumb>
          <BreadcrumbList className="text-sm sm:text-base">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href || item.onClick ? (
                    <BreadcrumbLink 
                      href={item.href || "#"} 
                      onClick={(e) => {
                        if (item.onClick) {
                          e.preventDefault();
                          item.onClick();
                        }
                      }}
                      className="text-lg text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-150"
                    >
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="truncate max-w-[60vw] sm:max-w-[40vw] md:max-w-none text-gray-700 dark:text-gray-300">
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400" />
                          Loading...
                        </span>
                      ) : (
                        item.label
                      )}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && (
                  <Slash className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500 mx-1 sm:mx-2 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
            {currentPageTitle && (
              <>
                <Slash className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 dark:text-gray-500 mx-1 sm:mx-2 flex-shrink-0" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate max-w-[60vw] sm:max-w-[40vw] md:max-w-none font-semibold text-gray-900 dark:text-gray-100">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400" />
                        Loading...
                      </span>
                    ) : (
                      currentPageTitle
                    )}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Actions Section */}
      {rightContent ? (
        <div className="flex-shrink-0">
          {rightContent}
        </div>
      ) : showActions && actionMenuGroups.length > 0 ? (
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200" 
                aria-label={actionButtonAriaLabel}
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 sm:w-64 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg"
              sideOffset={8}
            >
              {actionMenuGroups.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  {group.label && (
                    <>
                      <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {group.label}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-1 bg-gray-200 dark:bg-gray-700" />
                    </>
                  )}
                  {group.items.map((item, itemIndex) => (
                    <DropdownMenuItem
                      key={itemIndex}
                      onClick={item.onClick}
                      disabled={item.disabled}
                      className={`
                        px-3 py-2 text-sm cursor-pointer rounded-md mx-1 transition-colors duration-150
                        ${item.variant === "destructive" 
                          ? "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" 
                          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"}
                        ${item.disabled ? "opacity-50 cursor-not-allowed hover:bg-transparent" : ""}
                      `}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                  {group.separator && groupIndex < actionMenuGroups.length - 1 && (
                    <DropdownMenuSeparator className="my-1 bg-gray-200 dark:bg-gray-700" />
                  )}
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
    </div>
  );
}
