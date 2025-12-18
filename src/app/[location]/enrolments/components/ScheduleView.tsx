"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ReactBigCalendarWrapper, CalendarWrapperRef } from "@/components/Calendar/ReactBigCalendarWrapper";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getScheduleDetails, 
  getTeacherView, 
  getTeacherViewEvents, 
  getClassroomViewResources,
  getProgramsList,
  getTeachersList,
  ScheduleDetails,
  TeacherViewResource,
  TeacherViewEvent,
  TeacherViewAvailability,
  ClassroomViewResource,
  Program,
  Teacher,
} from "../../schedule/schedule.api";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { updateLesson, formatDateTimeForLegacy, formatDurationForLegacy } from "@/lib/api/legacyApiAdapter";
import { toast } from "sonner";

interface ScheduleViewProps {
  location: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId?: number;
  backgroundColor?: string;
  borderColor?: string;
  className?: string;
  extendedProps?: {
    lessonId?: string;
    teacher?: string;
    classroom?: string;
    program?: string;
    isOwing?: boolean;
    isOnline?: boolean;
    isOwingRentalAgreement?: boolean;
    tooltip?: string;
    programId?: string;
    url?: string;
  };
}

interface ScheduleViewContextType {
  location: string;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  showAll: boolean;
  setShowAll: (value: boolean) => void;
  mobileDatePickerOpen: boolean;
  setMobileDatePickerOpen: (open: boolean) => void;
  desktopDatePickerOpen: boolean;
  setDesktopDatePickerOpen: (open: boolean) => void;
  isLoadingSchedule: boolean;
  scheduleDetails: ScheduleDetails | null;
  scheduleDetailsLoading: boolean;
  scheduleDetailsError: string | null;
  teacherViewResources: TeacherViewResource[];
  teacherViewError: string | null;
  teacherViewEvents: TeacherViewEvent[];
  teacherViewEventsError: string | null;
  teacherViewAvailability: TeacherViewAvailability[];
  classroomViewResources: ClassroomViewResource[];
  refreshTrigger: number;
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
  recentDates: Date[];
  setRecentDates: React.Dispatch<React.SetStateAction<Date[]>>;
  updatingEvents: Set<string>;
  setUpdatingEvents: React.Dispatch<React.SetStateAction<Set<string>>>;
  teacherCalendarRef: React.MutableRefObject<CalendarWrapperRef | null>;
  convertTeacherViewEventsToCalendar: (events: TeacherViewEvent[]) => CalendarEvent[];
  handleEventClick: (event: CalendarEvent) => void;
  handleEventDrop: (event: CalendarEvent) => Promise<void>;
  handleEventResize: (event: CalendarEvent) => Promise<void>;
  openDailySchedule: () => void;
  goToToday: () => void;
  handleDateSelect: (date: Date, closeCalendar: () => void) => void;
  handleDaySelect: (dayName: string) => void;
  getTimeRange: () => { minTime: string; maxTime: string };
  // Program and Teacher filters
  programs: Program[];
  programsLoading: boolean;
  selectedProgram: string;
  setSelectedProgram: (value: string) => void;
  teachers: Teacher[];
  teachersLoading: boolean;
  selectedTeacher: string;
  setSelectedTeacher: (value: string) => void;
}

const ScheduleViewContext = React.createContext<ScheduleViewContextType | null>(null);

function useScheduleViewContext() {
  const context = React.useContext(ScheduleViewContext);
  if (!context) {
    throw new Error("useScheduleViewContext must be used within ScheduleViewProvider");
  }
  return context;
}

