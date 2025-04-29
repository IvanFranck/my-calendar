import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { useCalendarStore } from '../../stores/calendarStore';
import { CalendarNavigation } from './CalendarNavigation';
import { CalendarHeader } from './CalendarHeader';
import { CalendarCell } from './CalendarCell';
import { TasksBucket } from './TasksBucket';

export const AgentCalendar: React.FC = () => {
    const [days, setDays] = useState<Date[]>([]);
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

        const taskId = active.id as string;
        const task = tasks.find((t) => t.id === taskId);

        if (!task) return;
        if ((over.id as string).startsWith('cell-')) {
            const overId = (over.id as string).split('__')[1] as string;
            const targetDate = new Date(overId);
            const targetAgentId = (over.data.current as { agentId: string }).agentId;
            moveTask(taskId, targetDate, targetAgentId);
        } else if (over.id === 'unassigned') {
            const targetDate = task.startDate;
            moveTask(taskId, targetDate, null);
        }

    };

    return (
        <div className="flex flex-col h-full">
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <TasksBucket />
                <CalendarNavigation days={days} />
                <CalendarHeader days={days} />
                <div className="flex-1 grid grid-cols-8 gap-px bg-gray-200 mt-4">
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
                                    tasks={tasks.filter(
                                        (task) => task.agentId === agent.id && format(task.startDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
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