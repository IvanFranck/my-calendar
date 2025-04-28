import React, { useState } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
interface Agent {
    id: string;
    name: string;
}

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    agentId: string;
}

// Données fictives
const mockAgents: Agent[] = [
    { id: '1', name: 'Agent 1' },
    { id: '2', name: 'Agent 2' },
    { id: '3', name: 'Agent 3' },
    { id: '4', name: 'Agent 4' },
];

const mockEvents: CalendarEvent[] = [
    {
        id: '1',
        title: 'Mission Alpha',
        start: new Date('2024-04-28'),
        end: new Date('2024-04-30'),
        agentId: '1',
    },
    {
        id: '2',
        title: 'Mission Beta',
        start: new Date('2024-04-29'),
        end: new Date('2024-05-01'),
        agentId: '2',
    },
    {
        id: '3',
        title: 'Mission Gamma',
        start: new Date('2024-04-30'),
        end: new Date('2024-05-02'),
        agentId: '3',
    },
];

// Composant pour un événement glissable
const DraggableEvent = ({ event }: { event: CalendarEvent }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: event.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="bg-blue-500 text-white p-2 rounded cursor-move"
        >
            {event.title}
        </div>
    );
};

// Composant pour une cellule du calendrier
const CalendarCell = ({ date, agentId, events, onEventClick }: {
    date: Date;
    agentId: string;
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
}) => {
    const { setNodeRef } = useDroppable({
        id: `${agentId}-${format(date, 'yyyy-MM-dd')}`,
    });

    const cellEvents = events.filter(
        (event) => event.agentId === agentId && isSameDay(event.start, date)
    );

    return (
        <div
            ref={setNodeRef}
            className="border p-2 min-h-[100px] bg-white"
        >
            {cellEvents.map((event) => (
                <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="cursor-pointer"
                >
                    <DraggableEvent event={event} />
                </div>
            ))}
        </div>
    );
};

// Formulaire de modification d'événement
const EventForm = ({ event, onClose, onSave }: {
    event: CalendarEvent;
    onClose: () => void;
    onSave: (updatedEvent: CalendarEvent) => void;
}) => {
    const [title, setTitle] = useState(event.title);
    const [start, setStart] = useState(format(event.start, 'yyyy-MM-dd'));
    const [end, setEnd] = useState(format(event.end, 'yyyy-MM-dd'));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...event,
            title,
            start: new Date(start),
            end: new Date(end),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">Modifier l'événement</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Titre</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Date de début</label>
                        <input
                            type="date"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Date de fin</label>
                        <input
                            type="date"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Composant principal du calendrier
export const AgentsCalendar = () => {
    const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [currentDate] = useState(new Date());

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const [agentId, date] = over.id.toString().split('-');
        const draggedEvent = events.find((e) => e.id === active.id);
        if (!draggedEvent) return;

        const newDate = new Date(date);
        const daysDiff = Math.floor(
            (newDate.getTime() - draggedEvent.start.getTime()) / (1000 * 60 * 60 * 24)
        );

        const updatedEvent = {
            ...draggedEvent,
            agentId,
            start: new Date(draggedEvent.start.getTime() + daysDiff * 24 * 60 * 60 * 1000),
            end: new Date(draggedEvent.end.getTime() + daysDiff * 24 * 60 * 60 * 1000),
        };

        setEvents(events.map((e) => (e.id === draggedEvent.id ? updatedEvent : e)));
    };

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
    };

    const handleEventSave = (updatedEvent: CalendarEvent) => {
        setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="p-4">
                <div className="grid grid-cols-8 gap-2">
                    {/* En-tête des colonnes */}
                    <div className="font-bold p-2">Agents</div>
                    {weekDays.map((day) => (
                        <div key={day.toString()} className="font-bold p-2 text-center">
                            {format(day, 'EEEE d', { locale: fr })}
                        </div>
                    ))}
                </div>

                {/* Lignes des agents */}
                {mockAgents.map((agent) => (
                    <div key={agent.id} className="grid grid-cols-8 gap-2">
                        <div className="font-bold p-2">{agent.name}</div>
                        {weekDays.map((day) => (
                            <CalendarCell
                                key={`${agent.id}-${day.toString()}`}
                                date={day}
                                agentId={agent.id}
                                events={events}
                                onEventClick={handleEventClick}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Formulaire de modification */}
            {selectedEvent && (
                <EventForm
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onSave={handleEventSave}
                />
            )}
        </DndContext>
    );
};