function ScheduleViewProvider({ location, children }: { location: string; children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => new Date());
  const [showAll, setShowAll] = React.useState<boolean>(false);
  const [mobileDatePickerOpen, setMobileDatePickerOpen] = React.useState<boolean>(false);
  const [desktopDatePickerOpen, setDesktopDatePickerOpen] = React.useState<boolean>(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = React.useState<boolean>(false);
  const [scheduleDetails, setScheduleDetails] = React.useState<ScheduleDetails | null>(null);
  const [scheduleDetailsLoading, setScheduleDetailsLoading] = React.useState<boolean>(false);
  const [scheduleDetailsError, setScheduleDetailsError] = React.useState<string | null>(null);
  const [teacherViewResources, setTeacherViewResources] = React.useState<TeacherViewResource[]>([]);
  const [teacherViewError, setTeacherViewError] = React.useState<string | null>(null);
  const [teacherViewEvents, setTeacherViewEvents] = React.useState<TeacherViewEvent[]>([]);
  const [teacherViewEventsError, setTeacherViewEventsError] = React.useState<string | null>(null);
  const [teacherViewAvailability, setTeacherViewAvailability] = React.useState<TeacherViewAvailability[]>([]);
  const [classroomViewResources, setClassroomViewResources] = React.useState<ClassroomViewResource[]>([]);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [recentDates, setRecentDates] = React.useState<Date[]>([]);
  const [updatingEvents, setUpdatingEvents] = React.useState<Set<string>>(new Set());
  const teacherCalendarRef = React.useRef<CalendarWrapperRef>(null);
  
  // Program and Teacher filter state
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [programsLoading, setProgramsLoading] = React.useState<boolean>(false);
  const [selectedProgram, setSelectedProgram] = React.useState<string>("");
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = React.useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = React.useState<string>("");

  const safeSelectedDate = React.useMemo(() => {
    return selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
  }, [selectedDate]);

  // Fetch schedule details when date changes
  React.useEffect(() => {
    const fetchScheduleDetails = async () => {
      try {
        setScheduleDetailsLoading(true);
        setScheduleDetailsError(null);
        const dateStr = format(safeSelectedDate, "yyyy-MM-dd");
        const response = await getScheduleDetails(location, dateStr);
        
        if (response?.success) {
          setScheduleDetails(response.data);
        } else {
          setScheduleDetailsError(response?.message || 'Failed to fetch schedule details');
        }
      } catch (error) {
        setScheduleDetailsError(error instanceof Error ? error.message : 'Failed to fetch schedule details');
      } finally {
        setScheduleDetailsLoading(false);
      }
    };

    fetchScheduleDetails();
  }, [location, safeSelectedDate]);

  // Fetch classroom view resources on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const classroomResourcesResponse = await getClassroomViewResources(location);
        
        if (classroomResourcesResponse?.success) {
          setClassroomViewResources(classroomResourcesResponse.data.resources);
        }
      } catch (error) {
        console.error("Error fetching classroom resources:", error);
      }
    };

    fetchData();
  }, [location]);

  // Fetch programs on mount
  React.useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setProgramsLoading(true);
        const response = await getProgramsList();
        
        if (response?.success) {
          setPrograms(response.data);
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
      } finally {
        setProgramsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Fetch teachers on mount
  React.useEffect(() => {
    if (!location) return;

    const fetchTeachers = async () => {
      try {
        setTeachersLoading(true);
        const response = await getTeachersList(location);
        
        if (response?.success) {
          setTeachers(response.data);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setTeachersLoading(false);
      }
    };

    fetchTeachers();
  }, [location]);

  // Fetch teacher view data when filters or date change
  React.useEffect(() => {
    const fetchTeacherView = async () => {
      try {
        setTeacherViewError(null);
        const dateStr = format(safeSelectedDate, "yyyy-MM-dd");
        const response = await getTeacherView(
          location, 
          dateStr, 
          showAll,
          selectedProgram || undefined,
          selectedTeacher || undefined
        );
        
        if (response?.success) {
          setTeacherViewResources(response.data.resources);
        } else {
          setTeacherViewError(response?.message || 'Failed to fetch teacher view');
        }
      } catch (error) {
        setTeacherViewError(error instanceof Error ? error.message : 'Failed to fetch teacher view');
      }
    };

    fetchTeacherView();
  }, [location, safeSelectedDate, showAll, selectedProgram, selectedTeacher]);

  // Fetch teacher view events when filters or date change
  React.useEffect(() => {
    const fetchTeacherViewEvents = async () => {
      try {
        setIsLoadingSchedule(true);
        setTeacherViewEventsError(null);
        const dateStr = format(safeSelectedDate, "yyyy-MM-dd");
        
        const response = await getTeacherViewEvents(
          location, 
          dateStr, 
          showAll,
          selectedProgram || undefined,
          selectedTeacher || undefined
        );
        
        if (response?.success) {
          setTeacherViewEvents(response.data.lessons);
          setTeacherViewAvailability(response.data.availability || []);
        } else {
          setTeacherViewEventsError(response?.message || 'Failed to fetch teacher view events');
        }
      } catch (error) {
        setTeacherViewEventsError(error instanceof Error ? error.message : 'Failed to fetch teacher view events');
      } finally {
        setIsLoadingSchedule(false);
      }
    };

    fetchTeacherViewEvents();
  }, [location, safeSelectedDate, showAll, selectedProgram, selectedTeacher, refreshTrigger]);

  const convertTeacherViewEventsToCalendar = React.useCallback((events: TeacherViewEvent[]): CalendarEvent[] => {
    return events.map(event => {
      const tooltip = event.tooltip || [];
      const tooltipString = tooltip.map(t => `${t.name}: ${t.value}`).join('\n');
      
      const calendarEvent: CalendarEvent = {
        id: event.lessonId.toString(),
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        resourceId: event.resourceId,
        backgroundColor: event.backgroundColor,
        borderColor: event.backgroundColor,
        className: event.className,
        extendedProps: {
          lessonId: event.lessonId.toString(),
          teacher: tooltip.find(t => t.name === "Teacher")?.value || "",
          classroom: tooltip.find(t => t.name === "Classroom")?.value || "",
          program: tooltip.find(t => t.name === "Program")?.value || "",
          programId: event.programId?.toString() || "",
          isOwing: event.isOwing,
          isOnline: event.isOnline,
          isOwingRentalAgreement: event.isOwingRentalAgreement,
          tooltip: tooltipString,
          url: event.url
        }
      };
      
      return calendarEvent;
    });
  }, []);

  const handleEventClick = React.useCallback((event: CalendarEvent) => {
    const lessonId = event.extendedProps?.lessonId || event.id;
    if (lessonId) {
      const baseUrl = process.env.NEXT_PUBLIC_LEGACY_URL;
      if (baseUrl) {
        // Remove any location from baseUrl if it exists, then add the current location
        const cleanBaseUrl = baseUrl.replace(/\/admin\/[^/]+$/, '/admin');
        const enrolmentUrl = `${cleanBaseUrl}/${location}/enrolment/view?id=${lessonId}`;
        window.open(enrolmentUrl, '_self');
      }
    }
  }, [location]);

  const handleEventDrop = React.useCallback(async (event: CalendarEvent) => {
    setUpdatingEvents(prev => new Set(prev).add(event.id));
    
    try {
      const lessonData = {
        teacherId: event.resourceId?.toString() || '',
        date: formatDateTimeForLegacy(event.start),
        duration: formatDurationForLegacy(event.start, event.end),
      };

      const result = await updateLesson(location, event.id, lessonData);
      
      if (result.status) {
        toast.success("Lesson updated successfully");
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(result.errors?.[0] || "Failed to update lesson");
        teacherCalendarRef.current?.handleEventUpdateFailure(event.id);
      }
    } catch {
      toast.error("Failed to update lesson");
      teacherCalendarRef.current?.handleEventUpdateFailure(event.id);
    } finally {
      setUpdatingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
    }
  }, [location]);

  const handleEventResize = React.useCallback(async (event: CalendarEvent) => {
    setUpdatingEvents(prev => new Set(prev).add(event.id));
    
    try {
      const lessonData = {
        teacherId: event.resourceId?.toString() || '',
        date: formatDateTimeForLegacy(event.start),
        duration: formatDurationForLegacy(event.start, event.end),
      };

      const result = await updateLesson(location, event.id, lessonData);
      
      if (result.status) {
        toast.success("Lesson duration updated successfully");
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast.error(result.errors?.[0] || "Failed to update lesson");
        teacherCalendarRef.current?.handleEventUpdateFailure(event.id);
      }
    } catch {
      toast.error("Failed to update lesson");
      teacherCalendarRef.current?.handleEventUpdateFailure(event.id);
    } finally {
      setUpdatingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.id);
        return newSet;
      });
    }
  }, [location]);

  const openDailySchedule = React.useCallback(() => {
    const dateStr = format(safeSelectedDate, "dd-MM-yyyy");
    window.open(`/admin/${location}/daily-schedule?date=${dateStr}`, '_blank');
  }, [location, safeSelectedDate]);

  const goToToday = React.useCallback(() => {
    setSelectedDate(new Date());
    setMobileDatePickerOpen(false);
    setDesktopDatePickerOpen(false);
  }, []);

  const addToRecentDates = React.useCallback((date: Date) => {
    setRecentDates(prev => {
      const dateStr = date.toDateString();
      const existingIndex = prev.findIndex(d => d.toDateString() === dateStr);
      
      let newRecentDates;
      if (existingIndex !== -1) {
        newRecentDates = [date, ...prev.filter((_, index) => index !== existingIndex)];
      } else {
        newRecentDates = [date, ...prev];
      }
      
      return newRecentDates.slice(0, 5);
    });
  }, []);

  const handleDateSelect = React.useCallback((date: Date, closeCalendar: () => void) => {
    setSelectedDate(date);
    addToRecentDates(date);
    closeCalendar();
  }, [addToRecentDates]);

  // Handle day of week selection
  const handleDaySelect = React.useCallback((dayName: string) => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayIndex = dayNames.indexOf(dayName);
    if (dayIndex === -1) return;

    // Get the current date or use selectedDate as reference
    const referenceDate = safeSelectedDate || new Date();
    const currentDay = referenceDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Convert to 0-6 where 0 = Monday
    const mondayBasedCurrentDay = currentDay === 0 ? 6 : currentDay - 1;
    
    // Calculate days to add to get to the selected day
    let daysToAdd = dayIndex - mondayBasedCurrentDay;
    
    // If the day has passed this week, get next week's occurrence
    if (daysToAdd < 0) {
      daysToAdd += 7;
    }
    
    // If it's the same day, use today, otherwise add days
    const targetDate = new Date(referenceDate);
    if (daysToAdd > 0) {
      targetDate.setDate(referenceDate.getDate() + daysToAdd);
    }
    targetDate.setHours(0, 0, 0, 0);
    
    setSelectedDate(targetDate);
    addToRecentDates(targetDate);
  }, [safeSelectedDate, setSelectedDate, addToRecentDates]);

  const getTimeRange = React.useCallback(() => {
    if (!scheduleDetails) {
      return { minTime: "09:00:00", maxTime: "17:00:00" };
    }

    if (showAll) {
      return {
        minTime: scheduleDetails.OperationTimeAvailability.from,
        maxTime: scheduleDetails.OperationTimeAvailability.to
      };
    } else {
      return {
        minTime: scheduleDetails.Availabilities.from,
        maxTime: scheduleDetails.Availabilities.to
      };
    }
  }, [scheduleDetails, showAll]);

  const contextValue: ScheduleViewContextType = {
    location,
    selectedDate: safeSelectedDate,
    setSelectedDate,
    showAll,
    setShowAll,
    mobileDatePickerOpen,
    setMobileDatePickerOpen,
    desktopDatePickerOpen,
    setDesktopDatePickerOpen,
    isLoadingSchedule,
    scheduleDetails,
    scheduleDetailsLoading,
    scheduleDetailsError,
    teacherViewResources,
    teacherViewError,
    teacherViewEvents,
    teacherViewEventsError,
    teacherViewAvailability,
    classroomViewResources,
    refreshTrigger,
    setRefreshTrigger,
    recentDates,
    setRecentDates,
    updatingEvents,
    setUpdatingEvents,
    teacherCalendarRef,
    convertTeacherViewEventsToCalendar,
    handleEventClick,
    handleEventDrop,
    handleEventResize,
    openDailySchedule,
    goToToday,
    handleDateSelect,
    handleDaySelect,
    getTimeRange,
    programs,
    programsLoading,
    selectedProgram,
    setSelectedProgram,
    teachers,
    teachersLoading,
    selectedTeacher,
    setSelectedTeacher,
  };

  return (
    <ScheduleViewContext.Provider value={contextValue}>
      {children}
    </ScheduleViewContext.Provider>
  );
}

