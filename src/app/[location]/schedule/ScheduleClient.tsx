"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Combobox } from "@/components/ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactBigCalendarWrapper } from "@/components/Calendar/ReactBigCalendarWrapper";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { CalendarIcon, Tv, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getProgramsList, getTeachersList, getScheduleDetails, getTeacherView, getTeacherViewEvents, getClassroomViewResources, getClassroomViewEvents, Program, Teacher, ScheduleDetails, TeacherViewResource, TeacherViewEvent, TeacherViewAvailability, ClassroomViewResource, ClassroomViewEvent } from "./schedule.api";
import { formatLocationName } from "@/utils/textUtils";

interface ScheduleClientProps {
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

export function ScheduleClient({ location }: ScheduleClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [currentView, setCurrentView] = useState<"teacher" | "classroom">("teacher");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [showAll, setShowAll] = useState<boolean>(false);
  const [mobileDatePickerOpen, setMobileDatePickerOpen] = useState<boolean>(false);
  const [desktopDatePickerOpen, setDesktopDatePickerOpen] = useState<boolean>(false);
  
  // Initial loading state
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Programs state
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsLoading, setProgramsLoading] = useState<boolean>(true);
  const [programsError, setProgramsError] = useState<string | null>(null);

  // Teachers state
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState<boolean>(true);
  const [teachersError, setTeachersError] = useState<string | null>(null);

  // Schedule details state
  const [scheduleDetails, setScheduleDetails] = useState<ScheduleDetails | null>(null);
  const [scheduleDetailsLoading, setScheduleDetailsLoading] = useState<boolean>(false);
  const [scheduleDetailsError, setScheduleDetailsError] = useState<string | null>(null);

  // Teacher view state
  const [teacherViewResources, setTeacherViewResources] = useState<TeacherViewResource[]>([]);
  const [teacherViewError, setTeacherViewError] = useState<string | null>(null);

  // Teacher view events state
  const [teacherViewEvents, setTeacherViewEvents] = useState<TeacherViewEvent[]>([]);
  const [teacherViewEventsError, setTeacherViewEventsError] = useState<string | null>(null);

  // Teacher view availability state
  const [teacherViewAvailability, setTeacherViewAvailability] = useState<TeacherViewAvailability[]>([]);

  // Classroom view state
  const [classroomViewResources, setClassroomViewResources] = useState<ClassroomViewResource[]>([]);
  const [classroomViewEvents, setClassroomViewEvents] = useState<ClassroomViewEvent[]>([]);
  const [classroomViewError, setClassroomViewError] = useState<string | null>(null);

  // Ensure selectedDate is always valid
  const safeSelectedDate = useMemo(() => {
    return selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
  }, [selectedDate]);

  // Handle resetDate parameter from URL
  useEffect(() => {
    const resetDate = searchParams.get('resetDate');
    if (resetDate === 'true') {
      // Reset date to today
      setSelectedDate(new Date());
      router.replace('schedule');
    }
  }, [searchParams, router]);

  // Fetch programs and teachers on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsInitialLoading(true);
      
      // Fetch programs
      try {
        setProgramsLoading(true);
        setProgramsError(null);
        const programsResponse = await getProgramsList();
        
        if (programsResponse?.success) {
          setPrograms(programsResponse.data);
        } else {
          setProgramsError(programsResponse?.message || 'Failed to fetch programs');
        }
      } catch (error) {
        setProgramsError(error instanceof Error ? error.message : 'Failed to fetch programs');
      } finally {
        setProgramsLoading(false);
      }

      // Fetch teachers
      try {
        setTeachersLoading(true);
        setTeachersError(null);
        const teachersResponse = await getTeachersList(location);
        
        if (teachersResponse?.success) {
          setTeachers(teachersResponse.data);
        } else {
          setTeachersError(teachersResponse?.message || 'Failed to fetch teachers');
        }
      } catch (error) {
        setTeachersError(error instanceof Error ? error.message : 'Failed to fetch teachers');
      } finally {
        setTeachersLoading(false);
      }

      // Fetch classroom view resources
      try {
        setClassroomViewError(null);
        const classroomResourcesResponse = await getClassroomViewResources(location);
        
        if (classroomResourcesResponse?.success) {
          setClassroomViewResources(classroomResourcesResponse.data.resources);
        } else {
          setClassroomViewError(classroomResourcesResponse?.message || 'Failed to fetch classroom resources');
        }
      } catch (error) {
        setClassroomViewError(error instanceof Error ? error.message : 'Failed to fetch classroom resources');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, [location]);

