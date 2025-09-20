"use client";

import { Calendar, momentLocalizer, Views, EventProps, ResourceHeaderProps } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

// Import withDragAndDrop HOC
import withDragAndDrop, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const localizer = momentLocalizer(moment);

// Create BigCalendar with drag and drop support
const BigCalendar = withDragAndDrop<CalendarEvent, CalendarResource>(Calendar);

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
  selectedTeacher
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
    return {
      style: {
        backgroundColor: event.backgroundColor || '#3174ad',
        borderColor: event.borderColor || '#3174ad',
        color: 'white',
        borderRadius: '4px',
        border: 'none',
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
    
    return (
      <div className="relative h-full w-full overflow-hidden p-1">
        <div className="text-xs font-medium truncate mb-1">
          {event.title}
        </div>
        <div className="status-icons flex gap-1 text-xs">
          {extendedProps.isOwing && (
            <span title="Student owes money" className="text-yellow-300">💰</span>
          )}
          {extendedProps.isOnline && (
            <span title="Online lesson" className="text-blue-300">💻</span>
          )}
          {extendedProps.isOwingRentalAgreement && (
            <span title="Equipment rental outstanding" className="text-red-300">📢</span>
          )}
        </div>
      </div>
    );
  };

  // Create display resources - if no resources, create empty one
  const displayResources = resources.length === 0 ? [{ id: 0, title: "" }] : resources;

  return (
    <div className="w-full max-w-none xl:max-w-[90rem] 2xl:max-w-[120rem] mx-auto">
      <div className="bg-white dark:bg-dark-2 rounded-lg shadow-lg p-2">
        <div 
          className="w-full"
          style={{ 
            maxHeight: '87vh',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch', // Add this for iOS
            position: 'relative'
          }}
        > 
          <BigCalendar
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
            min={new Date(2024, 0, 1, 8, 0)} // 8:00 AM
            max={new Date(2024, 0, 1, 20, 0)} // 8:00 PM
            eventPropGetter={eventPropGetter}
            style={{ height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
