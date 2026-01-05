"use client";

import * as React from "react";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { ReactBigCalendarWrapper, CalendarWrapperRef } from "@/components/Calendar/ReactBigCalendarWrapper";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { 
  getScheduleDetails, 
  getTeacherView, 
  getTeacherViewEvents,
  ScheduleDetails,
  TeacherViewResource,
  TeacherViewEvent,
  TeacherViewAvailability,
  Program,
  Teacher,
} from "../../schedule/schedule.api";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { updateLesson, formatDateTimeForLegacy, formatDurationForLegacy } from "@/lib/api/legacyApiAdapter";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/redux/store";
import { fetchTeachersByProgram, fetchAllTeachers } from "../scheduleFilters.slice";
import { Maximize, Minimize } from "lucide-react";

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
  isLoadingSchedule: boolean;
  scheduleDetails: ScheduleDetails | null;
  scheduleDetailsLoading: boolean;
  teacherViewResources: TeacherViewResource[];
  teacherViewEvents: TeacherViewEvent[];
  teacherViewAvailability: TeacherViewAvailability[];
  refreshTrigger: number;
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
  updatingEvents: Set<string>;
  setUpdatingEvents: React.Dispatch<React.SetStateAction<Set<string>>>;
  teacherCalendarRef: React.MutableRefObject<CalendarWrapperRef | null>;
  convertTeacherViewEventsToCalendar: (events: TeacherViewEvent[]) => CalendarEvent[];
  handleEventClick: (event: CalendarEvent) => void;
  handleEventDrop: (event: CalendarEvent) => Promise<void>;
  handleEventResize: (event: CalendarEvent) => Promise<void>;
  openDailySchedule: () => void;
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
  // Fullscreen
  isFullScreen: boolean;
  setIsFullScreen: (value: boolean) => void;
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
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state for programs and teachers
  const programs = useSelector((state: RootState) => state.scheduleFilters.programs);
  const programsLoading = useSelector((state: RootState) => state.scheduleFilters.programsLoading);
  const teachersByProgram = useSelector((state: RootState) => state.scheduleFilters.teachersByProgram);
  const allTeachers = useSelector((state: RootState) => state.scheduleFilters.allTeachers);
  const teachersLoading = useSelector((state: RootState) => state.scheduleFilters.teachersLoading);
  
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => new Date());
  const [showAll, setShowAll] = React.useState<boolean>(true);
  const [isLoadingSchedule, setIsLoadingSchedule] = React.useState<boolean>(false);
  const [scheduleDetails, setScheduleDetails] = React.useState<ScheduleDetails | null>(null);
  const [scheduleDetailsLoading, setScheduleDetailsLoading] = React.useState<boolean>(false);
  const [teacherViewResources, setTeacherViewResources] = React.useState<TeacherViewResource[]>([]);
  const [teacherViewEvents, setTeacherViewEvents] = React.useState<TeacherViewEvent[]>([]);
  const [teacherViewAvailability, setTeacherViewAvailability] = React.useState<TeacherViewAvailability[]>([]);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [updatingEvents, setUpdatingEvents] = React.useState<Set<string>>(new Set());
  const teacherCalendarRef = React.useRef<CalendarWrapperRef>(null);
  
  // Local filter state (UI state) - initialize with "all" for both
  const [selectedProgram, setSelectedProgram] = React.useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = React.useState<string>("all");
  
  // Fullscreen state
  const [isFullScreen, setIsFullScreen] = React.useState<boolean>(false);
  
  // Get teachers based on selected program
  const teachers = React.useMemo(() => {
    if (selectedProgram === "all") {
      return allTeachers;
    }
    return selectedProgram ? (teachersByProgram[selectedProgram] || []) : [];
  }, [selectedProgram, teachersByProgram, allTeachers]);

  const safeSelectedDate = React.useMemo(() => {
    return selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
  }, [selectedDate]);

  // Fetch schedule details when date changes (only if location is available)
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

  // Programs are already loaded in page.tsx and stored in Redux

  // Fetch teachers when program selection changes
  React.useEffect(() => {
    if (!location) return;

    if (selectedProgram === "all") {
      // Fetch all teachers if not already loaded
      if (allTeachers.length === 0) {
        dispatch(fetchAllTeachers(location));
      }
    } else if (selectedProgram && selectedProgram !== "all") {
      // Check if teachers for this program are already in Redux
      if (!teachersByProgram[selectedProgram]) {
        // Fetch teachers by program and store in Redux
        dispatch(fetchTeachersByProgram({ location, programId: selectedProgram }));
      }
    }
  }, [location, selectedProgram, teachersByProgram, allTeachers, dispatch]);

  // Fetch teacher view data when filters or date change
  React.useEffect(() => {
    if (!location) return;

    const fetchTeacherView = async () => {
      try {
        const dateStr = format(safeSelectedDate, "yyyy-MM-dd");
        // Only pass programId if it's a valid number string (not "all" or empty)
        const programIdParam = selectedProgram && selectedProgram !== "all" ? selectedProgram : undefined;
        const teacherIdParam = selectedTeacher && selectedTeacher !== "all" ? selectedTeacher : undefined;
        
        const response = await getTeacherView(
          location, 
          dateStr, 
          showAll,
          programIdParam,
          teacherIdParam
        );
        
        if (response?.success) {
          setTeacherViewResources(response.data.resources);
        }
      } catch (error) {
        console.error("Error fetching teacher view:", error);
      }
    };

    fetchTeacherView();
  }, [location, safeSelectedDate, showAll, selectedProgram, selectedTeacher]);

  // Fetch teacher view events when filters or date change
  React.useEffect(() => {
    if (!location) return;
    
    const fetchTeacherViewEvents = async () => {
      try {
        setIsLoadingSchedule(true);
        const dateStr = format(safeSelectedDate, "yyyy-MM-dd");
        
        // Only pass programId if it's a valid number string (not "all" or empty)
        const programIdParam = selectedProgram && selectedProgram !== "all" ? selectedProgram : undefined;
        const teacherIdParam = selectedTeacher && selectedTeacher !== "all" ? selectedTeacher : undefined;
        
        const response = await getTeacherViewEvents(
          location, 
          dateStr, 
          showAll,
          programIdParam,
          teacherIdParam
        );
        
        if (response?.success) {
          setTeacherViewEvents(response.data.lessons);
          setTeacherViewAvailability(response.data.availability || []);
        }
      } catch (error) {
        console.error("Error fetching teacher view events:", error);
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
  }, [safeSelectedDate, setSelectedDate]);

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
    isLoadingSchedule,
    scheduleDetails,
    scheduleDetailsLoading,
    teacherViewResources,
    teacherViewEvents,
    teacherViewAvailability,
    refreshTrigger,
    setRefreshTrigger,
    updatingEvents,
    setUpdatingEvents,
    teacherCalendarRef,
    convertTeacherViewEventsToCalendar,
    handleEventClick,
    handleEventDrop,
    handleEventResize,
    openDailySchedule,
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
    isFullScreen,
    setIsFullScreen,
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
          options={[
            { value: "all", label: "All Program" },
            ...programs.map(p => ({ value: p.id.toString(), label: p.name }))
          ]}
          value={selectedProgram}
          onValueChange={(value) => {
            setSelectedProgram(value || "all");
            // Reset teacher selection to "all" when program changes
            setSelectedTeacher("all");
          }}
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
          options={[
            { value: "all", label: "All Teacher" },
            ...teachers.map(t => ({ value: t.id.toString(), label: t.name }))
          ]}
          value={selectedTeacher}
          onValueChange={(value) => setSelectedTeacher(value || "all")}
          placeholder={selectedProgram === "all" ? "Teacher" : selectedProgram ? "Teacher" : "Select a program first"}
          searchPlaceholder="Search teachers..."
          emptyText="No teachers available"
          loadingText="Loading teachers..."
          noResultsText="No teachers found"
          className="h-7 text-xs"
          disabled={!selectedProgram || teachersLoading}
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
    handleEventClick,
    handleEventDrop,
    handleEventResize,
    showAll,
    setShowAll,
    getTimeRange,
    teacherViewAvailability,
    updatingEvents,
    teacherCalendarRef,
    isFullScreen,
    setIsFullScreen,
    scheduleDetails,
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
    <>
      {/* Regular Calendar View */}
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
          editable={false}
          showAll={showAll}
          minTime={timeRange.minTime}
          maxTime={timeRange.maxTime}
          availability={teacherViewAvailability}
          viewType="teacher"
          updatingEvents={updatingEvents}
          teachers={teacherViewResources.map(teacher => ({ id: teacher.id, title: teacher.title }))}
          height="75vh"
        />
      </div>

      {/* Fullscreen Overlay */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-background p-4 flex flex-col gap-4">
          {/* Fullscreen Header */}
          <div className="flex justify-between items-center flex-shrink-0">
            <h1 className="sm:text-lg md:text-xl font-bold tracking-tight truncate">
              Schedule for {format(selectedDate, "EEEE, MMMM do, yyyy")}
              {scheduleDetails?.Holiday?.description ? ` - ${scheduleDetails.Holiday.description}` : ''}
            </h1>

            <div className="flex items-center gap-2">
              {/* Show All Checkbox */}
              <div className="flex items-center space-x-1">
                <input
                  id="show-all-fullscreen"
                  type="checkbox"
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                  className="rounded border-gray-300 h-3 w-3"
                />
                <label htmlFor="show-all-fullscreen" className="text-xs font-medium">
                  Show All
                </label>
              </div>

              {/* Exit Fullscreen Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullScreen(false)}
                title="Exit Fullscreen"
                className="h-7 w-7 p-0"
              >
                <Minimize className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Fullscreen Calendar */}
          <div className="flex-1 relative overflow-y-auto">
            <ReactBigCalendarWrapper
              ref={teacherCalendarRef}
              events={convertTeacherViewEventsToCalendar(teacherViewEvents)}
              resources={teacherViewResources.map(teacher => ({ id: teacher.id, title: teacher.title, description: "" }))}
              date={selectedDate}
              onNavigate={setSelectedDate}
              onEventClick={handleEventClick}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              editable={false}
              showAll={showAll}
              minTime={timeRange.minTime}
              maxTime={timeRange.maxTime}
              availability={teacherViewAvailability}
              viewType="teacher"
              updatingEvents={updatingEvents}
              teachers={teacherViewResources.map(teacher => ({ id: teacher.id, title: teacher.title }))}
              height="85vh"
            />
          </div>
        </div>
      )}
    </>
  );
}

