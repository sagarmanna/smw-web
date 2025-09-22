"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Combobox } from "@/components/ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactBigCalendarWrapper } from "@/components/Calendar/ReactBigCalendarWrapper";
import { CalendarIcon, Tv, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getProgramsList, getTeachersList, getScheduleDetails, getTeacherView, Program, Teacher, ScheduleDetails, TeacherViewResource } from "./schedule.api";

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
    isOwing?: boolean;
    isOnline?: boolean;
    isOwingRentalAgreement?: boolean;
    tooltip?: string;
    programId?: string;
  };
}

// Dummy data for development

const dummyClassrooms = [
  { id: 1, title: "Room A", description: "Main classroom" },
  { id: 2, title: "Room B", description: "Small group room" },
  { id: 3, title: "Room C", description: "Private lesson room" },
  { id: 4, title: "Room D", description: "Equipment room" },
];

// Generate dummy events for today
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

// Generate events for resource timeline (teachers as columns)
// Events for today
const todayEvents = [
  {
    id: "1",
    title: "Basic Training",
    start: new Date(`${todayStr}T09:00:00`),
    end: new Date(`${todayStr}T10:30:00`),
    resourceId: 1, // John Smith
    backgroundColor: "#3b82f6",
    borderColor: "#1d4ed8",
    className: "private-lesson",
    extendedProps: {
      lessonId: "1",
      teacher: "John Smith",
      classroom: "Room A",
      isOwing: false,
      isOnline: false,
      isOwingRentalAgreement: false,
      tooltip: "Private Lesson: John Smith - Basic Training\nClassroom: Room A"
    }
  },
  {
    id: "2",
    title: "Group Class (5 students)",
    start: new Date(`${todayStr}T10:30:00`),
    end: new Date(`${todayStr}T12:00:00`),
    resourceId: 2, // Sarah Johnson
    backgroundColor: "#10b981",
    borderColor: "#059669",
    className: "group-lesson",
    extendedProps: {
      lessonId: "2",
      teacher: "Sarah Johnson",
      classroom: "Room B",
      isOwing: true,
      isOnline: false,
      isOwingRentalAgreement: false,
      tooltip: "Group Lesson: Sarah Johnson - Advanced Training (5 students)\nClassroom: Room B"
    }
  },
  {
    id: "3",
    title: "Online Session",
    start: new Date(`${todayStr}T14:00:00`),
    end: new Date(`${todayStr}T15:00:00`),
    resourceId: 3, // Mike Wilson
    backgroundColor: "#8b5cf6",
    borderColor: "#7c3aed",
    className: "online-lesson",
    extendedProps: {
      lessonId: "3",
      teacher: "Mike Wilson",
      classroom: "Online",
      isOwing: false,
      isOnline: true,
      isOwingRentalAgreement: true,
      tooltip: "Online Lesson: Mike Wilson - Specialized Training\nClassroom: Online"
    }
  },
  {
    id: "4",
    title: "Private Lesson",
    start: new Date(`${todayStr}T15:30:00`),
    end: new Date(`${todayStr}T16:30:00`),
    resourceId: 4, // Emily Davis
    backgroundColor: "#f59e0b",
    borderColor: "#d97706",
    className: "private-lesson",
    extendedProps: {
      lessonId: "4",
      teacher: "Emily Davis",
      classroom: "Room C",
      isOwing: false,
      isOnline: false,
      isOwingRentalAgreement: false,
      tooltip: "Private Lesson: Emily Davis - Specialized Training\nClassroom: Room C"
    }
  },
  {
    id: "5",
    title: "Basic Training",
    start: new Date(`${todayStr}T11:00:00`),
    end: new Date(`${todayStr}T12:30:00`),
    resourceId: 1, // John Smith - second lesson
    backgroundColor: "#3b82f6",
    borderColor: "#1d4ed8",
    className: "private-lesson",
    extendedProps: {
      lessonId: "5",
      teacher: "John Smith",
      classroom: "Room A",
      isOwing: false,
      isOnline: false,
      isOwingRentalAgreement: false,
      tooltip: "Private Lesson: John Smith - Basic Training\nClassroom: Room A"
    }
  },
];

