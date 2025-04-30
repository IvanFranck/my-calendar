import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { TaskInterface } from '@/types';
import { useDisplayEventFormStore } from '@/stores/display-event.store';
import { EyeIcon } from 'lucide-react';

interface DraggableTaskProps {
    task: TaskInterface;
}

export const DraggableTask: React.FC<DraggableTaskProps> = ({ task }) => {
    const { setIsOpen, setSelectedEvent } = useDisplayEventFormStore();
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
            className={`p-2 rounded-md bg-blue-100 border border-blue-200 ${isDragging ? 'opacity-50' : ''}`}
        >
            <div className="flex justify-between items-center">
                <div
                    className="flex flex-col flex-1 cursor-move"
                    {...listeners}
                    {...attributes}
                >
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="text-xs text-gray-500">
                        {task.startDate ? format(task.startDate, 'HH:mm') : ''} - {task.endDate ? format(task.endDate, 'HH:mm') : ''}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={e => {
                        e.stopPropagation();
                        setSelectedEvent(task);
                        setIsOpen(true);
                    }}
                    className="cursor-pointer hover:bg-blue-200 p-1 rounded ml-2"
                    tabIndex={0}
                >
                    <EyeIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}; 