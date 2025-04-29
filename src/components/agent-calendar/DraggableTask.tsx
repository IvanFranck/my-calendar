import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { Task } from '../../stores/calendarStore';

interface DraggableTaskProps {
    task: Task;
}

export const DraggableTask: React.FC<DraggableTaskProps> = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
    });

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`p-2 rounded-md bg-blue-100 border border-blue-200 cursor-move ${isDragging ? 'opacity-50' : ''
                }`}
        >
            <div className="font-medium text-sm">{task.title}</div>
            <div className="text-xs text-gray-500">
                {format(task.startDate, 'HH:mm')} - {format(task.endDate, 'HH:mm')}
            </div>
        </div>
    );
}; 