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
import { Label } from "@/components/ui/label";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select";
import { getTeachersList } from "@/app/[location]/schedule/schedule.api";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ChangeTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  location: string;
  selectedEnrolmentIds: number[];
}

export function ChangeTeacherModal({
  open,
  onOpenChange,
  selectedCount,
  location,
  selectedEnrolmentIds,
}: ChangeTeacherModalProps) {
  const [teachers, setTeachers] = React.useState<Array<{ id: number; name: string }>>([]);
  const [loadingTeachers, setLoadingTeachers] = React.useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>("");
  const [effectFromDate, setEffectFromDate] = React.useState<Date | undefined>(new Date());
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  // Reset when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelectedTeacherId("");
      setEffectFromDate(new Date());
    }
  }, [open]);

  // Fetch teachers when modal opens
  React.useEffect(() => {
    if (!open) return;

    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const response = await getTeachersList(location);
        if (response?.success && response.data) {
          setTeachers(response.data);
          if (response.data.length > 0) {
            setSelectedTeacherId(response.data[0].id.toString());
          }
        }
      } catch (error) {
        console.error("Error fetching teachers for ChangeTeacherModal:", error);
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, [open, location]);

  const teacherOptions = React.useMemo<SearchableSelectOption[]>(
    () => teachers.map((t) => ({ value: t.id.toString(), label: t.name || "" })),
    [teachers]
  );

  const selectedTeacherName = React.useMemo(
    () => teachers.find((t) => t.id.toString() === selectedTeacherId)?.name ?? "",
    [teachers, selectedTeacherId]
  );

  const handleClose = () => {
    onOpenChange(false);
  };

  const handlePreviewLessons = () => {
    // TODO: Wire up to API when endpoint is available
    console.log("Preview teacher change for enrolments:", {
      selectedEnrolmentIds,
      selectedCount,
      teacherId: selectedTeacherId || null,
      teacherName: selectedTeacherName,
      effectFromDate: effectFromDate ? format(effectFromDate, "yyyy-MM-dd") : null,
    });
    onOpenChange(false);
  };

  const isValid = selectedTeacherId && effectFromDate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Teacher Change</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Change teacher for {selectedCount} selected enrolment{selectedCount > 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Teacher Selection */}
            <div className="space-y-2">
              <Label htmlFor="teacher-select" className="font-bold">
                Teacher
              </Label>
              <SearchableSelect
                id="teacher-select"
                options={teacherOptions}
                value={selectedTeacherId}
                onValueChange={(value) => setSelectedTeacherId(value || "")}
                placeholder="Teacher"
                searchPlaceholder="Search teachers..."
                emptyText="No teachers available"
                loadingText="Loading teachers..."
                noResultsText="No teachers found"
                disabled={loadingTeachers}
                isLoading={loadingTeachers}
              />
            </div>

            {/* Effect From Date */}
            <div className="space-y-2">
              <Label htmlFor="effect-from-date" className="font-bold">
                Effect From
              </Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="effect-from-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !effectFromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {effectFromDate ? format(effectFromDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={effectFromDate}
                    onSelect={(date) => {
                      setEffectFromDate(date);
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handlePreviewLessons} disabled={!isValid}>
            Preview Lessons
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

