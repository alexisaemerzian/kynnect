import { Calendar, dateFnsLocalizer, Event as BigCalendarEvent } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Event } from '../types';
import { useNavigate } from 'react-router';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent extends BigCalendarEvent {
  resource: Event;
}

interface CalendarViewProps {
  events: Event[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const navigate = useNavigate();

  // Convert events to calendar format
  const calendarEvents: CalendarEvent[] = events.map(event => {
    const dateOnly = event.date.split('T')[0]; // Extract date from ISO string
    const eventDateTime = new Date(dateOnly + 'T' + event.time);
    // Assume 2 hour duration for all events
    const endTime = new Date(eventDateTime.getTime() + 2 * 60 * 60 * 1000);

    return {
      title: event.title,
      start: eventDateTime,
      end: endTime,
      resource: event,
    };
  });

  const handleSelectEvent = (event: CalendarEvent) => {
    console.log('📅 [CalendarView] Selected event:', event.resource.id, event.resource.title);
    navigate(`/event?id=${event.resource.id}`);
  };

  const addToGoogleCalendar = (event: Event) => {
    const dateOnly = event.date.split('T')[0]; // Extract date from ISO string
    const eventDateTime = new Date(dateOnly + 'T' + event.time);
    const endTime = new Date(eventDateTime.getTime() + 2 * 60 * 60 * 1000);

    // Format dates for Google Calendar (yyyyMMddTHHmmss format)
    const formatGoogleDate = (date: Date) => {
      return format(date, "yyyyMMdd'T'HHmmss");
    };

    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.append('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.append('text', event.title);
    googleCalendarUrl.searchParams.append('dates', `${formatGoogleDate(eventDateTime)}/${formatGoogleDate(endTime)}`);
    googleCalendarUrl.searchParams.append('details', event.description);
    googleCalendarUrl.searchParams.append('location', event.location);

    window.open(googleCalendarUrl.toString(), '_blank');
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const isPurple = event.resource.type === 'curated';
    
    return {
      style: {
        backgroundColor: isPurple ? '#9333ea' : '#f97316',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '12px',
        padding: '2px 5px',
      },
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4" style={{ height: 'calc(100vh - 280px)' }}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Calendar View</h3>
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-purple-600"></div>
              <span className="text-gray-600">Curated</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span className="text-gray-600">Spontaneous</span>
            </div>
          </div>
        </div>
      </div>
      
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        defaultView="month"
        popup
        components={{
          event: ({ event }: { event: CalendarEvent }) => (
            <div className="flex items-center justify-between gap-1">
              <span className="truncate flex-1">{event.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToGoogleCalendar(event.resource);
                }}
                className="hover:bg-white/20 rounded p-0.5 flex-shrink-0"
                title="Add to Google Calendar"
              >
                <CalendarIcon className="w-3 h-3" />
              </button>
            </div>
          ),
        }}
      />
    </div>
  );
}