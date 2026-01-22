"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  id?: string;
  options: SearchableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loadingText?: string;
  noResultsText?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SearchableSelect({
  id,
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No options available",
  loadingText = "Loading...",
  noResultsText = "No results found",
  className,
  disabled = false,
  isLoading = false,
  onOpenChange,
}: SearchableSelectProps) {
  const [search, setSearch] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const query = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, search]);

  // Auto-focus search when dropdown opens
  React.useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  // Clear search when closing
  React.useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
  };

  const effectivePlaceholder = isLoading ? loadingText : placeholder;

  return (
    <Select
      value={value ?? ""}
      onValueChange={handleValueChange}
      disabled={disabled || isLoading}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger id={id} className={cn("h-9 w-full", className)}>
        <SelectValue placeholder={effectivePlaceholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {/* Search input */}
        <div className="sticky top-0 z-10 bg-background border-b px-2 py-2">
          <Input
            ref={searchInputRef}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
          />
        </div>

        {isLoading ? (
          <SelectItem value="__loading" disabled>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{loadingText}</span>
            </div>
          </SelectItem>
        ) : filteredOptions.length === 0 ? (
          <SelectItem value="__empty" disabled>
            {search ? noResultsText : emptyText}
          </SelectItem>
        ) : (
          filteredOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
