import { Calendar, dateFnsLocalizer, Event, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { fr } from 'date-fns/locale'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { useCallback, useMemo, useState } from "react"

// Définir le type pour les événements
interface CalendarEvent extends Event {
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    isDraggable?: boolean;
}

// Définir le type pour les compteurs
interface Counters {
    [key: string]: number;
}

// Définir les événements de base
const events: CalendarEvent[] = [
    {
        id: 1,
        title: 'Event 1',
        start: new Date(2023, 0, 1, 10, 0),
        end: new Date(2023, 0, 1, 12, 0),
        allDay: false,
    },
    {
        id: 2,
        title: 'Event 2',
        start: new Date(2023, 0, 2, 14, 0),
        end: new Date(2023, 0, 2, 16, 0),
        allDay: false,
    },
    {
        id: 3,
        title: 'Event 3',
        start: new Date(2023, 0, 3, 9, 0),
        end: new Date(2023, 0, 3, 11, 0),
        allDay: false,
    },
]

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

const adjEvents = events.map((it: CalendarEvent, ind: number) => ({
    ...it,
    isDraggable: ind % 2 === 0,
}))

const formatName = (name: string, count: number): string => `${name} ID ${count}`


export function MissionsCalendar() {
    const [myEvents, setMyEvents] = useState<CalendarEvent[]>(adjEvents)
    const [draggedEvent, setDraggedEvent] = useState<any>(undefined)
    const [displayDragItemInCell, setDisplayDragItemInCell] = useState<boolean>(true)
    const [counters, setCounters] = useState<Counters>({ item1: 0, item2: 0 })

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
                    { start: startDate, end: endDate, allDay, id: newId, title: 'New Event' } as CalendarEvent
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

    const defaultDate = useMemo(() => new Date(2023, 0, 1), [])
    return (
        <DnDCalendar
            defaultDate={defaultDate}
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
            resizable
            selectable
            style={{ minHeight: 600 }}
        />
    )
}

