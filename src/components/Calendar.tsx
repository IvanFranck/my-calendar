import React, { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    useSensor,
    useSensors,
    PointerSensor,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
}

interface CalendarProps {
    events: CalendarEvent[];
    onEventUpdate: (event: CalendarEvent) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, onEventUpdate }) => {
    const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
    const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const draggedEvent = events.find((e) => e.id === event.active.id);
        if (draggedEvent) {
            setDraggedEvent(draggedEvent);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        if (draggedEvent && event.over) {
            const delta = event.delta;
            const updatedEvent: CalendarEvent = {
                ...draggedEvent,
                start: new Date(draggedEvent.start.getTime() + delta.y * 60000), // Convert pixels to minutes
                end: new Date(draggedEvent.end.getTime() + delta.y * 60000),
            };
            onEventUpdate(updatedEvent);
        }
        setDraggedEvent(null);
    };

    const weekStart = startOfWeek(new Date());
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToWindowEdges]}
        >
            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => (
                    <div
                        key={day.toISOString()}
                        className="min-h-[200px] border border-gray-200 p-2"
                    >
                        <div className="font-semibold mb-2">
                            {format(day, 'EEE d')}
                        </div>
                        <div className="space-y-1">
                            {events
                                .filter((event) => isSameDay(event.start, day))
                                .map((event) => (
                                    <div
                                        key={event.id}
                                        className="bg-blue-100 p-2 rounded cursor-move"
                                        style={{
                                            height: `${Math.max(
                                                30,
                                                (event.end.getTime() - event.start.getTime()) / (1000 * 60)
                                            )}px`,
                                        }}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
            <DragOverlay>
                {draggedEvent && (
                    <div className="bg-blue-200 p-2 rounded shadow-lg">
                        {draggedEvent.title}
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}; 