export { ScheduleViewProvider };

export function ScheduleViewControls() {
  const {
    selectedDate,
    handleDaySelect,
    programs,
    programsLoading,
    selectedProgram,
    setSelectedProgram,
    teachers,
    teachersLoading,
    selectedTeacher,
    setSelectedTeacher,
  } = useScheduleViewContext();

  // Days of the week options
  const dayOptions = React.useMemo(() => [
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" },
  ], []);

  // Get current selected day name
  const selectedDayName = React.useMemo(() => {
    if (!selectedDate) return "";
    const dayIndex = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[dayIndex];
  }, [selectedDate]);

  const handleDayChange = React.useCallback((value: string) => {
    if (value) {
      handleDaySelect(value);
    }
  }, [handleDaySelect]);

  return (
    <div className="flex items-center gap-2 flex-shrink-0 justify-end md:justify-start">
      {/* Filter by Label */}
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 hidden md:inline">
        Filter by:
      </span>

      {/* Go To Date - Day of Week Dropdown */}
      <div className="w-[200px]">
        <SearchableSelect
          id="schedule-day-filter"
          options={dayOptions}
          value={selectedDayName}
          onValueChange={handleDayChange}
          placeholder="Go To Date"
          searchPlaceholder="Search days..."
          emptyText="No days available"
          noResultsText="No days found"
          className="h-7 text-xs"
        />
      </div>

      {/* Program Filter */}
      <div className="w-[200px]">
        <SearchableSelect
          id="schedule-program-filter"
          options={programs.map(p => ({ value: p.id.toString(), label: p.name }))}
          value={selectedProgram}
          onValueChange={(value) => setSelectedProgram(value || "")}
          placeholder="Program"
          searchPlaceholder="Search programs..."
          emptyText="No programs available"
          loadingText="Loading programs..."
          noResultsText="No programs found"
          className="h-7 text-xs"
          disabled={programsLoading}
          isLoading={programsLoading}
        />
      </div>

      {/* Teacher Filter */}
      <div className="w-[200px]">
        <SearchableSelect
          id="schedule-teacher-filter"
          options={teachers.map(t => ({ value: t.id.toString(), label: t.name }))}
          value={selectedTeacher}
          onValueChange={(value) => setSelectedTeacher(value || "")}
          placeholder="Teacher"
          searchPlaceholder="Search teachers..."
          emptyText="No teachers available"
          loadingText="Loading teachers..."
          noResultsText="No teachers found"
          className="h-7 text-xs"
          disabled={teachersLoading}
          isLoading={teachersLoading}
        />
      </div>
    </div>
  );
}


