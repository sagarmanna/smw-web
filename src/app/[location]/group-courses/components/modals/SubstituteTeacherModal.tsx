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
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { LessonData } from "../../[id]/groupCourseTabConfigs";
import {
  getTeacherSubstituteTeachers,
  substituteLesson,
  confirmTeacherSubstitute,
  updateDraftLessonDate,
  type TeacherSubstituteTeacher,
  type SubstituteLessonResponse,
  type SubstituteLessonItem,
} from "../../../private-lessons/actionApi/teacherSubstitute.api";
import { extractErrorMessage } from "@/utils/api/createCrudApi";
import { toast } from "sonner";
import { Pencil, CalendarIcon } from "lucide-react";
import { ReactBigCalendarWrapper } from "@/components/Calendar/ReactBigCalendarWrapper";
import {
  getTeacherScheduleEvents,
  type TeacherScheduleData,
  type TeacherScheduleAvailabilityEvent,
  type TeacherScheduleLessonEvent,
} from "@/app/[location]/teachers/[id]/teachers-details-tabs.api";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface SubstituteTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  selectedLessons: LessonData[];
  onSuccess?: () => void;
}

interface LessonRow {
  id: number;
  teacherName: string;
  programName: string;
  studentName: string;
  date: string;
  duration: string;
  conflict?: string;
}

function mapApiLessonToRow(
  lesson: SubstituteLessonItem,
  conflict?: string
): LessonRow {
  return {
    id: lesson.id,
    teacherName: lesson.teacherName ?? "",
    programName: lesson.programName ?? "",
    studentName: lesson.studentName ?? "",
    date: lesson.date ?? "",
    duration: lesson.duration ?? "",
    conflict,
  };
}

