import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { fr } from 'date-fns/locale'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { useCallback, useEffect, useState } from "react"
import { CalendarEvent } from '../types'
import { useDisplayEventFormStore } from '@/stores/display-event.store'
import { useCalendarStore } from '@/stores/calendar.store'

// Définir le type pour les compteurs
interface Counters {
    [key: string]: number;
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: {
        'fr': fr,
    },
})

const DnDCalendar = withDragAndDrop(Calendar)


const formatName = (name: string, count: number): string => `${name} ID ${count}`


export function MissionsCalendar() {
    const [myEvents, setMyEvents] = useState<CalendarEvent[]>([])
    const [draggedEvent, setDraggedEvent] = useState<any>(undefined)
    const [displayDragItemInCell, _] = useState<boolean>(true)
    const [counters, setCounters] = useState<Counters>({ item1: 0, item2: 0 })
    const [currentView, setCurrentView] = useState<View>(Views.MONTH)
    const { setIsOpen, setSelectedEvent } = useDisplayEventFormStore()
    const { tasks } = useCalendarStore();

    const eventPropGetter = useCallback(
        (event: object) => {
            const calendarEvent = event as CalendarEvent;
            return {
                className: calendarEvent.isDraggable ? 'isDraggable' : 'nonDraggable'
            };
        },
        []
    )

    const dragFromOutsideItem = useCallback(() => draggedEvent === 'undroppable' ? undefined : draggedEvent, [draggedEvent])

    const moveEvent = useCallback(
        ({
            event,
            start,
            end,
            isAllDay,
        }: {
            event: object;
            start: Date | string;
            end: Date | string;
            isAllDay?: boolean;
        }) => {
            const droppedOnAllDaySlot = isAllDay ?? false;
            const calendarEvent = event as CalendarEvent;
            const startDate = typeof start === "string" ? new Date(start) : start;
            const endDate = typeof end === "string" ? new Date(end) : end;
            const { allDay } = calendarEvent;
            if (!allDay && droppedOnAllDaySlot) {
                calendarEvent.allDay = true;
            }

            setMyEvents((prev) => {
                const existing = prev.find((ev) => ev.id === calendarEvent.id) ?? {};
                const filtered = prev.filter((ev) => ev.id !== calendarEvent.id);
                return [
                    ...filtered,
                    { ...existing, start: startDate, end: endDate, allDay: calendarEvent.allDay } as CalendarEvent,
                ];
            });
        },
        [setMyEvents]
    );

    const newEvent = useCallback(
        (slotInfo: { start: Date | string; end: Date | string; slots?: Date[]; action?: string; allDay?: boolean }) => {
            const startDate = typeof slotInfo.start === "string" ? new Date(slotInfo.start) : slotInfo.start;
            const endDate = typeof slotInfo.end === "string" ? new Date(slotInfo.end) : slotInfo.end;
            const allDay = slotInfo.allDay ?? false;

            setMyEvents((prev) => {
                const idList = prev.map((item) => item.id)
                const newId = Math.max(...idList) + 1
                return [
                    ...prev,
                    { start: startDate, end: endDate, allDay, id: newId, title: 'New Event', isDraggable: true } as CalendarEvent
                ]
            })
        },
        [setMyEvents]
    )

    const onDropFromOutside = useCallback(
        ({ start, end, allDay: isAllDay }: { start: Date | string; end: Date | string; allDay: boolean }) => {
            const startDate = typeof start === "string" ? new Date(start) : start;
            const endDate = typeof end === "string" ? new Date(end) : end;

            if (draggedEvent === 'undroppable') {
                setDraggedEvent(null)
                return
            }

            const { name } = draggedEvent
            const event = {
                title: formatName(name, counters[name]),
                start: startDate,
                end: endDate,
                allDay: isAllDay,
                isDraggable: true,
            }
            setDraggedEvent(null)
            setCounters((prev) => {
                const { [name]: count } = prev
                return {
                    ...prev,
                    [name]: count + 1,
                }
            })
            newEvent(event)
        },
        [draggedEvent, counters, setDraggedEvent, setCounters, newEvent]
    )

    const resizeEvent = useCallback(
        ({ event, start, end }: { event: object; start: Date | string; end: Date | string }) => {
            const calendarEvent = event as CalendarEvent;
            const startDate = typeof start === "string" ? new Date(start) : start;
            const endDate = typeof end === "string" ? new Date(end) : end;

            setMyEvents((prev) => {
                const existing = prev.find((ev) => ev.id === calendarEvent.id) ?? {};
                const filtered = prev.filter((ev) => ev.id !== calendarEvent.id);
                return [
                    ...filtered,
                    { ...existing, start: startDate, end: endDate } as CalendarEvent,
                ];
            });
        },
        [setMyEvents]
    );

    const handleDragStart = useCallback((event: { title: string, name: string }) => setDraggedEvent(event), [])

    useEffect(() => {
        const events = tasks
            .filter(task => task.startDate && task.endDate)
            .map(task => ({
                id: Number(task.id),
                title: task.title,
                start: task.startDate as Date,
                end: task.endDate as Date,
                agentId: task.agentId,
                allDay: false,
                isDraggable: true
            }));

        setMyEvents(events)
    }, [tasks])

    return (
        <div className="flex flex-col gap-4">
            <section className="w-full flex gap-4 flex-wrap bg-white rounded-lg p-4 border border-gray-200">
                {Object.entries(counters).map(([name, count]) => (
                    <div
                        draggable="true"
                        key={name}
                        onDragStart={() =>
                            handleDragStart({ title: formatName(name, count), name })
                        }
                        className="border rounded-lg p-2 flex flex-col gap-2"
                    >
                        {formatName(name, count)}
                    </div>
                ))}
            </section>
            {
                myEvents.length > 0 && (
                    <DnDCalendar
                        defaultView={Views.MONTH}
                        dragFromOutsideItem={
                            displayDragItemInCell ? dragFromOutsideItem : undefined
                        }
                        draggableAccessor={(event) => !!(event as CalendarEvent).isDraggable}
                        eventPropGetter={eventPropGetter}
                        events={myEvents}
                        localizer={localizer}
                        onDropFromOutside={onDropFromOutside}
                        onEventDrop={moveEvent}
                        onEventResize={resizeEvent}
                        onSelectSlot={newEvent}
                        onSelectEvent={(event) => {
                            setSelectedEvent(event as CalendarEvent);
                            setIsOpen(true);
                        }}
                        resizable
                        style={{ minHeight: 600 }}
                        view={currentView}
                        onView={setCurrentView}
                    />
                )
            }

        </div>
    )
}

