import React from 'react';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id as string;
        const task = tasks.find((t) => t.id === taskId);

        if (!task) return;
        const overId = (over.id as string).split('__')[1] as string;
        const targetDate = new Date(overId);
        const targetAgentId = (over.data.current as { agentId: string }).agentId;

        moveTask(taskId, targetDate, targetAgentId);
    };

    // useEffect(() => {
    //     console.log("agents", agents);
    // }, [agents]);

    return (
        <div className="flex flex-col h-full">
            <CalendarNavigation />
            <CalendarHeader days={days} />

            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="flex-1 grid grid-cols-8 gap-px bg-gray-200">
                    <div className="bg-white p-2 text-center">
                        <div className="flex flex-col">
                            <div className="bg-white p-2 text-center font-medium">
                                {agents.map((agent) => (
                                    <div className="bg-white min-h-[100px] flex items-center justify-center p-2 font-medium" key={agent.id}>{agent.name}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {days.map((day) => (
                        <div key={day.toISOString()} className="flex flex-col">
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