const DAY_RESOURCES = [
  { id: 1, title: "Monday" },
  { id: 2, title: "Tuesday" },
  { id: 3, title: "Wednesday" },
  { id: 4, title: "Thursday" },
  { id: 5, title: "Friday" },
  { id: 6, title: "Saturday" },
  { id: 7, title: "Sunday" },
];
const DAY_NAMES = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getMondayOfWeek = (date: Date): Date => {
  const dayOfWeek = date.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(date);
  monday.setDate(date.getDate() + daysToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const convertLessonsToCalendarEvents = (
  lessons: TeacherScheduleLessonEvent[],
  mondayDate: Date
) => {
  return lessons.map((lesson) => {
    const originalStart = new Date(lesson.start);
    const originalEnd = new Date(lesson.end);
    const startHours = originalStart.getHours();
    const startMinutes = originalStart.getMinutes();
    const startSeconds = originalStart.getSeconds();
    const endHours = originalEnd.getHours();
    const endMinutes = originalEnd.getMinutes();
    const endSeconds = originalEnd.getSeconds();

    const eventStart = new Date(mondayDate);
    eventStart.setHours(startHours, startMinutes, startSeconds, 0);

    const eventEnd = new Date(mondayDate);
    eventEnd.setHours(endHours, endMinutes, endSeconds, 0);

    const resourceId = lesson.resourceId;
    const isOnline =
      typeof lesson.isOnline === "number" ? lesson.isOnline === 1 : lesson.isOnline;

    return {
      id: `lesson-${lesson.lessonId}`,
      title: lesson.title,
      start: eventStart,
      end: eventEnd,
      resourceId,
      backgroundColor: lesson.backgroundColor,
      borderColor: lesson.backgroundColor,
      className: lesson.className,
      extendedProps: {
        lessonId: lesson.lessonId.toString(),
        isOwing: lesson.isOwing ?? undefined,
        isOwingRentalAgreement: lesson.isOwingRentalAgreement ?? undefined,
        isOnline,
        programId: lesson.programId?.toString() || undefined,
        url: lesson.url,
        tooltip: lesson.title,
      },
    };
  });
};

const convertAvailabilityEvents = (
  availability: TeacherScheduleAvailabilityEvent[],
  mondayDate: Date
) => {
  return availability.map((avail) => {
    const originalStart = new Date(avail.start);
    const originalEnd = new Date(avail.end);
    const startHours = originalStart.getHours();
    const startMinutes = originalStart.getMinutes();
    const startSeconds = originalStart.getSeconds();
    const endHours = originalEnd.getHours();
    const endMinutes = originalEnd.getMinutes();
    const endSeconds = originalEnd.getSeconds();

    const availStart = new Date(mondayDate);
    availStart.setHours(startHours, startMinutes, startSeconds, 0);

    const availEnd = new Date(mondayDate);
    availEnd.setHours(endHours, endMinutes, endSeconds, 0);

    return {
      resourceId: avail.resourceId,
      title: "",
      start: availStart.toISOString(),
      end: availEnd.toISOString(),
      rendering: avail.rendering,
      className: avail.className,
    };
  });
};

export function SubstituteTeacherModal({
  open,
  onOpenChange,
  location,
  selectedLessons,
  onSuccess,
}: SubstituteTeacherModalProps) {
  const [selectedTeacher, setSelectedTeacher] = React.useState<string>("");
  const [teachers, setTeachers] = React.useState<TeacherSubstituteTeacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = React.useState(false);
  const [teachersLoadError, setTeachersLoadError] = React.useState<string | null>(
    null
  );
  const [reviewResponse, setReviewResponse] =
    React.useState<SubstituteLessonResponse | null>(null);
  const [isLoadingReview, setIsLoadingReview] = React.useState(false);
  const [reviewLoadError, setReviewLoadError] = React.useState<string | null>(
    null
  );
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = React.useState(false);
  const [lessonForEdit, setLessonForEdit] = React.useState<{
    lessonId: number;
    teacherId: number;
  } | null>(null);
  const [calendarDate, setCalendarDate] = React.useState<Date>(new Date());
  const [scheduleData, setScheduleData] = React.useState<TeacherScheduleData | null>(null);
  const [loadingCalendar, setLoadingCalendar] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);
  const [goToDate, setGoToDate] = React.useState<Date | undefined>(new Date());
  const [goToDatePickerOpen, setGoToDatePickerOpen] = React.useState(false);
  const [isUpdatingDraft, setIsUpdatingDraft] = React.useState(false);

  const lessonIds = React.useMemo(() => {
    return selectedLessons
      .map((l) => Number(l.id))
      .filter((id) => !Number.isNaN(id));
  }, [selectedLessons]);

  // Load substitute teachers when modal opens
  React.useEffect(() => {
    if (!open || lessonIds.length === 0) return;

    let isCancelled = false;
    setTeachersLoadError(null);
    setReviewResponse(null);
    setSelectedTeacher("");

    const fetchTeachers = async () => {
      setIsLoadingTeachers(true);
      try {
        const response = await getTeacherSubstituteTeachers(location, lessonIds);
        if (
          !isCancelled &&
          response?.success &&
          Array.isArray(response.data?.teachers)
        ) {
          setTeachers(response.data.teachers);
        }
      } catch (error) {
        const message = extractErrorMessage(
          error,
          "Failed to load substitute teachers"
        );
        if (!isCancelled) {
          setTeachers([]);
          setTeachersLoadError(message);
          toast.error(message);
        }
      } finally {
        if (!isCancelled) setIsLoadingTeachers(false);
      }
    };

    fetchTeachers();
    return () => {
      isCancelled = true;
    };
  }, [open, location, lessonIds]);

  // Create drafts and load review when teacher is selected
  React.useEffect(() => {
    if (!open || !selectedTeacher || lessonIds.length === 0) {
      setReviewResponse(null);
      setReviewLoadError(null);
      return;
    }

    const teacherId = Number(selectedTeacher);
    if (Number.isNaN(teacherId)) return;

    let isCancelled = false;
    setReviewLoadError(null);

    const fetchReview = async () => {
      setIsLoadingReview(true);
      setReviewResponse(null);
      try {
        const response = await substituteLesson(location, {
          ids: lessonIds,
          teacherId,
        });
        if (!isCancelled) setReviewResponse(response);
      } catch (error) {
        const message = extractErrorMessage(
          error,
          "Failed to load substitute review"
        );
        if (!isCancelled) {
          setReviewResponse(null);
          setReviewLoadError(message);
          toast.error(message);
        }
      } finally {
        if (!isCancelled) setIsLoadingReview(false);
      }
    };

    fetchReview();
    return () => {
      isCancelled = true;
    };
  }, [open, location, selectedTeacher, lessonIds]);

  // Fetch teacher schedule when calendar modal opens for editing a lesson
  React.useEffect(() => {
    if (
      !calendarModalOpen ||
      !lessonForEdit?.teacherId ||
      !open
    ) {
      setScheduleData(null);
      return;
    }
    setLoadingCalendar(true);
    const monday = getMondayOfWeek(calendarDate);
    getTeacherScheduleEvents(
      location,
      lessonForEdit.teacherId,
      formatDateString(monday),
      showAll
    )
      .then((response: TeacherScheduleData | null) => {
        if (response) {
          setScheduleData(response);
          if (response.date?.from) {
            const apiWeekStart = new Date(response.date.from + "T00:00:00");
            apiWeekStart.setHours(0, 0, 0, 0);
            if (
              Math.abs(apiWeekStart.getTime() - monday.getTime()) >
              12 * 60 * 60 * 1000
            ) {
              setCalendarDate(apiWeekStart);
            }
          }
        } else {
          setScheduleData(null);
        }
      })
      .catch((err: unknown) => {
        console.error("Error fetching schedule:", err);
        setScheduleData(null);
      })
      .finally(() => setLoadingCalendar(false));
  }, [
    calendarModalOpen,
    lessonForEdit?.teacherId,
    calendarDate,
    location,
    open,
    showAll,
  ]);

  const handleDateSelect = (
    date: Date | undefined,
    setter: (date: Date | undefined) => void,
    closePicker: () => void
  ) => {
    if (date) {
      setter(date);
      setCalendarDate(getMondayOfWeek(date));
      closePicker();
    }
  };

  const calendarMonday = React.useMemo(
    () => getMondayOfWeek(calendarDate),
    [calendarDate]
  );

  const handleSelectSlot = React.useCallback(
    async (slotInfo: {
      start: Date;
      end: Date;
      resourceId?: number | string;
    }) => {
      if (
        !slotInfo.start ||
        !slotInfo.resourceId ||
        !lessonForEdit
      )
        return;

      const resourceId =
        typeof slotInfo.resourceId === "string"
          ? parseInt(slotInfo.resourceId, 10)
          : slotInfo.resourceId ?? 1;

      if (resourceId < 1 || resourceId > 7) return;

      // Calendar shows Mon–Sun as columns; slotInfo.start is often Monday. Use resourceId + week start for correct day.
      const selectedDate = new Date(calendarMonday);
      selectedDate.setDate(selectedDate.getDate() + (resourceId - 1));
      selectedDate.setHours(
        slotInfo.start.getHours(),
        slotInfo.start.getMinutes(),
        0,
        0
      );

      const selectedHours = slotInfo.start.getHours();
      const selectedMinutes = slotInfo.start.getMinutes();
      const hour12 = selectedHours % 12 || 12;
      const minuteStr = String(selectedMinutes).padStart(2, "0");
      const ampm = selectedHours >= 12 ? "PM" : "AM";
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const timeStr = `${hour12}:${minuteStr} ${ampm}`;
      const apiDate = `${dateStr} ${timeStr}`;

      setIsUpdatingDraft(true);
      try {
        await updateDraftLessonDate(location, lessonForEdit.lessonId, {
          date: apiDate,
          teacherId: lessonForEdit.teacherId,
        });
        toast.success("Lesson date/time updated");
        // Re-validate conflicts after draft update (API: use resolvingConflicts=true)
        const response = await substituteLesson(location, {
          ids: lessonIds,
          teacherId: lessonForEdit.teacherId,
          resolvingConflicts: true,
        });
        setReviewResponse(response);
        setCalendarModalOpen(false);
        setLessonForEdit(null);
      } catch (error) {
        const message = extractErrorMessage(
          error,
          "Failed to update lesson date/time"
        );
        toast.error(message);
      } finally {
        setIsUpdatingDraft(false);
      }
    },
    [location, lessonForEdit, lessonIds, calendarMonday]
  );

  const calendarEvents = React.useMemo(() => {
    if (!scheduleData) return [];
    return convertLessonsToCalendarEvents(scheduleData.lessons, calendarMonday);
  }, [scheduleData, calendarMonday]);
  const timeRange = React.useMemo(
    () =>
      scheduleData
        ? {
            minTime: scheduleData.time.from,
            maxTime: scheduleData.time.to,
          }
        : { minTime: "04:00:00", maxTime: "20:00:00" },
    [scheduleData]
  );
  const dateRange = React.useMemo(() => {
    if (scheduleData?.date) {
      const start = new Date(scheduleData.date.from);
      const end = new Date(scheduleData.date.to);
      return `${format(start, "dd-MMM-yyyy, EEEE")} – ${format(end, "dd-MMM-yyyy, EEEE")}`;
    }
    const monday = startOfWeek(calendarDate, { weekStartsOn: 1 });
    const sunday = endOfWeek(calendarDate, { weekStartsOn: 1 });
    return `${format(monday, "dd-MMM-yyyy, EEEE")} – ${format(sunday, "dd-MMM-yyyy, EEEE")}`;
  }, [scheduleData, calendarDate]);
  const availabilityEvents = React.useMemo(
    () =>
      scheduleData?.availability
        ? convertAvailabilityEvents(scheduleData.availability, calendarMonday)
        : [],
    [scheduleData, calendarMonday]
  );

  const handleOpenEditCalendar = React.useCallback(
    (row: LessonRow) => {
      const teacherId = Number(selectedTeacher);
      if (Number.isNaN(teacherId)) return;
      setLessonForEdit({ lessonId: row.id, teacherId });
      setCalendarModalOpen(true);
    },
    [selectedTeacher]
  );

  const teacherOptions: SearchableSelectOption[] = React.useMemo(
    () => teachers.map((t) => ({ value: String(t.id), label: t.name })),
    [teachers]
  );

  const hasBlockingConflicts = Boolean(
    reviewResponse?.data?.conflictedLessonIds?.length
  );

  const lessonsTableData = React.useMemo<LessonRow[]>(() => {
    if (!reviewResponse?.data?.lessons) return [];
    const lessons = reviewResponse.data.lessons;
    const conflicts = reviewResponse.data.conflicts ?? {};
    return lessons.map((lesson) => {
      const msgs = conflicts[String(lesson.id)];
      const conflict = Array.isArray(msgs) ? msgs.join("; ") : undefined;
      return mapApiLessonToRow(lesson, conflict);
    });
  }, [reviewResponse]);

  const columns = React.useMemo<ColumnDef<LessonRow>[]>(
    () => [
      { accessorKey: "teacherName", header: "Teacher" },
      { accessorKey: "programName", header: "Program" },
      { accessorKey: "studentName", header: "Student" },
      { accessorKey: "date", header: "Date/Time" },
      { accessorKey: "duration", header: "Duration" },
      {
        id: "conflict",
        header: "Conflict",
        cell: ({ row }) => {
          const conflict = row.original.conflict;
          if (!conflict)
            return (
              <span className="text-muted-foreground text-xs">-</span>
            );
          const isWarning = conflict.includes("Warning");
          return (
            <span
              className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                isWarning
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {conflict}
            </span>
          );
        },
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleOpenEditCalendar(row.original)}
            title="Change date/time"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [handleOpenEditCalendar]
  );

  const handleConfirm = React.useCallback(async () => {
    if (
      !selectedTeacher ||
      !reviewResponse?.data?.newLessonIds?.length ||
      hasBlockingConflicts
    )
      return;

    setIsConfirming(true);
    try {
      await confirmTeacherSubstitute(location, {
        ids: lessonIds,
        newLessonIds: reviewResponse.data.newLessonIds,
      });
      toast.success("Lessons are substituted to the selected teacher");
      onSuccess?.();
      setSelectedTeacher("");
      setReviewResponse(null);
      onOpenChange(false);
    } catch (error) {
      const message = extractErrorMessage(
        error,
        "Failed to confirm teacher substitution"
      );
      toast.error(message);
    } finally {
      setIsConfirming(false);
    }
  }, [
    selectedTeacher,
    reviewResponse,
    hasBlockingConflicts,
    location,
    lessonIds,
    onSuccess,
    onOpenChange,
  ]);

  const handleCancel = React.useCallback(() => {
    setSelectedTeacher("");
    setReviewResponse(null);
    setTeachersLoadError(null);
    setReviewLoadError(null);
    setCalendarModalOpen(false);
    setLessonForEdit(null);
    onOpenChange(false);
  }, [onOpenChange]);

  React.useEffect(() => {
    if (!open) {
      setSelectedTeacher("");
      setReviewResponse(null);
      setTeachersLoadError(null);
      setReviewLoadError(null);
      setCalendarModalOpen(false);
      setLessonForEdit(null);
    }
  }, [open]);

  const canConfirm =
    selectedTeacher &&
    reviewResponse?.data?.newLessonIds?.length &&
    !hasBlockingConflicts &&
    !isLoadingReview &&
    !isConfirming;

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Substitute Teacher
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="substitute-teacher">Substitute Teacher</Label>
            <SearchableSelect
              id="substitute-teacher"
              options={teacherOptions}
              isLoading={isLoadingTeachers}
              value={selectedTeacher}
              onValueChange={setSelectedTeacher}
              placeholder="Select Substitute Teacher"
              searchPlaceholder="Search teachers..."
              emptyText="No teachers available"
            />
            {teachersLoadError && (
              <p className="text-destructive text-sm" role="alert">
                {teachersLoadError}
              </p>
            )}
          </div>

          {selectedTeacher && (
            <div className="mt-4">
              {reviewLoadError && (
                <p className="text-destructive text-sm mb-2" role="alert">
                  {reviewLoadError}
                </p>
              )}
              {isLoadingReview ? (
                <p className="text-muted-foreground text-sm py-4">
                  Loading review…
                </p>
              ) : lessonsTableData.length > 0 ? (
                <>
                  <CustomTable<LessonRow, unknown>
                    data={lessonsTableData}
                    columns={columns}
                    size="compact"
                    variant="default"
                    stickyHeader={true}
                    enableSearch={false}
                    enableFilter={false}
                    enableExport={false}
                    enablePrint={false}
                    enableRowsPerPage={false}
                  />
                  {hasBlockingConflicts && (
                    <p className="text-destructive text-sm mt-2">
                      Resolve all blocking conflicts before confirming.
                    </p>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="bg-primary hover:bg-primary/90"
          >
            {isConfirming ? "Confirming…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Calendar Modal – change date/time for a draft lesson */}
    <Dialog
      open={calendarModalOpen}
      onOpenChange={(open) => {
        setCalendarModalOpen(open);
        if (!open) setLessonForEdit(null);
      }}
    >
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            Choose Date, Day and Time
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-all-edit"
                checked={showAll}
                onCheckedChange={(checked) => setShowAll(checked === true)}
              />
              <Label
                htmlFor="show-all-edit"
                className="text-sm font-normal cursor-pointer"
              >
                Show All
              </Label>
            </div>
            <div className="space-y-2">
              <Label>Go to Date</Label>
              <Popover
                open={goToDatePickerOpen}
                onOpenChange={setGoToDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !goToDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {goToDate
                      ? format(goToDate, "MMM dd, yyyy")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-2 border-b">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDateSelect(
                          new Date(),
                          setGoToDate,
                          () => setGoToDatePickerOpen(false)
                        )
                      }
                      className="w-full h-8 text-xs"
                    >
                      Today
                    </Button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={goToDate}
                    onSelect={(date) =>
                      handleDateSelect(
                        date,
                        setGoToDate,
                        () => setGoToDatePickerOpen(false)
                      )
                    }
                    defaultMonth={goToDate || new Date()}
                    captionLayout="dropdown"
                    fromYear={2005}
                    toYear={2125}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="text-center py-2">
            <p className="text-lg font-semibold">{dateRange}</p>
          </div>
          <div className="border rounded-lg overflow-hidden">
            {loadingCalendar ? (
              <div className="flex items-center justify-center h-[60vh]">
                <p className="text-muted-foreground">
                  {isUpdatingDraft ? "Updating…" : "Loading schedule…"}
                </p>
              </div>
            ) : (
              <ReactBigCalendarWrapper
                events={calendarEvents}
                resources={DAY_RESOURCES}
                date={calendarMonday}
                onNavigate={(newDate) =>
                  setCalendarDate(getMondayOfWeek(newDate))
                }
                onSelectSlot={handleSelectSlot}
                editable={false}
                showAll={showAll}
                viewType="teacher"
                minTime={timeRange.minTime}
                maxTime={timeRange.maxTime}
                availability={availabilityEvents}
                height="60vh"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setCalendarModalOpen(false);
              setLessonForEdit(null);
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