// Schedule Header Component
export function ScheduleHeader() {
  const {
    selectedDate,
    scheduleDetails,
    scheduleDetailsLoading,
    showAll,
    setShowAll,
    isFullScreen,
    setIsFullScreen,
  } = useScheduleViewContext();

  const headerTitle = React.useMemo(() => {
    return `Schedule for ${format(selectedDate, "EEEE, MMMM do, yyyy")}${scheduleDetails?.Holiday?.description ? ` - ${scheduleDetails.Holiday.description}` : ''}`;
  }, [selectedDate, scheduleDetails]);

  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <h1 className="sm:text-lg md:text-xl font-bold tracking-tight truncate">
        {headerTitle}
        {scheduleDetailsLoading && (
          <span className="ml-2 text-xs text-muted-foreground">(Loading...)</span>
        )}
      </h1>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Show All Checkbox */}
        <div className="flex items-center space-x-1">
          <input
            id="show-all-header"
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="rounded border-gray-300 h-3 w-3"
          />
          <label htmlFor="show-all-header" className="text-xs font-medium">
            Show All
          </label>
        </div>

        {/* Fullscreen Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullScreen(true)}
          title="Enter Fullscreen"
          className="h-7 w-7 p-0 hidden md:flex"
        >
          <Maximize className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
