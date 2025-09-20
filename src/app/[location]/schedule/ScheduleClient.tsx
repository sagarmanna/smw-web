"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactBigCalendarWrapper } from "@/components/Calendar/ReactBigCalendarWrapper";
import { CalendarIcon, Tv, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
const dummyTeachers = [
  { id: 1, title: "John Smith", description: "Senior Instructor" },
  { id: 2, title: "Sarah Johnson", description: "Lead Teacher" },
  { id: 3, title: "Mike Wilson", description: "Assistant Teacher" },
  { id: 4, title: "Emily Davis", description: "Specialist Teacher" },
  { id: 5, title: "Emily Davis1", description: "Specialist Teacher" },
  { id: 6, title: "Emily Davis2", description: "Specialist Teacher" },
  { id: 7, title: "Emily Davis3", description: "Specialist Teacher" },
];

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

const dummyPrograms = [
  { id: "1", name: "Basic Training" },
  { id: "2", name: "Advanced Training" },
  { id: "3", name: "Specialized Training" },
  { id: "4", name: "Group Classes" },
];

export function ScheduleClient({ location }: ScheduleClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [currentView, setCurrentView] = useState<"teacher" | "classroom">("teacher");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [showAll, setShowAll] = useState<boolean>(false);

  // Ensure selectedDate is always valid
  const safeSelectedDate = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Schedule for {format(safeSelectedDate, "EEEE, MMMM do, yyyy")}
          </h1>
          <p className="text-muted-foreground">
            Manage schedules for {location}
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
        <Select value={selectedProgram || "all"} onValueChange={(value) => setSelectedProgram(value === "all" ? "" : value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {dummyPrograms.map((program) => (
              <SelectItem key={program.id} value={program.id.toString()}>
                {program.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Teacher Filter */}
        <Select value={selectedTeacher || "all"} onValueChange={(value) => setSelectedTeacher(value === "all" ? "" : value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Teacher" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teachers</SelectItem>
            {dummyTeachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id.toString()}>
                {teacher.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
               <h3 className="text-lg font-semibold">Teacher View - {format(safeSelectedDate, "EEEE, MMMM do, yyyy")}</h3>
               <p className="text-sm text-muted-foreground">Teachers as columns, time slots as rows</p>
             </div>
             <div className="teacher-view">
               <ReactBigCalendarWrapper
                 events={dummyEvents}
                 resources={dummyTeachers}
                 date={safeSelectedDate}
                 onNavigate={setSelectedDate}
                 onEventClick={handleEventClick}
                 onEventDrop={handleEventDrop}
                 onEventResize={handleEventResize}
                 editable={true}
                 showAll={showAll}
                 selectedProgram={selectedProgram}
                 selectedTeacher={selectedTeacher}
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
               />
             </div>
           </div>
         </TabsContent>
      </Tabs>
    </div>
  );
}
