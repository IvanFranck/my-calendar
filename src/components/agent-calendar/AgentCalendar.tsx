import React from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { useCalendarStore } from '../../stores/calendarStore';
import { CalendarNavigation } from './CalendarNavigation';
import { CalendarHeader } from './CalendarHeader';
import { CalendarCell } from './CalendarCell';

export const AgentCalendar: React.FC = () => {
    const {
        currentDate,
        tasks,
        agents,
        moveTask,
    } = useCalendarStore();

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const taskId = active.id as string;
        const task = tasks.find((t) => t.id === taskId);

        if (!task) return;

        const targetDate = new Date(over.id as string);
        const targetAgentId = (over.data.current as { agentId: string }).agentId;

        moveTask(taskId, targetDate, targetAgentId);
    };

    return (
        <div className="flex flex-col h-full">
            <CalendarNavigation />
            <CalendarHeader days={days} />

            <DndContext onDragEnd={handleDragEnd}>
                <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200">
                    {days.map((day) => (
                        <div key={day.toISOString()} className="flex flex-col">
                            {agents.map((agent) => (
                                <CalendarCell
                                    key={`${day.toISOString()}-${agent.id}`}
                                    date={day}
                                    agent={agent}
                                    tasks={tasks.filter(
                                        (task) =>
                                            task.agentId === agent.id &&
                                            format(task.startDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
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