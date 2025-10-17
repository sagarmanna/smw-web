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
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-md px-2 sm:px-3 py-2 ${className}`}>
      {/* Breadcrumb Section */}
      <Breadcrumb>
        <BreadcrumbList className="text-xs sm:text-sm">
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
                  >
                    <span className="lg:text-lg font-medium text-blue-500">{item.label}</span>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate max-w-[70vw] sm:max-w-none">
                    {loading ? "Loading..." : item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < breadcrumbItems.length - 1 && (
                <Slash className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline" />
              )}
            </React.Fragment>
          ))}
          {currentPageTitle && (
            <>
              <Slash className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline" />
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate max-w-[70vw] sm:max-w-none">
                  {loading ? "Loading..." : currentPageTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Actions Section */}
      <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 sm:h-8 sm:w-8" 
              aria-label={actionButtonAriaLabel}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {actionMenuGroups.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                {group.label && (
                  <>
                    <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                {group.items.map((item, itemIndex) => (
                  <DropdownMenuItem
                    key={itemIndex}
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={item.variant === "destructive" ? "text-red-600" : ""}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
                {group.separator && groupIndex < actionMenuGroups.length - 1 && (
                  <DropdownMenuSeparator />
                )}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
