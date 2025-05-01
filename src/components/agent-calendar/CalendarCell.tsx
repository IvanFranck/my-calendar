import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DraggableTask } from './DraggableTask';
import { TaskInterface } from '@/types';
import { AgentInterface } from '@/types';

interface CalendarCellProps {
    date: Date;
    agent: AgentInterface;
    tasks: TaskInterface[];
}

export const CalendarCell: React.FC<CalendarCellProps> = ({ date, agent, tasks }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `cell-${agent.id}__${date.toISOString()}`,
        data: {
            agentId: agent.id,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[100px] border border-gray-200 p-2 bg-white ${isOver ? 'bg-blue-50' : ''
                }`}
        >
            <div className="space-y-1">
                {tasks.map((task) => (
                    <DraggableTask key={task.id} task={task} />
                ))}
            </div>
        </div>
    );
}; 