import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { Agent, Task } from '../../stores/calendar.store';
import { DraggableTask } from './DraggableTask';

interface CalendarCellProps {
    date: Date;
    agent: Agent;
    tasks: Task[];
}

export const CalendarCell: React.FC<CalendarCellProps> = ({ date, agent, tasks }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `cell-${agent.id}__${date.toISOString()}`,
        data: {
            agentId: agent.id,
        },
    });

    // useEffect(() => {
    //     console.log("tasks", tasks);
    // }, [tasks]);

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[100px] p-2 bg-white ${isOver ? 'bg-blue-50' : ''
                }`}
        >
            <div className="text-sm font-medium text-gray-500">
                {format(date, 'HH:mm')}
            </div>
            <div className="space-y-1">
                {tasks.map((task) => (
                    <DraggableTask key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}; 