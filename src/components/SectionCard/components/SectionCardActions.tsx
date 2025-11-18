import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Eye,
  EyeOff,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { DropdownOption } from "../types";

/**
 * Helper component for creating a view toggle button
 */
interface ViewToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  ariaLabel?: string;
  activeIcon?: React.ReactNode;
  inactiveIcon?: React.ReactNode;
}

export function ViewToggleButton({
  isActive,
  onClick,
  ariaLabel = "View details",
  activeIcon,
  inactiveIcon,
}: ViewToggleButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {isActive
        ? activeIcon ?? <EyeOff className="h-4 w-4" />
        : inactiveIcon ?? <Eye className="h-4 w-4" />}
    </Button>
  );
}

/**
 * Helper component for creating an add button
 */
interface AddButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

export function AddButton({
  onClick,
  ariaLabel = "Add item",
}: AddButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <Plus className="h-4 w-4" />
    </Button>
  );
}

/**
 * Helper component for creating an edit button
 */
interface EditButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

export function EditButton({
  onClick,
  ariaLabel = "Edit section",
}: EditButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <Pencil className="h-4 w-4" />
    </Button>
  );
}

/**
 * Helper component for creating a delete button
 */
interface DeleteButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

export function DeleteButton({
  onClick,
  ariaLabel = "Delete item",
}: DeleteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

/**
 * Helper component for creating a dropdown menu
 */
interface ActionsDropdownProps {
  options: DropdownOption[];
}

export function ActionsDropdown({ options }: ActionsDropdownProps) {
  if (options.length === 0) return null;

  return (
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
        {options.map((option) => (
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
  );
}

