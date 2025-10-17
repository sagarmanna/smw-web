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
  
  // Actions configuration
  actionMenuGroups: ActionMenuGroup[];
  actionButtonAriaLabel?: string;
  
  // Optional styling
  className?: string;
}

export function DetailHeader({
  breadcrumbItems,
  currentPageTitle,
  loading = false,
  actionMenuGroups,
  actionButtonAriaLabel = "Actions",
  className = "",
}: DetailHeaderProps) {
  return (
    <div className={`flex items-center justify-between py-3 sm:py-4 ${className}`}>
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
                      className="text-lg text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
                    >
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="truncate max-w-[60vw] sm:max-w-[40vw] md:max-w-none">
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
                          Loading...
                        </span>
                      ) : (
                        item.label
                      )}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && (
                  <Slash className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mx-1 sm:mx-2 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
            {currentPageTitle && (
              <>
                <Slash className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mx-1 sm:mx-2 flex-shrink-0" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate max-w-[60vw] sm:max-w-[40vw] md:max-w-none font-semibold text-gray-900">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
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
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200" 
              aria-label={actionButtonAriaLabel}
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 sm:w-64 p-1 bg-white border border-gray-200 shadow-lg rounded-lg"
            sideOffset={8}
          >
            {actionMenuGroups.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                {group.label && (
                  <>
                    <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {group.label}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
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
                        ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }
                      ${item.disabled ? "opacity-50 cursor-not-allowed hover:bg-transparent" : ""}
                    `}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
                {group.separator && groupIndex < actionMenuGroups.length - 1 && (
                  <DropdownMenuSeparator className="my-1" />
                )}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
