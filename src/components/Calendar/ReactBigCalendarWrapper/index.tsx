"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views, EventProps, ResourceHeaderProps } from 'react-big-calendar';
import moment from 'moment';
import { Clock, DollarSign, Monitor, Megaphone, User, MapPin, BookOpen, Calendar, Users, Loader2 } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

// Import withDragAndDrop HOC
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const localizer = momentLocalizer(moment);

// Create BigCalendar with drag and drop support
const BigCalendarWithDragDrop = withDragAndDrop<CalendarEvent, CalendarResource>(BigCalendar);

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

interface CalendarResource {
  id: number;
  title: string;
  description?: string;
}

interface AvailabilityData {
  resourceId: number;
  title: string;
  start: string;
  end: string;
  rendering: string;
  className: string;
}

interface ReactBigCalendarWrapperProps {
  events: CalendarEvent[];
  resources: CalendarResource[];
  date: Date;
  onNavigate: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent) => void;
  onEventResize?: (event: CalendarEvent) => void;
  onClassroomChange?: (event: CalendarEvent, newClassroomId: string) => void;
  editable?: boolean;
  showAll?: boolean;
  selectedProgram?: string;
  selectedTeacher?: string;
  minTime?: string; // Format: "HH:mm:ss"
  maxTime?: string; // Format: "HH:mm:ss"
  availability?: AvailabilityData[]; // Teacher availability data
  viewType?: 'teacher' | 'classroom'; // Add view type to distinguish between teacher and classroom views
  updatingEvents?: Set<string>; // Events currently being updated
}

export interface CalendarWrapperRef {
  handleEventUpdateFailure: (eventId: string) => void;
}

// Custom resource header component
const ResourceHeader = ({ resource }: ResourceHeaderProps<CalendarResource>) => (
  <div
    className="
      box-border
      px-2 font-bold
      text-gray-800
      whitespace-normal break-words
      flex flex-col justify-center items-center
      border-gray-200
      h-auto min-h-[50px]
      text-[13px] leading-[1.3]
      select-none
    "
  >
    {resource.title}
  </div>
);

const EmptyResourceHeader = () => (
  <div className='empty-resource-header'>
  </div>
);

