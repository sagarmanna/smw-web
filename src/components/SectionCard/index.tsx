"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { SectionCardProps, SectionCardDataRow } from "./types";

const isDataRowArray = (
  data: SectionCardProps["data"]
): data is SectionCardDataRow[] => {
  return Array.isArray(data);
};

export function SectionCard({
  title,
  data,
  children,
  className,
  isLoading = false,
  emptyState,
  showEdit = false,
  onEditClick,
  editAriaLabel = "Edit section",
  showDropDown = false,
  dropdownOptions = [],
  showView = false,
  onViewClick,
  viewAriaLabel = "View details",
  viewIsActive = false,
  viewActiveIcon,
  viewInactiveIcon,
  showCreateModal = false,
  renderCreateModal,
  showDeleteModal = false,
  renderDeleteModal,
  showAddButton = false,
  onAddClick,
  addButtonAriaLabel = "Add item",
  headerContent,
  footer,
}: SectionCardProps) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const handleOpenCreate = React.useCallback(() => setIsCreateOpen(true), []);
  const handleCloseCreate = React.useCallback(() => setIsCreateOpen(false), []);

  const handleOpenDelete = React.useCallback(() => setIsDeleteOpen(true), []);
  const handleCloseDelete = React.useCallback(() => setIsDeleteOpen(false), []);

  const shouldRenderEmptyState =
    !isLoading &&
    !children &&
    (data === undefined ||
      (isDataRowArray(data) && data.length === 0) ||
      (React.isValidElement(data) && data === null));

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            {title}
          </CardTitle>
          {headerContent}
        </div>
        <div className="flex items-center gap-2">
          {showView && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              aria-label={viewAriaLabel}
              onClick={onViewClick}
            >
              {viewIsActive
                ? viewActiveIcon ?? <EyeOff className="h-4 w-4" />
                : viewInactiveIcon ?? <Eye className="h-4 w-4" />}
            </Button>
          )}

          {showCreateModal && renderCreateModal && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                aria-label={addButtonAriaLabel}
                onClick={handleOpenCreate}
              >
                <Plus className="h-4 w-4" />
              </Button>
              {renderCreateModal({
                isOpen: isCreateOpen,
                open: handleOpenCreate,
                close: handleCloseCreate,
              })}
            </>
          )}

          {showAddButton && !showCreateModal && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              aria-label={addButtonAriaLabel}
              onClick={onAddClick}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}

          {showEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              aria-label={editAriaLabel}
              onClick={onEditClick}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}

          {showDropDown && dropdownOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {dropdownOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.title}
                    onClick={option.onClick}
                    disabled={option.disabled}
                    className={cn(option.destructive && "text-destructive")}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span>{option.title}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showDeleteModal && renderDeleteModal && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                aria-label="Delete item"
                onClick={handleOpenDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {renderDeleteModal({
                isOpen: isDeleteOpen,
                open: handleOpenDelete,
                close: handleCloseDelete,
              })}
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : shouldRenderEmptyState ? (
          <div className="py-4 text-sm text-muted-foreground">
            {emptyState ?? "No information available."}
          </div>
        ) : (
          <>
            {isDataRowArray(data) ? (
              <dl className="divide-y divide-border text-sm">
                {data.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-3 items-start gap-4 py-2 sm:grid-cols-4"
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
                      {item.label}
                    </dt>
                    <dd className="col-span-2 text-sm text-foreground sm:col-span-3">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              data ?? children
            )}
          </>
        )}
        {footer && <div className="mt-4">{footer}</div>}
      </CardContent>
    </Card>
  );
}

