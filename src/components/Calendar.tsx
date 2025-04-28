import { Fragment, useCallback, useMemo, useState } from 'react'
import { Calendar as BigCalendar, Views, DateLocalizer } from 'react-big-calendar'
import WithDragAndDrop from './calendar/WithDragAndDrop'
import { Event } from './calendar/types'
import { Card } from '../components/ui/card'

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

// Définir le type pour les props du composant
interface DnDOutsideResourceProps {
    localizer: DateLocalizer;
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

const DragAndDropCalendar = WithDragAndDrop(BigCalendar)

const adjEvents = events.map((it: CalendarEvent, ind: number) => ({
    ...it,
    isDraggable: ind % 2 === 0,
}))

const formatName = (name: string, count: number): string => `${name} ID ${count}`

export default function DnDOutsideResource({ localizer }: DnDOutsideResourceProps) {
    const [myEvents, setMyEvents] = useState<CalendarEvent[]>(adjEvents)
    const [draggedEvent, setDraggedEvent] = useState<any>(undefined)
    const [displayDragItemInCell, setDisplayDragItemInCell] = useState<boolean>(true)
    const [counters, setCounters] = useState<Counters>({ item1: 0, item2: 0 })

    const eventPropGetter = useCallback(
        (event: CalendarEvent) => ({
            ...(event.isDraggable
                ? { className: 'isDraggable' }
                : { className: 'nonDraggable' }),
        }),
        []
    )

    const handleDragStart = useCallback((event: any) => setDraggedEvent(event), [])

    const dragFromOutsideItem = useCallback(() => draggedEvent === 'undroppable' ? undefined : draggedEvent, [draggedEvent])

    const customOnDragOverFromOutside = useCallback(
        (dragEvent: React.DragEvent) => {
            // check for undroppable is specific to this example
            // and not part of API. This just demonstrates that
            // onDragOver can optionally be passed to conditionally
            // allow draggable items to be dropped on cal, based on
            // whether event.preventDefault is called
            if (draggedEvent !== 'undroppable') {
                console.log('preventDefault')
                dragEvent.preventDefault()
            }
        },
        [draggedEvent]
    )

    const handleDisplayDragItemInCell = useCallback(
        () => setDisplayDragItemInCell((prev) => !prev),
        []
    )

    const moveEvent = useCallback(
        ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }: {
            event: CalendarEvent;
            start: Date;
            end: Date;
            isAllDay: boolean;
        }) => {
            const { allDay } = event
            if (!allDay && droppedOnAllDaySlot) {
                event.allDay = true
            }

            setMyEvents((prev) => {
                const existing = prev.find((ev) => ev.id === event.id) ?? {}
                const filtered = prev.filter((ev) => ev.id !== event.id)
                return [...filtered, { ...existing, start, end, allDay } as CalendarEvent]
            })
        },
        [setMyEvents]
    )

    const newEvent = useCallback(
        (event: { start: Date; end: Date; allDay: boolean }) => {
            setMyEvents((prev) => {
                const idList = prev.map((item) => item.id)
                const newId = Math.max(...idList) + 1
                return [...prev, { ...event, id: newId, title: 'New Event' } as CalendarEvent]
            })
        },
        [setMyEvents]
    )

    const onDropFromOutside = useCallback(
        ({ start, end, allDay: isAllDay }: { start: Date; end: Date; allDay: boolean }) => {
            if (draggedEvent === 'undroppable') {
                setDraggedEvent(null)
                return
            }

            const { name } = draggedEvent
            const event = {
                title: formatName(name, counters[name]),
                start,
                end,
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
        ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
            setMyEvents((prev) => {
                const existing = prev.find((ev) => ev.id === event.id) ?? {}
                const filtered = prev.filter((ev) => ev.id !== event.id)
                return [...filtered, { ...existing, start, end } as CalendarEvent]
            })
        },
        [setMyEvents]
    )

    const defaultDate = useMemo(() => new Date(2015, 3, 12), [])

    return (
        <Fragment>
            <div>
                <Card className="dndOutsideSourceExample">
                    <div className="inner">
                        <h4>Outside Drag Sources</h4>
                        <p>
                            Lighter colored events, in the Calendar, have an `isDraggable` key
                            of `false`.
                        </p>
                        {Object.entries(counters).map(([name, count]) => (
                            <div
                                draggable="true"
                                key={name}
                                onDragStart={() =>
                                    handleDragStart({ title: formatName(name, count), name })
                                }
                            >
                                {formatName(name, count)}
                            </div>
                        ))}
                        <div
                            draggable="true"
                            onDragStart={() => handleDragStart('undroppable')}
                        >
                            Draggable but not for calendar.
                        </div>
                    </div>

                    <div>
                        <label>
                            <input
                                type="checkbox"
                                checked={displayDragItemInCell}
                                onChange={handleDisplayDragItemInCell}
                            />
                            Display dragged item in cell while dragging over
                        </label>
                    </div>
                </Card>
            </div>
            <div className="height600">
                <DragAndDropCalendar
                    defaultDate={defaultDate}
                    defaultView={Views.MONTH}
                    dragFromOutsideItem={
                        displayDragItemInCell ? dragFromOutsideItem : undefined
                    }
                    draggableAccessor="isDraggable"
                    eventPropGetter={eventPropGetter}
                    events={myEvents}
                    localizer={localizer}
                    onDropFromOutside={onDropFromOutside}
                    onDragOverFromOutside={customOnDragOverFromOutside}
                    onEventDrop={moveEvent}
                    onEventResize={resizeEvent}
                    onSelectSlot={newEvent}
                    resizable
                    selectable
                />
            </div>
        </Fragment>
    )
}