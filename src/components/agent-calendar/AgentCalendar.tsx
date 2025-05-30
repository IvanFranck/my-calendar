import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { useCalendarStore } from '../../stores/calendar.store';
import { CalendarNavigation } from './CalendarNavigation';
import { CalendarHeader } from './CalendarHeader';
import { CalendarCell } from './CalendarCell';
import { TasksBucket } from '../TasksBucket';
import { TaskInterface } from '@/types';
export const AgentCalendar: React.FC = () => {
    const [days, setDays] = useState<Date[]>([]);
    const [events, setEvents] = useState<TaskInterface[]>([]);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );
    const {
        currentDate,
        tasks,
        agents,
        view,
        moveTask,
        updateTask
    } = useCalendarStore();

    const colSpanStyle = view === 'week' ? 'col-span-1' : 'col-span-7';

    useEffect(() => {
        if (view === 'week') {
            const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
            const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
            setDays(days);
        } else {
            setDays([currentDate]);
        }
    }, [currentDate, view]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;
        console.log("active", active)
        console.log("over", over)
        const taskId = active.id as string;
        const task = tasks.find((t) => t.id === taskId);

        if (!task) return;
        if ((over.id as string).startsWith('cell-')) {
            const overId = (over.id as string).split('__')[1] as string;
            const targetDate = new Date(overId);
            const targetAgentId = (over.data.current as { agentId: string }).agentId;
            updateTask(taskId, { startDate: targetDate, endDate: targetDate, agentId: targetAgentId });
        } else if (over.id === 'unassigned') {
            updateTask(taskId, { startDate: undefined, endDate: undefined });
        }

    };

    useEffect(() => {
        setEvents(tasks.filter(task => task.startDate && task.endDate));
    }, [tasks]);

    return (
        <div className="flex flex-col h-full">
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <TasksBucket />
                <CalendarNavigation days={days} />
                <CalendarHeader days={days} />
                <div className="flex-1 grid grid-cols-8 gap-px bg-white">
                    <div className="bg-white text-center">
                        <div className="flex flex-col">
                            <div className="bg-white text-center font-medium">
                                {agents.map((agent) => (
                                    <div className="bg-white min-h-[100px] flex items-center justify-center p-2 font-medium" key={agent.id}>{agent.name}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {days.map((day) => (
                        <div key={day.toISOString()} className={`flex flex-col ${colSpanStyle}`}>
                            {agents.map((agent) => (
                                <CalendarCell
                                    key={agent.id}
                                    date={day}
                                    agent={agent}
                                    tasks={events.filter(
                                        (task) => task.agentId === agent.id && format(task?.startDate ?? new Date(), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                                    )}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </DndContext>
        </div>
    );
}; 