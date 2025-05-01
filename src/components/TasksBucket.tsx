import { useCalendarStore } from "@/stores/calendar.store"
import { useDroppable } from "@dnd-kit/core";
import { DraggableTask } from "./agent-calendar/DraggableTask";

export const TasksBucket = () => {
    const { tasks } = useCalendarStore();
    const unassignedTasks = tasks.filter((task) => !task.startDate || !task.endDate);

    const { setNodeRef, isOver } = useDroppable({
        id: 'unassigned',
        data: {
            agentId: null,
        },
    });
    return (
        <div
            ref={setNodeRef}
            className={`min-h-[80px] bg-white text-center p-2 rounded-md flex flex-wrap gap-2 mb-4 ${isOver ? 'bg-blue-50' : ''}`}
        >
            {unassignedTasks.map((task) => (
                <DraggableTask key={task.id} task={task} />
            ))}
        </div>
    )
}