// Events for September 20, 2024
const sep20Events = [
  {
    id: "sep20-1",
    title: "Morning Session",
    start: new Date("2024-09-20T08:30:00"),
    end: new Date("2024-09-20T10:00:00"),
    resourceId: 1, // John Smith
    backgroundColor: "#3b82f6",
    borderColor: "#1d4ed8",
    className: "private-lesson",
    extendedProps: {
      lessonId: "sep20-1",
      teacher: "John Smith",
      classroom: "Room A",
      isOwing: false,
      isOnline: false,
      isOwingRentalAgreement: false,
      tooltip: "Private Lesson: John Smith - Morning Session\nClassroom: Room A"
    }
  },
  {
    id: "sep20-2",
    title: "Advanced Workshop",
    start: new Date("2024-09-20T09:00:00"),
    end: new Date("2024-09-20T11:00:00"),
    resourceId: 2, // Sarah Johnson
    backgroundColor: "#10b981",
    borderColor: "#059669",
    className: "group-lesson",
    extendedProps: {
      lessonId: "sep20-2",
      teacher: "Sarah Johnson",
      classroom: "Room B",
      isOwing: true,
      isOnline: false,
      isOwingRentalAgreement: false,
      tooltip: "Group Lesson: Sarah Johnson - Advanced Workshop (8 students)\nClassroom: Room B"
    }
  },
  {
    id: "sep20-3",
    title: "Online Consultation",
    start: new Date("2024-09-20T10:15:00"),
    end: new Date("2024-09-20T11:15:00"),
    resourceId: 3, // Mike Wilson
    backgroundColor: "#8b5cf6",
    borderColor: "#7c3aed",
    className: "online-lesson",
    extendedProps: {
      lessonId: "sep20-3",
      teacher: "Mike Wilson",
      classroom: "Online",
      isOwing: false,
      isOnline: true,
      isOwingRentalAgreement: false,
      tooltip: "Online Lesson: Mike Wilson - Consultation\nClassroom: Online"
    }
  },
  {
    id: "sep20-4",
    title: "Specialized Training",
    start: new Date("2024-09-20T11:30:00"),
    end: new Date("2024-09-20T13:00:00"),
    resourceId: 4, // Emily Davis
    backgroundColor: "#f59e0b",
    borderColor: "#d97706",
    className: "private-lesson",
    extendedProps: {
      lessonId: "sep20-4",
      teacher: "Emily Davis",
      classroom: "Room C",
      isOwing: false,
      isOnline: false,
      isOwingRentalAgreement: true,
      tooltip: "Private Lesson: Emily Davis - Specialized Training\nClassroom: Room C"
    }
  },
  {
    id: "sep20-5",
    title: "Afternoon Session",
    start: new Date("2024-09-20T14:00:00"),
    end: new Date("2024-09-20T15:30:00"),
    resourceId: 1, // John Smith
    backgroundColor: "#3b82f6",
    borderColor: "#1d4ed8",
    className: "private-lesson",
    extendedProps: {
      lessonId: "sep20-5",
      teacher: "John Smith",
      classroom: "Room A",
      isOwing: true,
      isOnline: false,
      isOwingRentalAgreement: false,
      tooltip: "Private Lesson: John Smith - Afternoon Session\nClassroom: Room A"
    }
  },
  {
    id: "sep20-6",
    title: "Group Practice",
    start: new Date("2024-09-20T15:00:00"),
    end: new Date("2024-09-20T16:30:00"),
    resourceId: 2, // Sarah Johnson
    backgroundColor: "#10b981",
    borderColor: "#059669",
    className: "group-lesson",
    extendedProps: {
      lessonId: "sep20-6",
      teacher: "Sarah Johnson",
      classroom: "Room B",
      isOwing: false,
      isOnline: false,
      isOwingRentalAgreement: false,
      tooltip: "Group Lesson: Sarah Johnson - Practice Session (6 students)\nClassroom: Room B"
    }
  },
  {
    id: "sep20-7",
    title: "Evening Class",
    start: new Date("2024-09-20T17:00:00"),
    end: new Date("2024-09-20T18:30:00"),
    resourceId: 3, // Mike Wilson
    backgroundColor: "#8b5cf6",
    borderColor: "#7c3aed",
    className: "group-lesson",
    extendedProps: {
      lessonId: "sep20-7",
      teacher: "Mike Wilson",
      classroom: "Room D",
      isOwing: false,
      isOnline: false,
      isOwingRentalAgreement: false,
      tooltip: "Group Lesson: Mike Wilson - Evening Class (4 students)\nClassroom: Room D"
    }
  },
  {
    id: "sep20-8",
    title: "Final Session",
    start: new Date("2024-09-20T18:00:00"),
    end: new Date("2024-09-20T19:00:00"),
    resourceId: 4, // Emily Davis
    backgroundColor: "#f59e0b",
    borderColor: "#d97706",
    className: "private-lesson",
    extendedProps: {
      lessonId: "sep20-8",
      teacher: "Emily Davis",
      classroom: "Room C",
      isOwing: false,
      isOnline: true,
      isOwingRentalAgreement: false,
      tooltip: "Online Lesson: Emily Davis - Final Session\nClassroom: Online"
    }
  },
];

// Combine all events
const dummyEvents = [...todayEvents, ...sep20Events];