export function ScheduleView() {
  const {
    isLoadingSchedule,
    selectedDate,
    setSelectedDate,
    convertTeacherViewEventsToCalendar,
    teacherViewEvents,
    teacherViewResources,
    classroomViewResources,
    handleEventClick,
    handleEventDrop,
    handleEventResize,
    showAll,
    getTimeRange,
    teacherViewAvailability,
    updatingEvents,
    teacherCalendarRef,
  } = useScheduleViewContext();

  const timeRange = getTimeRange();

  if (isLoadingSchedule) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation 
          size="xl" 
          text="Loading schedule data..." 
          className="text-center"
        />
      </div>
    );
  }

  return (
    <div>
      <ReactBigCalendarWrapper
        ref={teacherCalendarRef}
        events={convertTeacherViewEventsToCalendar(teacherViewEvents)}
        resources={teacherViewResources.map(teacher => ({ id: teacher.id, title: teacher.title, description: "" }))}
        date={selectedDate}
        onNavigate={setSelectedDate}
        onEventClick={handleEventClick}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        editable={true}
        showAll={showAll}
        minTime={timeRange.minTime}
        maxTime={timeRange.maxTime}
        availability={teacherViewAvailability}
        viewType="teacher"
        updatingEvents={updatingEvents}
        teachers={teacherViewResources.map(teacher => ({ id: teacher.id, title: teacher.title }))}
        classrooms={classroomViewResources.map(classroom => ({ id: classroom.id, title: classroom.title }))}
        height="75vh"
      />
    </div>
  );
}

