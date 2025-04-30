import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { fr } from 'date-fns/locale'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { useCallback, useEffect, useState } from "react"
import { CalendarEvent, TaskInterface } from '../../types'
import { useDisplayEventFormStore } from '@/stores/display-event.store'
import { useCalendarStore } from '@/stores/calendar.store'

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

export function MissionsCalendar() {
    const [myEvents, setMyEvents] = useState<CalendarEvent[]>([])
    const [draggedEvent, setDraggedEvent] = useState<any>(undefined)
    const [currentView, setCurrentView] = useState<View>(Views.MONTH)
    const { setIsOpen, setSelectedEvent } = useDisplayEventFormStore()
    const { tasks, updateTask } = useCalendarStore();
    const unassignedTasks = tasks.filter((task) => !task.startDate || !task.endDate);

    const eventPropGetter = useCallback(
        (event: object) => {
            const calendarEvent = event as CalendarEvent;
            return {
                className: calendarEvent.isDraggable ? 'isDraggable' : 'nonDraggable'
            };
        },
        []
    )

    const dragFromOutsideItem = useCallback(() => draggedEvent, [draggedEvent])

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

    const onDropFromOutside = useCallback(
        ({ start, end }: { start: Date | string; end: Date | string }) => {
            const startDate = new Date(start);
            const endDate = new Date(end);

            if (!draggedEvent) {
                setDraggedEvent(null)
                return
            }

            const { title, id, agentId } = draggedEvent as TaskInterface
            const event: TaskInterface = {
                id: id.toString(),
                title: title,
                startDate: startDate,
                endDate: endDate,
                agentId: agentId,
            }
            updateTask(id, event)
            setDraggedEvent(null)
        },
        [draggedEvent, setDraggedEvent, updateTask]
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

    const handleDragStart = useCallback((event: TaskInterface) => setDraggedEvent(event), [])

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
        console.log(events)
        setMyEvents(events)
    }, [tasks])

    return (
        <div className="flex flex-col gap-4">
            <section className="w-full flex gap-4 flex-wrap bg-white rounded-lg p-4 border border-gray-200">
                {unassignedTasks.map((task) => (
                    <div
                        draggable="true"
                        key={task.id}
                        onDragStart={() =>
                            handleDragStart(task)
                        }
                        className="border rounded-lg p-2 flex flex-col gap-2"
                    >
                        {task.title}
                    </div>
                ))}
            </section>
            {
                myEvents.length > 0 && (
                    <DnDCalendar
                        defaultView={Views.MONTH}
                        dragFromOutsideItem={dragFromOutsideItem}
                        draggableAccessor={(event) => !!(event as CalendarEvent).isDraggable}
                        eventPropGetter={eventPropGetter}
                        events={myEvents}
                        localizer={localizer}
                        onDropFromOutside={onDropFromOutside}
                        onEventDrop={moveEvent}
                        onEventResize={resizeEvent}
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

