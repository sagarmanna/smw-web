"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ColorPickerDialog } from "./ColorPickerDialog";
import type { CalendarEventColorItem } from "../../calendarEventColor.api";

// Validation schema
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

const calendarEventColorItemSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(hexColorRegex, "Invalid hex color code"),
});

const calendarEventColorSchema = z.object({
  items: z.array(calendarEventColorItemSchema).min(1, "At least one item is required"),
});

type CalendarEventColorFormData = z.infer<typeof calendarEventColorSchema>;

interface CalendarEventColorFormProps {
  items: CalendarEventColorItem[];
  onSubmit: (items: CalendarEventColorItem[]) => Promise<void> | void;
  isLoading?: boolean;
}

export function CalendarEventColorForm({
  items,
  onSubmit,
  isLoading = false,
}: CalendarEventColorFormProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CalendarEventColorFormData>({
    resolver: zodResolver(calendarEventColorSchema),
    defaultValues: { items },
    mode: "onChange",
  });

  // Reset form when API items change (when API data loads / refreshes)
  React.useEffect(() => {
    reset({ items });
  }, [items, reset]);

  const formItems = watch("items");

  const setItemColor = (index: number, color: string) => {
    setValue(`items.${index}.color`, color, { shouldValidate: true });
  };

  const handleHexInputChange = (index: number, value: string) => {
    // Allow partial input while typing
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === "") {
      setValue(`items.${index}.color`, value, { shouldValidate: false });
    }
  };

  const handleHexInputBlur = (index: number) => {
    const value = formItems?.[index]?.color;
    // Ensure value starts with # and pad to 6 digits if needed
    if (value && value.startsWith("#")) {
      const hexPart = value.slice(1);
      if (hexPart.length === 6) {
        setValue(`items.${index}.color`, value, { shouldValidate: true });
      } else if (hexPart.length > 0 && hexPart.length < 6) {
        // Pad with zeros
        const padded = hexPart.padEnd(6, "0");
        setValue(`items.${index}.color`, `#${padded}`, { shouldValidate: true });
      }
    } else if (value && !value.startsWith("#")) {
      // Add # if missing
      setValue(`items.${index}.color`, `#${value}`, { shouldValidate: true });
    }
  };

  const onFormSubmit = async (data: CalendarEventColorFormData) => {
    try {
      await onSubmit(data.items);
      toast.success("Calendar event colors saved successfully");
    } catch (error) {
      toast.error("Failed to save calendar event colors");
      console.error("Error saving calendar event colors:", error);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onFormSubmit)} className="w-full space-y-3">
        <div className="space-y-3">
          {(formItems || []).map((item, index) => {
            const fieldError = errors.items?.[index]?.color;
            const currentValue = item?.color || "";
            const pickerOpen = openIndex === index;

            return (
              <div key={item?.id ?? index} className="w-full">
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
                  <Label className="text-sm font-medium min-w-[200px] sm:min-w-[220px] flex-shrink-0">
                    {item?.name}
                  </Label>
                  <div className="flex items-center justify-end gap-3 flex-1">
                    <Popover
                      open={pickerOpen}
                      onOpenChange={(open) => setOpenIndex(open ? index : null)}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "flex items-center gap-1.5 h-9 px-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors bg-white dark:bg-gray-900",
                            fieldError && "border-red-500"
                          )}
                        >
                          <div
                            className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0"
                            style={{ backgroundColor: currentValue || "transparent" }}
                          />
                          <ChevronDown className="h-4 w-4 opacity-50 text-gray-600 dark:text-gray-400" />
                        </button>
                      </PopoverTrigger>
                      <ColorPickerDialog
                        value={currentValue}
                        onChange={(color) => setItemColor(index, color)}
                        onClose={() => setOpenIndex(null)}
                      />
                    </Popover>
                    <div className="flex-1 min-w-[260px] max-w-[520px]">
                      <Input
                        type="text"
                        value={currentValue}
                        onChange={(e) => handleHexInputChange(index, e.target.value)}
                        onBlur={() => handleHexInputBlur(index)}
                        className={cn(
                          "h-9 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600",
                          fieldError && "border-red-500 focus-visible:ring-red-500"
                        )}
                        placeholder="#000000"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>
                {fieldError && (
                  <p className="text-sm text-red-500 mt-1 ml-[220px]">{fieldError.message}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting || isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}

