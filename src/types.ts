import { Event } from 'react-big-calendar'

export interface CalendarEvent extends Event {
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    isDraggable?: boolean;
}

export interface AgentInterface {
    id: string;
    name: string;
}

export interface AgentTaskInterface {
    id: string;
    title: string;
    agentId: string;
    date: string;
}

export type AgentCalendarModeType = 'week' | 'day';