  // Fetch schedule details when date changes
  useEffect(() => {
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

  // Fetch teacher view data when filters or date change
  useEffect(() => {
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
  useEffect(() => {
    const fetchTeacherViewEvents = async () => {
      try {
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
      }
    };

    fetchTeacherViewEvents();
  }, [location, safeSelectedDate, showAll, selectedProgram, selectedTeacher]);

  // Fetch classroom view events when date changes
  useEffect(() => {
    const fetchClassroomViewEvents = async () => {
      try {
        setClassroomViewError(null);
        const dateStr = format(safeSelectedDate, "yyyy-MM-dd");
        
        const response = await getClassroomViewEvents(location, dateStr);
        
        if (response?.success) {
          setClassroomViewEvents(response.data.events);
        } else {
          setClassroomViewError(response?.message || 'Failed to fetch classroom view events');
        }
      } catch (error) {
        setClassroomViewError(error instanceof Error ? error.message : 'Failed to fetch classroom view events');
      }
    };

    fetchClassroomViewEvents();
  }, [location, safeSelectedDate]);

  // Convert API events to calendar format
  const convertTeacherViewEventsToCalendar = (events: TeacherViewEvent[]): CalendarEvent[] => {
    return events.map(event => {
      const tooltip = event.tooltip || [];
      
      const tooltipString = tooltip.map(t => `${t.name}: ${t.value}`).join('\n');
      
      const calendarEvent = {
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
  };

  // Convert classroom view events to calendar format
  const convertClassroomViewEventsToCalendar = (events: ClassroomViewEvent[]): CalendarEvent[] => {
    return events.map(event => {
      const tooltip = event.tooltip || [];
      
      const tooltipString = tooltip.map(t => `${t.name}: ${t.value}`).join('\n');
      
      const calendarEvent = {
        id: event.id.toString(),
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        resourceId: event.resourceId,
        backgroundColor: event.backgroundColor,
        borderColor: event.backgroundColor,
        className: event.className,
        extendedProps: {
          lessonId: event.id.toString(),
          teacher: tooltip.find(t => t.name === "Teacher")?.value || "",
          classroom: tooltip.find(t => t.name === "Classroom")?.value || "",
          program: tooltip.find(t => t.name === "Program")?.value || "",
          isOwing: false, // Classroom view doesn't have owing info
          isOnline: false, // Classroom view doesn't have online info
          isOwingRentalAgreement: false, // Classroom view doesn't have rental info
          tooltip: tooltipString,
          url: event.url
        }
      };
      
      return calendarEvent;
    });
  };


  const handleEventClick = (event: CalendarEvent) => {
    // Navigate to lesson details if URL is available
    if (event.extendedProps?.url) {
      window.open(event.extendedProps.url, '_self');
    }
  };

  const handleEventDrop = () => {
    // TODO: Update lesson time
  };

  const handleEventResize = () => {
    // TODO: Update lesson duration
  };

  const openDailySchedule = () => {
    const dateStr = format(safeSelectedDate, "dd-MM-yyyy");
    window.open(`/admin/${location}/daily-schedule?date=${dateStr}`, '_blank');
  };

  // Get time range based on view type and Show All checkbox
  const getTimeRange = () => {
    if (!scheduleDetails) {
      return { minTime: "09:00:00", maxTime: "17:00:00" }; // Default fallback
    }

    if (currentView === "classroom") {
      // Classroom view always uses OperationTimeAvailability
      return {
        minTime: scheduleDetails.OperationTimeAvailability.from,
        maxTime: scheduleDetails.OperationTimeAvailability.to
      };
    } else if (showAll) {
      // Teacher view uses OperationTimeAvailability when Show All is checked
      return {
        minTime: scheduleDetails.OperationTimeAvailability.from,
        maxTime: scheduleDetails.OperationTimeAvailability.to
      };
    } else {
      // Teacher view uses Availabilities when Show All is unchecked
      return {
        minTime: scheduleDetails.Availabilities.from,
        maxTime: scheduleDetails.Availabilities.to
      };
    }
  };

  const timeRange = getTimeRange();

  // Show full-page loading animation while fetching initial data
  if (isInitialLoading) {
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
    <div className="min-h-screen flex flex-col">
      {/* Compact Header - Responsive height */}
      <div className="flex-shrink-0 max-h-[200px] md:max-h-[100px] space-y-2">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight truncate">
              Schedule - {format(safeSelectedDate, "MMM do, yyyy")}
            {scheduleDetailsLoading && (
                <span className="ml-2 text-xs text-muted-foreground">(Loading...)</span>
            )}
          </h1>
            <p className="text-xs text-muted-foreground truncate">
              {formatLocationName(location)}
            {scheduleDetails && (
                <span className="ml-1">
                  • {timeRange.minTime}-{timeRange.maxTime}
                  {showAll ? " (All)" : " (Available)"}
                </span>
              )}
              {currentView === "teacher" && teacherViewResources.length > 0 && (
                <span className="ml-1">
                  • {teacherViewResources.length} teacher{teacherViewResources.length !== 1 ? 's' : ''}
                </span>
              )}
              {currentView === "teacher" && teacherViewEvents.length > 0 && (
                <span className="ml-1">
                  • {teacherViewEvents.length} lesson{teacherViewEvents.length !== 1 ? 's' : ''}
                </span>
              )}
              {currentView === "classroom" && classroomViewResources.length > 0 && (
                <span className="ml-1">
                  • {classroomViewResources.length} classroom{classroomViewResources.length !== 1 ? 's' : ''}
                </span>
              )}
              {currentView === "classroom" && classroomViewEvents.length > 0 && (
                <span className="ml-1">
                  • {classroomViewEvents.length} lesson{classroomViewEvents.length !== 1 ? 's' : ''}
                </span>
              )}
          </p>
        </div>
        
          <div className="flex items-center gap-2 flex-shrink-0">
          {/* Show All Toggle - Only show in teacher view */}
            {currentView === "teacher" && (
              <div className="flex items-center space-x-1">
                <input
                  id="show-all"
                  type="checkbox"
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                  className="rounded border-gray-300 h-3 w-3"
                />
                <label htmlFor="show-all" className="text-xs font-medium">
                  Show All
                </label>
              </div>
            )}
          
          {/* TV Icon */}
          <Button
            variant="outline"
              size="sm"
            onClick={openDailySchedule}
            title="Open Daily Schedule"
              className="h-7 w-7 p-0"
          >
              <Tv className="h-3 w-3" />
          </Button>
        </div>
      </div>

        {/* Tabs and Filters Row - Responsive */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 md:gap-4">
          {/* Tabs on the left */}
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "teacher" | "classroom")}>
            <TabsList className="grid grid-cols-2 h-7 md:h-8 w-auto">
              <TabsTrigger value="teacher" className="text-xs px-2 md:px-4">Teacher View</TabsTrigger>
              <TabsTrigger value="classroom" className="text-xs px-2 md:px-4">Classroom View</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters - Responsive Layout */}
          <div className="w-full lg:w-auto">
            {/* Error display - compact */}
            {(programsError || teachersError || scheduleDetailsError || teacherViewError || teacherViewEventsError || classroomViewError) && (
              <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded mb-2">
                {programsError || teachersError || scheduleDetailsError || teacherViewError || teacherViewEventsError || classroomViewError}
          </div>
        )}
        
              {/* Mobile: Compact single line, Desktop: Keep horizontal */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-3">
              {/* Mobile: Compact filter layout */}
              <div className="flex flex-col md:hidden gap-1">
                {currentView === "teacher" && (
                  <div className="flex items-center gap-1 text-xs">
                    <Filter className="h-3 w-3" />
                    <span className="font-medium">Filter by:</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {/* Date Picker - mobile compact */}
                  <div className="flex-1 min-w-[80px]">
                    <Popover open={mobileDatePickerOpen} onOpenChange={setMobileDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full h-6 px-1 text-xs justify-center font-normal",
                            !safeSelectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {safeSelectedDate ? format(safeSelectedDate, "MMM dd") : "Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={safeSelectedDate}
                            onSelect={(date) => {
                              if (date) {
                                setSelectedDate(date);
                                setMobileDatePickerOpen(false);
                              }
                            }}
                          />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Program Filter - mobile compact - Only show in teacher view */}
                  {currentView === "teacher" && (
                    <div className="flex-1 min-w-[80px]">
                      <Combobox
                        options={[
                          { value: "all", label: "All Programs" },
                          ...programs.map((program) => ({
                            value: program.id.toString(),
                            label: program.name,
                          }))
                        ]}
                        value={selectedProgram || "all"}
                        onValueChange={(value) => setSelectedProgram(value === "all" ? "" : value)}
                        placeholder={programsLoading ? "Loading..." : "Program"}
                        searchPlaceholder="Search programs..."
                        emptyText="No programs found."
                        disabled={programsLoading}
                      />
                    </div>
                  )}

                  {/* Teacher Filter - mobile compact - Only show in teacher view */}
                  {currentView === "teacher" && (
                    <div className="flex-1 min-w-[80px]">
                      <Combobox
                        options={[
                          { value: "all", label: "All Teachers" },
                          ...teachers.map((teacher) => ({
                            value: teacher.id.toString(),
                            label: teacher.name,
                          }))
                        ]}
                        value={selectedTeacher || "all"}
                        onValueChange={(value) => setSelectedTeacher(value === "all" ? "" : value)}
                        placeholder={teachersLoading ? "Loading..." : "Teacher"}
                        searchPlaceholder="Search teachers..."
                        emptyText="No teachers found."
                        disabled={teachersLoading}
                      />
                    </div>
                  )}
                </div>
          </div>

              {/* Desktop: Original horizontal layout */}
              <div className="hidden md:flex items-center gap-2">
                {currentView === "teacher" && (
                  <div className="flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    <span className="font-medium text-xs">Filters:</span>
                  </div>
                )}
        
                {/* Date Picker - desktop */}
                <Popover open={desktopDatePickerOpen} onOpenChange={setDesktopDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
                      size="sm"
              className={cn(
                        "h-7 px-2 text-xs justify-start font-normal min-w-[120px]",
                !safeSelectedDate && "text-muted-foreground"
              )}
            >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {safeSelectedDate ? format(safeSelectedDate, "MMM dd") : "Pick date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={safeSelectedDate}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDate(date);
                            setDesktopDatePickerOpen(false);
                          }
                        }}
                      />
          </PopoverContent>
        </Popover>

                {/* Program Filter - desktop - Only show in teacher view */}
                {currentView === "teacher" && (
                  <div className="min-w-[100px]">
                    <Combobox
                      options={[
                        { value: "all", label: "All Programs" },
                        ...programs.map((program) => ({
                          value: program.id.toString(),
                          label: program.name,
                        }))
                      ]}
                      value={selectedProgram || "all"}
                      onValueChange={(value) => setSelectedProgram(value === "all" ? "" : value)}
                      placeholder={programsLoading ? "Loading..." : "Program"}
                      searchPlaceholder="Search programs..."
                      emptyText="No programs found."
                      disabled={programsLoading}
                    />
                  </div>
                )}

                {/* Teacher Filter - desktop - Only show in teacher view */}
                {currentView === "teacher" && (
                  <div className="min-w-[100px]">
                    <Combobox
                      options={[
                        { value: "all", label: "All Teachers" },
                        ...teachers.map((teacher) => ({
                          value: teacher.id.toString(),
                          label: teacher.name,
                        }))
                      ]}
                      value={selectedTeacher || "all"}
                      onValueChange={(value) => setSelectedTeacher(value === "all" ? "" : value)}
                      placeholder={teachersLoading ? "Loading..." : "Teacher"}
                      searchPlaceholder="Search teachers..."
                      emptyText="No teachers found."
                      disabled={teachersLoading}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content - Natural height */}
      <div className="flex-1">
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "teacher" | "classroom")}>
          <TabsContent value="teacher">
            <div>
               <ReactBigCalendarWrapper
                 events={convertTeacherViewEventsToCalendar(teacherViewEvents)}
                 resources={teacherViewResources.map(teacher => ({ id: teacher.id, title: teacher.title, description: "" }))}
                 date={safeSelectedDate}
                 onNavigate={setSelectedDate}
                 onEventClick={handleEventClick}
                 onEventDrop={handleEventDrop}
                 onEventResize={handleEventResize}
                 editable={true}
                 showAll={showAll}
                 selectedProgram={selectedProgram}
                 selectedTeacher={selectedTeacher}
                 minTime={timeRange.minTime}
                 maxTime={timeRange.maxTime}
                 availability={teacherViewAvailability}
               />
           </div>
         </TabsContent>
        
          <TabsContent value="classroom">
            <div>
               <ReactBigCalendarWrapper
                 events={convertClassroomViewEventsToCalendar(classroomViewEvents)}
                 resources={classroomViewResources.map(classroom => ({ id: classroom.id, title: classroom.title, description: classroom.description }))}
                 date={safeSelectedDate}
                 onNavigate={setSelectedDate}
                 onEventClick={handleEventClick}
                 onEventDrop={handleEventDrop}
                 onEventResize={handleEventResize}
                 editable={true}
                 showAll={showAll}
                 selectedProgram={selectedProgram}
                 selectedTeacher={selectedTeacher}
                 minTime={timeRange.minTime}
                 maxTime={timeRange.maxTime}
               />
           </div>
         </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