export function ScheduleClient({ location }: ScheduleClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [currentView, setCurrentView] = useState<"teacher" | "classroom">("teacher");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [showAll, setShowAll] = useState<boolean>(false);
  
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
  const [teacherViewLoading, setTeacherViewLoading] = useState<boolean>(false);
  const [teacherViewError, setTeacherViewError] = useState<string | null>(null);

  // Ensure selectedDate is always valid
  const safeSelectedDate = useMemo(() => {
    return selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
  }, [selectedDate]);

  // Fetch programs and teachers on component mount
  useEffect(() => {
    const fetchData = async () => {
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
        setTeacherViewLoading(true);
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
      } finally {
        setTeacherViewLoading(false);
      }
    };

    fetchTeacherView();
  }, [location, safeSelectedDate, showAll, selectedProgram, selectedTeacher]);

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
    // TODO: Navigate to lesson details
  };

  const handleEventDrop = (event: CalendarEvent) => {
    console.log("Event dropped:", event);
    // TODO: Update lesson time
  };

  const handleEventResize = (event: CalendarEvent) => {
    console.log("Event resized:", event);
    // TODO: Update lesson duration
  };

  const openDailySchedule = () => {
    const dateStr = format(safeSelectedDate, "dd-MM-yyyy");
    window.open(`/admin/v2/${location}/daily-schedule?date=${dateStr}`, '_blank');
  };

  // Get time range based on Show All checkbox
  const getTimeRange = () => {
    if (!scheduleDetails) {
      return { minTime: "09:00:00", maxTime: "17:00:00" }; // Default fallback
    }

    if (showAll) {
      // Use OperationTimeAvailability when Show All is checked
      return {
        minTime: scheduleDetails.OperationTimeAvailability.from,
        maxTime: scheduleDetails.OperationTimeAvailability.to
      };
    } else {
      // Use Availabilities when Show All is unchecked
      return {
        minTime: scheduleDetails.Availabilities.from,
        maxTime: scheduleDetails.Availabilities.to
      };
    }
  };

  const timeRange = getTimeRange();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Schedule for {format(safeSelectedDate, "EEEE, MMMM do, yyyy")}
            {scheduleDetailsLoading && (
              <span className="ml-2 text-sm text-muted-foreground">(Loading time range...)</span>
            )}
          </h1>
          <p className="text-muted-foreground">
            Manage schedules for {location}
            {scheduleDetails && (
              <span className="ml-2 text-sm">
                • Time range: {timeRange.minTime} - {timeRange.maxTime}
                {showAll ? " (All hours)" : " (Available hours)"}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Show All Toggle */}
          <div className="flex items-center space-x-2">
            <input
              id="show-all"
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="show-all" className="text-sm font-medium">
              Show All
            </label>
          </div>
          
          {/* TV Icon */}
          <Button
            variant="outline"
            size="icon"
            onClick={openDailySchedule}
            title="Open Daily Schedule"
          >
            <Tv className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter by:</span>
        </div>
        
        {/* Error display for programs */}
        {programsError && (
          <div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
            Failed to load programs: {programsError}
          </div>
        )}
        
        {/* Error display for teachers */}
        {teachersError && (
          <div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
            Failed to load teachers: {teachersError}
          </div>
        )}
        
        {/* Error display for schedule details */}
        {scheduleDetailsError && (
          <div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
            Failed to load schedule details: {scheduleDetailsError}
          </div>
        )}
        
        {/* Error display for teacher view */}
        {teacherViewError && (
          <div className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
            Failed to load teacher view: {teacherViewError}
          </div>
        )}
        
        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !safeSelectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {safeSelectedDate ? format(safeSelectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={safeSelectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Program Filter */}
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

        {/* Teacher Filter */}
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

      {/* Calendar Tabs */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "teacher" | "classroom")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teacher">Teacher View</TabsTrigger>
          <TabsTrigger value="classroom">Classroom View</TabsTrigger>
        </TabsList>
        
         <TabsContent value="teacher" className="mt-4">
           <div className="rounded-lg border bg-card">
             <div className="p-4 border-b">
               <h3 className="text-lg font-semibold">
                 Teacher View - {format(safeSelectedDate, "EEEE, MMMM do, yyyy")}
                 {teacherViewLoading && (
                   <span className="ml-2 text-sm text-muted-foreground">(Loading teachers...)</span>
                 )}
               </h3>
               <p className="text-sm text-muted-foreground">
                 Teachers as columns, time slots as rows
                 {teacherViewResources.length > 0 && (
                   <span className="ml-2">
                     • {teacherViewResources.length} teacher{teacherViewResources.length !== 1 ? 's' : ''} available
                   </span>
                 )}
               </p>
             </div>
             <div className="teacher-view">
               <ReactBigCalendarWrapper
                 events={dummyEvents}
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
               />
             </div>
           </div>
         </TabsContent>
        
         <TabsContent value="classroom" className="mt-4">
           <div className="rounded-lg border bg-card">
             <div className="p-4 border-b">
               <h3 className="text-lg font-semibold">Classroom View - {format(safeSelectedDate, "EEEE, MMMM do, yyyy")}</h3>
               <p className="text-sm text-muted-foreground">Classrooms as columns, time slots as rows</p>
             </div>
             <div className="classroom-view">
               <ReactBigCalendarWrapper
                 events={dummyEvents}
                 resources={dummyClassrooms}
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
           </div>
         </TabsContent>
      </Tabs>
    </div>
  );
}
