import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { fr } from 'date-fns/locale'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { useCallback, useMemo, useState } from "react"
import { CalendarEvent } from '../types'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
        isDraggable: true,
    },
    {
        id: 2,
        title: 'Event 2',
        start: new Date(2023, 0, 2, 14, 0),
        end: new Date(2023, 0, 2, 16, 0),
        allDay: false,
        isDraggable: true,
    },
    {
        id: 3,
        title: 'Event 3',
        start: new Date(2023, 0, 3, 9, 0),
        end: new Date(2023, 0, 3, 11, 0),
        allDay: false,
        isDraggable: true,
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


const formatName = (name: string, count: number): string => `${name} ID ${count}`


export function MissionsCalendar() {
    const [myEvents, setMyEvents] = useState<CalendarEvent[]>(events)
    const [draggedEvent, setDraggedEvent] = useState<any>(undefined)
    const [displayDragItemInCell, _] = useState<boolean>(true)
    const [counters, setCounters] = useState<Counters>({ item1: 0, item2: 0 })
    const [currentView, setCurrentView] = useState<View>(Views.MONTH)
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

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

    const defaultDate = useMemo(() => new Date(2023, 0, 1), [])
    return (
        <div>
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
                onSelectEvent={(event) => {
                    setSelectedEvent(event as CalendarEvent);
                    setIsSheetOpen(true);
                }}
                resizable
                style={{ minHeight: 600 }}
                view={currentView}
                onView={setCurrentView}
            />
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="w-[400px]">
                    <SheetHeader>
                        <SheetTitle>Modifier l'évènement</SheetTitle>
                        <SheetDescription>
                            Modifiez les informations de l'évènement puis validez.
                        </SheetDescription>
                    </SheetHeader>
                    {selectedEvent && (
                        <form
                            className="space-y-4 mt-4"
                            onSubmit={e => {
                                e.preventDefault();
                                setIsSheetOpen(false);
                            }}
                        >
                            <div>
                                <label className="block text-sm font-medium">Titre</label>
                                <Input
                                    value={selectedEvent.title}
                                    onChange={e =>
                                        setSelectedEvent({ ...selectedEvent, title: e.target.value })
                                    }
                                />
                            </div>
                            <SheetFooter>
                                <Button type="submit">Enregistrer</Button>
                                <SheetClose asChild>
                                    <Button type="button" variant="outline">Annuler</Button>
                                </SheetClose>
                            </SheetFooter>
                        </form>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

