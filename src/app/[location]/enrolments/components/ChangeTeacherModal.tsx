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
import { changeTeacherForEnrolments } from "@/app/[location]/enrolments/enrolmentsListing.api";
import { getLessonReviewForTeacherChange } from "@/app/[location]/students/[id]/students-details.api";
import { getTeacherView, getProgramsList } from "@/app/[location]/schedule/schedule.api";
import { getEnrolmentDetails } from "@/app/[location]/enrolments/[id]/enrolment-details.api";
import { apiClient } from "@/lib/api/client";
import { NewEnrolmentReviewModal, type LessonPreview, type EnrolmentReviewDetails } from "@/components/EnrolmentWizard/NewEnrolmentReviewModal";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
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
  const [teachersFetched, setTeachersFetched] = React.useState(false);
  const [reviewModalOpen, setReviewModalOpen] = React.useState(false);
  const [reviewLessons, setReviewLessons] = React.useState<LessonPreview[]>([]);
  const [reviewDetails, setReviewDetails] = React.useState<EnrolmentReviewDetails | undefined>();
  const [isLoadingReview, setIsLoadingReview] = React.useState(false);

  // Reset when modal closes (but don't reset review modal data if it's open)
  React.useEffect(() => {
    if (!open && !reviewModalOpen) {
      setSelectedTeacherId("");
      setEffectFromDate(new Date());
      setTeachers([]);
      setTeachersFetched(false);
      setLoadingTeachers(false);
      // Don't reset reviewLessons and reviewDetails here - they're managed by reviewModalOpen
    }
  }, [open, reviewModalOpen]);

  // Reset review modal data when review modal closes
  React.useEffect(() => {
    if (!reviewModalOpen) {
      setReviewLessons([]);
      setReviewDetails(undefined);
    }
  }, [reviewModalOpen]);

  // Fetch qualified teachers for enrolments using schedule/teacher-view API
  const fetchTeachersByProgram = React.useCallback(async () => {
    if (teachersFetched || selectedEnrolmentIds.length === 0) return;

    setLoadingTeachers(true);
    try {
      // Step 1: Fetch enrolment details to get program names
      const enrolmentDetailsPromises = selectedEnrolmentIds.map((id) =>
        getEnrolmentDetails(location, id.toString())
      );
      const enrolmentDetailsResults = await Promise.all(enrolmentDetailsPromises);
      
      // Step 2: Extract unique program names
      const programNames = new Set<string>();
      enrolmentDetailsResults.forEach((result) => {
        if (result?.success && result.data?.body?.program) {
          programNames.add(result.data.body.program);
        }
      });

      if (programNames.size === 0) {
        console.warn("No program information found for selected enrolments");
        setTeachers([]);
        setTeachersFetched(true);
        return;
      }

      // Step 3: Get programs list to map program names to IDs
      const programsResponse = await getProgramsList();
      if (!programsResponse?.success || !programsResponse.data) {
        console.error("Failed to fetch programs list");
        setTeachers([]);
        setTeachersFetched(true);
        return;
      }

      // Step 4: Map program names to program IDs
      const programIds = Array.from(programNames)
        .map((programName) => {
          const program = programsResponse.data.find((p) => p.name === programName);
          return program?.id;
        })
        .filter((id): id is number => id !== undefined);

      if (programIds.length === 0) {
        console.warn("No valid program IDs found for selected enrolments");
        setTeachers([]);
        setTeachersFetched(true);
        return;
      }

      // Step 5: Fetch teachers for each program using getTeacherView with 'all-teachers-by-program' type
      const today = new Date();
      const dateString = format(today, "yyyy-MM-dd");
      
      const teacherPromises = programIds.map((programId) =>
        getTeacherView(
          location,
          dateString,
          false, // showAll = 0
          programId.toString(),
          undefined, // teacherId
          "all-teachers-by-program" // type
        )
      );

      const teacherResults = await Promise.all(teacherPromises);

      // Step 6: Combine and deduplicate teachers from all programs
      const teachersMap = new Map<number, { id: number; name: string }>();
      
      teacherResults.forEach((result) => {
        if (result?.success && result.data?.resources) {
          result.data.resources.forEach((teacher) => {
            // Filter out placeholder entries (id: 0)
            if (teacher.id > 0 && !teachersMap.has(teacher.id)) {
              teachersMap.set(teacher.id, {
                id: teacher.id,
                name: teacher.title,
              });
            }
          });
        }
      });

      const teachersList = Array.from(teachersMap.values());
      
      // Step 7: Sort teachers by name for consistency
      teachersList.sort((a, b) => a.name.localeCompare(b.name));
      
      setTeachers(teachersList);
      setTeachersFetched(true);
    } catch (error) {
      console.error("Error fetching teachers for ChangeTeacherModal:", error);
      setTeachers([]);
      setTeachersFetched(true);
    } finally {
      setLoadingTeachers(false);
    }
  }, [location, selectedEnrolmentIds, teachersFetched]);

  // Fetch teachers when modal opens
  React.useEffect(() => {
    if (open && !teachersFetched && selectedEnrolmentIds.length > 0) {
      fetchTeachersByProgram();
    }
  }, [open, teachersFetched, selectedEnrolmentIds, fetchTeachersByProgram]);

  // Handle dropdown open to trigger lazy loading (fallback if not already fetched)
  const handleTeacherDropdownOpen = (open: boolean) => {
    if (open && !teachersFetched && selectedEnrolmentIds.length > 0) {
      fetchTeachersByProgram();
    }
  };

  const teacherOptions = React.useMemo<SearchableSelectOption[]>(
    () => teachers.map((t) => ({ value: t.id.toString(), label: t.name || "" })),
    [teachers]
  );

  const handleClose = () => {
    onOpenChange(false);
  };

  const handlePreviewLessons = async () => {
    if (!selectedTeacherId || !effectFromDate) {
      return;
    }

    try {
      setIsLoadingReview(true);
      const changesFromDateString = format(effectFromDate, "yyyy-MM-dd");
      
      // Step 1: Create draft lessons with new teacher
      const changeResponse = await changeTeacherForEnrolments(location, {
        enrolmentIds: selectedEnrolmentIds,
        teacherId: parseInt(selectedTeacherId, 10),
        changesFrom: changesFromDateString,
      });

      if (!changeResponse?.success) {
        toast.error(changeResponse?.message || "Failed to change teacher for enrolments");
        return;
      }

      // Step 2: Fetch lesson review data for teacher change
      const reviewResponse = await getLessonReviewForTeacherChange(
        location,
        selectedEnrolmentIds,
        parseInt(selectedTeacherId, 10),
        changesFromDateString,
        true // isBulkTeacherChange
      );

      console.log('[ChangeTeacherModal] Review API response:', reviewResponse);
      console.log('[ChangeTeacherModal] Review API data:', reviewResponse?.data);
      console.log('[ChangeTeacherModal] Review API details:', reviewResponse?.data?.details);

      if (!reviewResponse) {
        toast.error("Failed to load lesson review data: No response");
        return;
      }

      if (!reviewResponse.success) {
        toast.error(reviewResponse.message || "Failed to load lesson review data");
        return;
      }

      if (!reviewResponse.data) {
        toast.error("Failed to load lesson review data: No data in response");
        return;
      }

      if (!reviewResponse.data.lessons || !Array.isArray(reviewResponse.data.lessons)) {
        toast.error("Failed to load lesson review data: Invalid lessons data");
        return;
      }

      // Transform lessons to LessonPreview format
      const previews: LessonPreview[] = reviewResponse.data.lessons.map((lesson, index) => {
        // Extract day name from date
        const lessonDate = new Date(lesson.date);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const day = dayNames[lessonDate.getDay()];
        
        return {
          index,
          id: lesson.id,
          date: lesson.date,
          day,
          startTime: lesson.startTime || '',
          duration: lesson.duration,
          conflict: lesson.conflict,
          isHolidayConflict: lesson.isHolidayConflict,
          isConflict: lesson.isConflict,
          isUnscheduled: lesson.isUnscheduled,
        };
      });

      // Transform details - ensure we have the details object
      const apiDetails = reviewResponse.data.details || {};
      const details: EnrolmentReviewDetails = {
        oldTeacherName: apiDetails.oldTeacherName || undefined,
        newTeacherName: apiDetails.newTeacherName || undefined,
        studentNames: apiDetails.studentNames || undefined,
        changesFrom: apiDetails.changesFrom || undefined,
        isBulkTeacherChange: true,
      };

      console.log('[ChangeTeacherModal] Transformed details:', details);
      console.log('[ChangeTeacherModal] Setting review data:', { previews, details });

      // Set review data first
      setReviewLessons(previews);
      setReviewDetails(details);
      
      // Open review modal first (before closing parent modal to prevent state reset)
      setReviewModalOpen(true);
      
      // Then close change teacher modal after a small delay
      // This ensures review modal state is set before parent modal closes
      setTimeout(() => {
        onOpenChange(false);
      }, 50);
    } catch (error) {
      console.error("Error changing teacher:", error);
      toast.error("Failed to change teacher for enrolments");
    } finally {
      setIsLoadingReview(false);
    }
  };

  const handleConfirmReview = async () => {
    try {
      setIsLoadingReview(true);
      const changesFromDateString = format(effectFromDate!, "yyyy-MM-dd");
      const teacherIdNumber = parseInt(selectedTeacherId, 10);

      // Call confirm-teacher-change endpoint with JSON body (NestJS best practice for arrays)
      const response = await apiClient.post(
        `/admin/v2/${location}/lesson/confirm-teacher-change`,
        {
          enrolmentIds: selectedEnrolmentIds,
          teacherId: teacherIdNumber,
          changesFrom: changesFromDateString,
        }
      );

      if (response.data?.success) {
        toast.success(response.data.message || "Future lesson's teacher have been changed successfully");
        setReviewModalOpen(false);
        onOpenChange(false);
        // Refresh the page to show updated enrolments
        window.location.reload();
      } else {
        toast.error(response.data?.message || "Failed to confirm teacher change");
      }
    } catch (error: unknown) {
      console.error("Error confirming teacher change:", error);
      const errorMessage = 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data)
          ? String(error.response.data.message)
          : "Failed to confirm teacher change";
      toast.error(errorMessage);
    } finally {
      setIsLoadingReview(false);
    }
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
                placeholder="Select teacher"
                searchPlaceholder="Search teachers..."
                emptyText="No teachers available"
                loadingText="Loading teachers..."
                noResultsText="No teachers found"
                disabled={loadingTeachers}
                isLoading={loadingTeachers}
                onOpenChange={handleTeacherDropdownOpen}
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
                      // Validate that date is not in the past
                      if (date) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const selectedDate = new Date(date);
                        selectedDate.setHours(0, 0, 0, 0);
                        
                        if (selectedDate < today) {
                          toast.error("Effect from cannot be in past date");
                          return;
                        }
                      }
                      setEffectFromDate(date);
                      setDatePickerOpen(false);
                    }}
                    disabled={(date) => {
                      // Disable past dates
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
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
          <Button onClick={handlePreviewLessons} disabled={!isValid || isLoadingReview}>
            {isLoadingReview ? "Loading..." : "Preview Lessons"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Review Modal */}
      <NewEnrolmentReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        lessons={reviewLessons}
        details={reviewDetails}
        onConfirm={handleConfirmReview}
        isLoading={isLoadingReview}
        location={location}
      />
    </Dialog>
  );
}

