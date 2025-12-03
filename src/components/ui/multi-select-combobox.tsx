"use client"

import React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface MultiSelectComboboxProps {
  options: Array<{
    value: string
    label: string
  }>
  value?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  selectAllLabel?: string
}

export function MultiSelectCombobox({
  options,
  value = [],
  onValueChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  className,
  disabled = false,
  selectAllLabel = "Select all",
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onValueChange?.(newValue)
  }

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onValueChange?.([])
    } else {
      onValueChange?.(options.map((opt) => opt.value))
    }
  }

  const handleRemove = (optionValue: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    onValueChange?.(value.filter((v) => v !== optionValue))
  }

  const selectedOptions = options.filter((opt) => value.includes(opt.value))

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return options
    }
    const query = searchQuery.toLowerCase()
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(query)
    )
  }, [options, searchQuery])

  // Reset search when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("")
    }
  }, [open])


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between min-h-[40px] h-auto", className)}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1 items-center min-h-[24px]">
            {selectedOptions.length > 0 ? (
              <>
                {selectedOptions.slice(0, 3).map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="mr-1 text-xs"
                  >
                    {option.label}
                    <span
                      role="button"
                      tabIndex={0}
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRemove(option.value, e)
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={(e) => handleRemove(option.value, e)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </span>
                  </Badge>
                ))}
                {selectedOptions.length > 3 && (
                  <Badge variant="secondary" className="mr-1 text-xs">
                    +{selectedOptions.length - 3} more
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-muted-foreground text-sm">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0" 
        align="start"
        onOpenAutoFocus={(e) => {
          // Prevent auto focus on input to allow natural scrolling
          e.preventDefault()
        }}
      >
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b px-3 py-2">
            <Input
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false)
                }
              }}
            />
          </div>

          {/* Options List with proper scrolling */}
          <div 
            ref={scrollContainerRef}
            className="max-h-[300px] overflow-y-auto overflow-x-hidden focus:outline-none"
            tabIndex={-1}
            style={{ 
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth'
            }}
            onMouseEnter={() => {
              // Focus the container when mouse enters to ensure it can receive wheel events
              scrollContainerRef.current?.focus()
            }}
            onWheel={(e) => {
              const container = scrollContainerRef.current
              if (!container) {
                return
              }

              const { scrollTop, scrollHeight, clientHeight } = container
              const isAtTop = scrollTop === 0
              const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1

              // If we're at the boundaries and scrolling in that direction, allow default
              if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                return
              }

              // Otherwise, scroll the container
              container.scrollTop = scrollTop + e.deltaY
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <div className="p-1">
              {/* Select All Option */}
              <div
                className="px-2 py-1.5 cursor-pointer hover:bg-accent transition-colors rounded-sm"
                onClick={handleSelectAll}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      value.length === options.length
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50"
                    )}
                  >
                    {value.length === options.length && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-medium text-sm">{selectAllLabel}</span>
                </div>
              </div>
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {emptyText}
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value)
                  return (
                    <div
                      key={option.value}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors",
                        isSelected && "bg-accent"
                      )}
                      onClick={() => handleSelect(option.value)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50"
                        )}
                      >
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                      {option.label}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