export const ReactBigCalendarWrapper = forwardRef<CalendarWrapperRef, ReactBigCalendarWrapperProps>(function ReactBigCalendarWrapper({
  events,
  resources,
  date,
  onNavigate,
  onEventClick,
  onEventDrop,
  onEventResize,
  onClassroomChange,
  editable = true,
  selectedTeacher,
  minTime = "08:00:00",
  maxTime = "20:00:00",
  availability = [],
  viewType = 'teacher',
  updatingEvents = new Set()
}, ref) {
  // State for optimistic updates
  const [optimisticEvents, setOptimisticEvents] = useState<CalendarEvent[]>([]);

  // Sync optimistic events with actual events
  useEffect(() => {
    setOptimisticEvents(events);
  }, [events]);

  // Handle failed API updates - revert to original position
  const handleEventUpdateFailure = (eventId: string) => {
    const originalEvent = events.find(event => event.id === eventId);
    if (originalEvent) {
      setOptimisticEvents(prev => 
        prev.map(event => event.id === eventId ? originalEvent : event)
      );
    }
  };

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    handleEventUpdateFailure
  }));

  // Convert time strings to Date objects for the current date
  const parseTimeToDate = (timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const timeDate = new Date(date);
    timeDate.setHours(hours, minutes, seconds || 0, 0);
    return timeDate;
  };

  const minDate = parseTimeToDate(minTime);
  const maxDate = parseTimeToDate(maxTime);

  // Filter events based on filters and timeline visibility
  const filteredEvents = optimisticEvents.filter(event => {
    // Filter by teacher (if specific teacher is selected)
    if (selectedTeacher && event.resourceId !== parseInt(selectedTeacher)) {
      return false;
    }
    
    // Filter by timeline visibility - only show events that start within visible time range
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    // Only show events that start within the visible time range
    // or events that overlap with the visible time range
    return (eventStart >= minDate && eventStart < maxDate) || 
           (eventStart < minDate && eventEnd > minDate);
  });

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleEventDrop = (args: EventInteractionArgs<CalendarEvent>) => {
    // Check if this event is currently being updated
    if (updatingEvents.has(args.event.id)) {
      return false; // Prevent drop if event is being updated
    }

    // Create the updated event with new position
    const updatedEvent = {
      ...args.event,
      start: new Date(args.start),
      end: new Date(args.end),
      resourceId: typeof args.resourceId === 'string' ? parseInt(args.resourceId) : args.resourceId
    };

    // In classroom view, only allow classroom changes (resource changes)
    if (viewType === 'classroom') {
      // Check if this is a classroom change (resource change without time change)
      const isClassroomChange = onClassroomChange && 
        args.event.resourceId !== args.resourceId && 
        args.event.start.getTime() === new Date(args.start).getTime() &&
        args.event.end.getTime() === new Date(args.end).getTime();

      if (isClassroomChange) {
        // Handle classroom change - no optimistic update, just call the handler
        const newClassroomId = typeof args.resourceId === 'string' ? args.resourceId : args.resourceId?.toString() || '';
        onClassroomChange(args.event, newClassroomId);
      } else {
        // In classroom view, prevent time changes
        return false;
      }
    } else {
      // In teacher view, allow both classroom and time changes
      const isClassroomChange = onClassroomChange && 
        args.event.resourceId !== args.resourceId && 
        args.event.start.getTime() === new Date(args.start).getTime() &&
        args.event.end.getTime() === new Date(args.end).getTime();

      if (isClassroomChange) {
        // Handle classroom change - no optimistic update, just call the handler
        const newClassroomId = typeof args.resourceId === 'string' ? args.resourceId : args.resourceId?.toString() || '';
        onClassroomChange(args.event, newClassroomId);
      } else if (onEventDrop) {
        // Pass the updated event with new times and resource - no optimistic update
        onEventDrop(updatedEvent);
      }
    }
  };

  const handleEventResize = (args: EventInteractionArgs<CalendarEvent>) => {
    // Check if this event is currently being updated
    if (updatingEvents.has(args.event.id)) {
      return false; // Prevent resize if event is being updated
    }

    // In classroom view, prevent duration changes (resizing)
    if (viewType === 'classroom') {
      // Prevent resizing in classroom view
      return false;
    }
    
    if (onEventResize) {
      // Create the updated event with new times
      const updatedEvent = {
        ...args.event,
        start: new Date(args.start),
        end: new Date(args.end)
      };

      // Pass the updated event with new times - no optimistic update
      onEventResize(updatedEvent);
    }
  };

  // Slot prop getter to handle availability/unavailability colors
  const slotPropGetter = (date: Date, resourceId?: string | number) => {
    // Default unavailability color
    const unavailabilityColor = '#cccccc';
    
    if (!resourceId) {
      return {
        style: {
          backgroundColor: unavailabilityColor,
          opacity: 1,
          cursor: 'pointer'
        },
        className: 'normal-slot'
      };
    }

    // Convert resourceId to number for comparison
    const numericResourceId = typeof resourceId === 'string' ? parseInt(resourceId) : resourceId;

    // Check if this time slot has availability data
    const hasAvailability = availability.some(avail => {
      if (avail.resourceId !== numericResourceId) return false;
      
      const availStart = new Date(avail.start);
      const availEnd = new Date(avail.end);
      const slotTime = new Date(date);
      
      // Check if it's the same day
      const isSameDay = slotTime.getFullYear() === availStart.getFullYear() &&
        slotTime.getMonth() === availStart.getMonth() &&
        slotTime.getDate() === availStart.getDate();
      
      if (!isSameDay) return false;
      
      // Compare only the time parts
      const slotTimeOnly = slotTime.getHours() * 60 + slotTime.getMinutes();
      const startTimeOnly = availStart.getHours() * 60 + availStart.getMinutes();
      const endTimeOnly = availEnd.getHours() * 60 + availEnd.getMinutes();
      
      return slotTimeOnly >= startTimeOnly && slotTimeOnly < endTimeOnly;
    });

    if (hasAvailability) {
      // Teacher is available - show availability color
      return {
        style: {
          backgroundColor: '#a6a6a6',
          opacity: 0.6,
          cursor: 'pointer',
        },
        className: 'available-slot'
      };
    }

    // Default state - teacher unavailability
    return {
      style: {
        backgroundColor: unavailabilityColor,
        opacity: 1,
        cursor: 'pointer'
      },
      className: 'normal-slot'
    };
  };

  const eventPropGetter = (event: CalendarEvent) => {
    // Get the base color from the event
    const baseColor = event.backgroundColor || '#3174ad';
    const isUpdating = updatingEvents.has(event.id);
    
    // Convert hex to RGB and darken it for border
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    const darkenColor = (hex: string, factor: number = 0.3) => {
      const rgb = hexToRgb(hex);
      if (!rgb) return hex;
      
      const r = Math.floor(rgb.r * (1 - factor));
      const g = Math.floor(rgb.g * (1 - factor));
      const b = Math.floor(rgb.b * (1 - factor));
      
      return `rgb(${r}, ${g}, ${b})`;
    };
    
    const darkBorderColor = darkenColor(baseColor, 0.4);
    
    return {
      style: {
        backgroundColor: isUpdating ? '#94a3b8' : baseColor, // Gray background when updating
        color: 'white',
        borderRadius: '4px',
        borderBottom: `1px solid ${darkBorderColor}`,
        fontSize: '0.85rem',
        padding: '2px 4px',
        cursor: isUpdating ? 'not-allowed' : 'pointer',
        display: 'flex' as const,
        flexDirection: 'column' as const,
        justifyContent: 'space-between' as const,
        height: '100%',
        overflow: 'hidden' as const,
        opacity: isUpdating ? 0.7 : 1
      },
      className: `${event.className || ''} ${isUpdating ? 'updating-event' : ''}`
    };
  };

  const EventComponent = ({ event }: EventProps<CalendarEvent>) => {
    const extendedProps = event.extendedProps || {};
    const isUpdating = updatingEvents.has(event.id);
    
    // Calculate event duration in minutes
    const durationMinutes = moment(event.end).diff(moment(event.start), 'minutes');
    const isShortEvent = durationMinutes <= 20; // 15-20 minute events
    const isVeryShortEvent = durationMinutes <= 15; // 15 minute events
    
    // Format time as hh:mm - hh:mm (12-hour format without AM/PM)
    const formatTime = (start: Date, end: Date) => {
      const startTime = moment(start).format('hh:mm');
      const endTime = moment(end).format('hh:mm');
      return `${startTime} - ${endTime}`;
    };
    
    // Get first name from full name
    const getFirstName = (fullName: string) => {
      return fullName.split(' ')[0];
    };
    
    // Truncate title for very short events (15 minutes)
    const getTruncatedTitle = (title: string) => {
      if (title.length <= 5) return title;
      return title.substring(0, 5) + '...';
    };
    
    // For short events (15-20 minutes), use single line layout
    if (isShortEvent) {
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="relative h-full w-full overflow-hidden px-1 py-0.5 flex items-center cursor-pointer">
              {/* Single row: Icon, time, title, and status icons */}
              <div className="flex items-center gap-1 w-full min-w-0">
                {isUpdating ? (
                  <Loader2 className="h-3 w-3 text-white flex-shrink-0 animate-spin" />
                ) : (
                  <Clock className="h-3 w-3 text-white flex-shrink-0" />
                )}
                <span className="text-xs font-semibold text-white flex-shrink-0">
                  {moment(event.start).format('hh:mm')}
                </span>
                <span className="text-xs font-medium text-white truncate min-w-0 flex-1">
                  {isVeryShortEvent ? getTruncatedTitle(event.title) : getFirstName(event.title)}
                </span>
                
                {/* Status icons on the right */}
                <div className="status-icons flex gap-1 flex-shrink-0">
                  {extendedProps.isOwing && (
                    <div title="Student owes money">
                      <DollarSign className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {extendedProps.isOnline && (
                    <div title="Online lesson">
                      <Monitor className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {extendedProps.isOwingRentalAgreement && (
                    <div title="Equipment rental outstanding">
                      <Megaphone className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto">
            <div className="space-y-1">
              {(() => {
                // If tooltip exists and is not empty, use it
                if (extendedProps.tooltip && extendedProps.tooltip.trim()) {
                  return renderTooltip(extendedProps.tooltip);
                } else {
                  // Fallback: show basic information from extendedProps
                  const fallbackInfo = [];
                  if (extendedProps.teacher) fallbackInfo.push(`Teacher: ${extendedProps.teacher}`);
                  if (extendedProps.classroom) fallbackInfo.push(`Classroom: ${extendedProps.classroom}`);
                  if (extendedProps.programId) fallbackInfo.push(`Program: ${extendedProps.programId}`);
                  
                  if (fallbackInfo.length === 0) {
                    fallbackInfo.push('No additional information available');
                  }
                  
                  return renderTooltip(fallbackInfo.join('\n'));
                }
              })()}
            </div>
          </HoverCardContent>
        </HoverCard>
      );
    }
    
    // For longer events (30+ minutes), use multi-line layout
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="relative h-full w-full overflow-hidden px-1 py-0.5 flex flex-col cursor-pointer">
            {/* Top row: Icon, time, and status icons */}
            <div className="flex items-center justify-between w-full flex-shrink-0">
              <div className="flex items-center gap-1">
                {isUpdating ? (
                  <Loader2 className="h-3 w-3 text-white flex-shrink-0 animate-spin" />
                ) : (
                  <Clock className="h-3 w-3 text-white flex-shrink-0" />
                )}
                <span className="text-xs font-semibold text-white whitespace-nowrap">
                  {formatTime(event.start, event.end)}
                </span>
              </div>
              
              {/* Status icons on the right */}
              <div className="status-icons flex gap-1 flex-shrink-0">
                {extendedProps.isOwing && (
                  <div title="Student owes money" className="flex-shrink-0">
                    <DollarSign className="h-3 w-3 text-white" />
                  </div>
                )}
                {extendedProps.isOnline && (
                  <div title="Online lesson" className="flex-shrink-0">
                    <Monitor className="h-3 w-3 text-white" />
                  </div>
                )}
                {extendedProps.isOwingRentalAgreement && (
                  <div title="Equipment rental outstanding" className="flex-shrink-0">
                    <Megaphone className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Title below - flexible height */}
            <div className="text-xs font-medium text-white leading-tight flex-1 flex items-center min-h-0 overflow-hidden mt-1">
              <span className="truncate w-full">
                {event.title}
              </span>
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-auto">
          <div className="space-y-1">
            {(() => {
              // If tooltip exists and is not empty, use it
              if (extendedProps.tooltip && extendedProps.tooltip.trim()) {
                return renderTooltip(extendedProps.tooltip);
              } else {
                // Fallback: show basic information from extendedProps
                const fallbackInfo = [];
                if (extendedProps.teacher) fallbackInfo.push(`Teacher: ${extendedProps.teacher}`);
                if (extendedProps.classroom) fallbackInfo.push(`Classroom: ${extendedProps.classroom}`);
                if (extendedProps.programId) fallbackInfo.push(`Program: ${extendedProps.programId}`);
                
                if (fallbackInfo.length === 0) {
                  fallbackInfo.push('No additional information available');
                }
                
                return renderTooltip(fallbackInfo.join('\n'));
              }
            })()}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  // Mobile detection
  const [isMobileView, setIsMobileView] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Function to get icon for tooltip field
  const getTooltipIcon = (fieldName: string) => {
    const name = fieldName.toLowerCase();
    if (name.includes('teacher') || name.includes('instructor')) return <User className="h-4 w-4" />;
    if (name.includes('classroom') || name.includes('room')) return <MapPin className="h-4 w-4" />;
    if (name.includes('program') || name.includes('course')) return <BookOpen className="h-4 w-4" />;
    if (name.includes('date') || name.includes('time')) return <Calendar className="h-4 w-4" />;
    if (name.includes('student') || name.includes('group')) return <Users className="h-4 w-4" />;
    if (name.includes('owing') || name.includes('payment')) return <DollarSign className="h-4 w-4" />;
    if (name.includes('online') || name.includes('virtual')) return <Monitor className="h-4 w-4" />;
    if (name.includes('rental') || name.includes('agreement')) return <Megaphone className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />; // Default icon
  };

  // Function to render tooltip with icons and bold text
  const renderTooltip = (tooltipText: string) => {
    if (!tooltipText || !tooltipText.trim()) return null;
    
    return tooltipText.split('\n').map((line, index) => {
      if (!line.trim()) return null;
      
      // Split by colon to get field name and value
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        // If no colon found, just return the line as is
        return (
          <div key={index} className="text-sm">
            {line}
          </div>
        );
      }
      
      const fieldName = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      const icon = getTooltipIcon(fieldName);
      
      return (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">{icon}</span>
          <span className="font-bold text-gray-800">{fieldName}:</span>
          <span className="text-gray-700">{value}</span>
        </div>
      );
    });
  };

  // Create display resources - if no resources, create empty one
  // Show all resources on both mobile and desktop
  const displayResources = resources.length === 0 ? [{ id: 0, title: "" }] : resources;


  return (
    <div className="w-screen md:w-full">
      <div className="bg-white dark:bg-dark-2 rounded-lg shadow-lg p-2">
        
        
        <div 
          className="w-full"
          style={{ 
            position: 'relative'
          }}
        > 
          <BigCalendarWithDragDrop
            localizer={localizer}
            events={filteredEvents}
            resources={displayResources}
            resourceIdAccessor="id"
            resourceTitleAccessor="title"
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            tooltipAccessor={null}
            view={Views.DAY}
            views={[Views.DAY]}
            date={date}
            onNavigate={onNavigate}
            onEventDrop={editable ? handleEventDrop : undefined}
            onEventResize={editable ? handleEventResize : undefined}
            onSelectEvent={handleEventClick}
            resizable={editable}
            dragFromOutsideItem={undefined}
            components={{
              event: EventComponent,
              resourceHeader: resources.length === 0 ? EmptyResourceHeader : ResourceHeader,
              toolbar: () => null
            }}
            step={15} // 15-minute intervals
            timeslots={2} // 2 slots per 30 minutes
            min={minDate}
            max={maxDate}
            eventPropGetter={eventPropGetter}
            slotPropGetter={slotPropGetter}
            style={{ height: '100%' }}
            className={isMobileView ? 'mobile-calendar' : ''}
          />
        </div>
      </div>
    </div>
  );
});