// Custom hook for schedule header title and loading state
export function useScheduleHeader(location: string) {
  const [selectedDate] = React.useState<Date>(() => new Date());
  const [scheduleDetails, setScheduleDetails] = React.useState<ScheduleDetails | null>(null);
  const [scheduleDetailsLoading, setScheduleDetailsLoading] = React.useState<boolean>(false);

  const safeSelectedDate = React.useMemo(() => {
    return selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
  }, [selectedDate]);

  React.useEffect(() => {
    if (!location) return;

    const fetchScheduleDetails = async () => {
      try {
        setScheduleDetailsLoading(true);
        const dateStr = format(safeSelectedDate, "yyyy-MM-dd");
        const response = await getScheduleDetails(location, dateStr);
        
        if (response?.success) {
          setScheduleDetails(response.data);
        }
      } catch (error) {
        console.error("Error fetching schedule details:", error);
      } finally {
        setScheduleDetailsLoading(false);
      }
    };

    fetchScheduleDetails();
  }, [location, safeSelectedDate]);

  const headerTitle = React.useMemo(() => {
    return `Schedule for ${format(safeSelectedDate, "EEEE, MMMM do, yyyy")}${scheduleDetails?.Holiday?.description ? ` - ${scheduleDetails.Holiday.description}` : ''}`;
  }, [safeSelectedDate, scheduleDetails]);

  return { headerTitle, scheduleDetailsLoading };
}
