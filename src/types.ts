import { Event } from 'react-big-calendar'

export interface CalendarEvent extends Event {
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    isDraggable?: boolean;
}