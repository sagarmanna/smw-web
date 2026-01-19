"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { EnrolmentSchedule } from "../../types";
import { toast } from "sonner";
import { getAdjustEndDatePreview, getGroupAdjustEndDatePreview, type PreviewItem } from "../../[id]/enrolment-details.api";
import { Loader2 } from "lucide-react";

interface AdjustEndDateModalProps {
  open: boolean;
  onClose: () => void;
  schedule: EnrolmentSchedule | null;
  onSubmit: (endDate: string) => Promise<boolean>;
  saving?: boolean;
  enrolmentType?: "private" | "group";
  location: string;
  enrolmentId: string;
}

export function AdjustEndDateModal({
  open,
  onClose,
  schedule,
  onSubmit,
  saving = false,
  enrolmentType = "private",
  location,
  enrolmentId,
}: AdjustEndDateModalProps) {
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [error, setError] = React.useState<string>("");
  const [preview, setPreview] = React.useState<{
    action: 'shrink' | 'extend' | null;
    dateRange: string | null;
    previewItems: PreviewItem[];
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = React.useState(false);

  // Parse date string to Date object
  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    try {
      // Try parsing common date formats
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  };

  // Format Date to string (YYYY-MM-DD)
  const formatDateToString = (date: Date | undefined): string => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  React.useEffect(() => {
    if (open && schedule?.endDate) {
      const parsed = parseDate(schedule.endDate);
      setEndDate(parsed);
      setError("");
      setPreview(null);
    } else if (!open) {
      setEndDate(undefined);
      setError("");
      setPreview(null);
    }
  }, [open, schedule]);

  // Store current end date string for comparison
  const currentEndDateString = React.useMemo(() => {
    if (!schedule?.endDate) return null;
    const parsed = parseDate(schedule.endDate);
    return parsed ? formatDateToString(parsed) : null;
  }, [schedule?.endDate]);

  // Fetch preview when endDate changes
  React.useEffect(() => {
    // Don't fetch if modal is closed
    if (!open) {
      setPreview(null);
      return;
    }

    // Don't fetch if no date selected or no current end date
    if (!endDate || !currentEndDateString) {
      setPreview(null);
      return;
    }

    // Compare dates as strings (YYYY-MM-DD) to avoid timezone issues
    const newDateString = formatDateToString(endDate);

    // Don't fetch preview if dates are the same
    if (newDateString === currentEndDateString) {
      setPreview(null);
      return;
    }

    // For group enrolments: don't fetch preview if trying to extend
    const currentEndDate = parseDate(schedule?.endDate || "");
    if (enrolmentType === "group" && currentEndDate && endDate > currentEndDate) {
      setPreview(null);
      return;
    }

    const fetchPreview = async () => {
      setLoadingPreview(true);
      try {
        console.log("Fetching preview for date:", newDateString, "enrolmentType:", enrolmentType, "location:", location, "enrolmentId:", enrolmentId);
        const previewResponse = enrolmentType === "group"
          ? await getGroupAdjustEndDatePreview(location, enrolmentId, newDateString)
          : await getAdjustEndDatePreview(location, enrolmentId, newDateString);
        
        console.log("Preview response:", previewResponse);
        if (previewResponse?.success && previewResponse.data) {
          setPreview(previewResponse.data);
        } else {
          setPreview(null);
        }
      } catch (error) {
        console.error("Failed to fetch preview:", error);
        setPreview(null);
      } finally {
        setLoadingPreview(false);
      }
    };

    // Debounce preview fetch
    const timeoutId = setTimeout(fetchPreview, 300);
    return () => clearTimeout(timeoutId);
  }, [endDate, currentEndDateString, open, location, enrolmentId, enrolmentType, schedule?.endDate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!endDate) {
      setError("End Date cannot be blank.");
      return;
    }

    // For group enrolments: validate that new end date <= current end date (can only shrink)
    if (enrolmentType === "group" && schedule?.endDate) {
      const currentEndDate = parseDate(schedule.endDate);
      if (currentEndDate && endDate > currentEndDate) {
        toast.error("You can't extend group enrolments");
        return;
      }
    }

    setError("");
    const dateString = formatDateToString(endDate);
    const success = await onSubmit(dateString);
    
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>End Date Adjustment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DatePicker
            id="end-date"
            label="End Date"
            value={endDate}
            onSelect={(date) => {
              console.log("Date selected:", date);
              if (!date) {
                setEndDate(undefined);
                setError("");
                return;
              }
              
              // For group enrolments: validate that new end date <= current end date (can only shrink)
              if (enrolmentType === "group" && schedule?.endDate) {
                const currentEndDate = parseDate(schedule.endDate);
                if (currentEndDate && date > currentEndDate) {
                  toast.error("You can't extend group enrolments");
                  // Reset to current end date to prevent invalid selection
                  setEndDate(currentEndDate);
                  return;
                }
              }
              
              setEndDate(date);
              setError("");
            }}
            placeholder="Pick a date"
            fromYear={2005}
            toYear={2125}
            error={!!error}
            errorMessage={error}
          />

          {/* Preview Section */}
          {loadingPreview && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Loading preview...
            </div>
          )}
          {!loadingPreview && preview && preview.previewItems.length > 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">End Date Adjustment Preview</label>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Objects</th>
                        <th className="px-4 py-2 text-left font-medium">Action</th>
                        <th className="px-4 py-2 text-left font-medium">Date Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.previewItems.map((item, index) => (
                        <tr key={index} className="border-t dark:border-gray-700">
                          <td className="px-4 py-2">{item.objects}</td>
                          <td className="px-4 py-2">{item.action}</td>
                          <td className="px-4 py-2">{item.date_range}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

