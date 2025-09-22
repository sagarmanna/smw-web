"use client";

import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer, Views, EventProps, ResourceHeaderProps } from 'react-big-calendar';
import moment from 'moment';
import { Clock, DollarSign, Monitor, AlertTriangle, User, MapPin, BookOpen, Calendar, Users } from 'lucide-react';
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

interface ReactBigCalendarWrapperProps {
  events: CalendarEvent[];
  resources: CalendarResource[];
  date: Date;
  onNavigate: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent) => void;
  onEventResize?: (event: CalendarEvent) => void;
  editable?: boolean;
  showAll?: boolean;
  selectedProgram?: string;
  selectedTeacher?: string;
  minTime?: string; // Format: "HH:mm:ss"
  maxTime?: string; // Format: "HH:mm:ss"
  isMobile?: boolean;
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

export function ReactBigCalendarWrapper({
  events,
  resources,
  date,
  onNavigate,
  onEventClick,
  onEventDrop,
  onEventResize,
  editable = true,
  showAll = false,
  selectedProgram,
  selectedTeacher,
  minTime = "08:00:00",
  maxTime = "20:00:00",
  isMobile = false
}: ReactBigCalendarWrapperProps) {

  // Filter events based on filters
  const filteredEvents = events.filter(event => {
    if (!showAll && selectedProgram && event.extendedProps?.programId !== selectedProgram) {
      return false;
    }
    if (selectedTeacher && event.resourceId !== parseInt(selectedTeacher)) {
      return false;
    }
    return true;
  });

  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleEventDrop = (args: EventInteractionArgs<CalendarEvent>) => {
    if (onEventDrop) {
      onEventDrop(args.event);
    }
  };

  const handleEventResize = (args: EventInteractionArgs<CalendarEvent>) => {
    if (onEventResize) {
      onEventResize(args.event);
    }
  };

  const eventPropGetter = (event: CalendarEvent) => {
    // Get the base color from the event
    const baseColor = event.backgroundColor || '#3174ad';
    
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
        backgroundColor: baseColor,
        color: 'white',
        borderRadius: '4px',
        borderBottom: `1px solid ${darkBorderColor}`,
        fontSize: '0.85rem',
        padding: '2px 4px',
        cursor: 'pointer',
        display: 'flex' as const,
        flexDirection: 'column' as const,
        justifyContent: 'space-between' as const,
        height: '100%',
        overflow: 'hidden' as const
      },
      className: event.className || ''
    };
  };

  const EventComponent = ({ event }: EventProps<CalendarEvent>) => {
    const extendedProps = event.extendedProps || {};
    
    // Debug: Log event data
    console.log('EventComponent - Full event:', event);
    console.log('EventComponent - Extended props:', extendedProps);
    console.log('EventComponent - Tooltip data:', extendedProps.tooltip);
    
    // Calculate event duration in minutes
    const durationMinutes = moment(event.end).diff(moment(event.start), 'minutes');
    const isShortEvent = durationMinutes <= 20; // 15-20 minute events
    
    // Format time as HH:mm - HH:mm
    const formatTime = (start: Date, end: Date) => {
      const startTime = moment(start).format('HH:mm');
      const endTime = moment(end).format('HH:mm');
      return `${startTime} - ${endTime}`;
    };
    
    // Get first name from full name
    const getFirstName = (fullName: string) => {
      return fullName.split(' ')[0];
    };
    
    // For short events (15-20 minutes), use single line layout
    if (isShortEvent) {
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="relative h-full w-full overflow-hidden px-1 py-0.5 flex items-center gap-1 cursor-pointer">
              {/* Start time */}
              <span className="text-xs font-semibold text-white flex-shrink-0">
                {moment(event.start).format('HH:mm')}
              </span>
              
              {/* Student first name */}
              <span className="text-xs font-medium text-white truncate flex-1">
                {getFirstName(event.title)}
              </span>
              
              {/* Icons */}
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
                    <AlertTriangle className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto">
            <div className="space-y-1">
              {(() => {
                console.log('HoverCard - Tooltip content:', extendedProps.tooltip);
                console.log('HoverCard - Extended props:', extendedProps);
                
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
          <div className="relative h-full w-full overflow-hidden px-1 py-0.5 flex flex-col justify-between cursor-pointer">
            {/* Time row - compact for short events */}
            <div className="text-xs font-semibold text-white flex items-center gap-1 leading-tight flex-shrink-0">
              <Clock className="h-3 w-3 text-white flex-shrink-0" />
              <span className="whitespace-nowrap">{formatTime(event.start, event.end)}</span>
            </div>
            
            {/* Title row - flexible height with better text handling */}
            <div className="text-xs font-medium text-white leading-tight flex-1 flex items-center min-h-0 overflow-hidden">
              <span className="truncate w-full">
                {event.title}
              </span>
            </div>
            
            {/* Icons row - compact and right-aligned */}
            <div className="status-icons flex gap-1 justify-end flex-shrink-0">
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
                  <AlertTriangle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-auto">
          <div className="space-y-1">
            {(() => {
              console.log('HoverCard (long) - Tooltip content:', extendedProps.tooltip);
              console.log('HoverCard (long) - Extended props:', extendedProps);
              
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
    if (name.includes('rental') || name.includes('agreement')) return <AlertTriangle className="h-4 w-4" />;
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
  // On mobile, show only one teacher at a time for better UX
  const displayResources = resources.length === 0 ? [{ id: 0, title: "" }] : 
    isMobileView ? resources.slice(0, 1) : resources;

  // Convert time strings to Date objects for the current date
  const parseTimeToDate = (timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const timeDate = new Date(date);
    timeDate.setHours(hours, minutes, seconds || 0, 0);
    return timeDate;
  };

  const minDate = parseTimeToDate(minTime);
  const maxDate = parseTimeToDate(maxTime);

  return (
    <div className="w-full max-w-none xl:max-w-[90rem] 2xl:max-w-[120rem] mx-auto">
      <div className="bg-white dark:bg-dark-2 rounded-lg shadow-lg p-2">
        {/* Mobile: Add horizontal scroll indicator */}
        {/* {isMobileView && resources.length > 1 && (
          <div className="mb-2 p-2 bg-blue-50 rounded text-xs text-blue-700 text-center">
            Swipe left/right to view other teachers
          </div>
        )} */}
        
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
            style={{ height: '100%' }}
            className={isMobileView ? 'mobile-calendar' : ''}
          />
        </div>
      </div>
    </div>
  );
}
