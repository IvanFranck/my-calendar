import { Event } from 'react-big-calendar'
import { z } from 'zod';

export interface CalendarEvent extends Event {
    id: number;
    title: string;
    start: Date;
    end: Date;
    agentId?: string | null;
    allDay?: boolean;
    isDraggable?: boolean;
}

export type TaskInterface = {
    id: string;
    title: string;
    startDate?: Date;
    endDate?: Date;
    agentId?: string | null;
};

export interface AgentInterface {
    id: string;
    name: string;
}


export type AgentCalendarModeType = 'week' | 'day';

export const TaskSchema = z.object({
    title: z.string().min(1, "Le titre est requis"),
    startDate: z.date({ required_error: "La date de début est requise" }),
    endDate: z.date({ required_error: "La date de fin est requise" }),
    agentId: z.string().optional().nullable(),
  });
  export type TaskSchemaType = z.infer<typeof TaskSchema>;