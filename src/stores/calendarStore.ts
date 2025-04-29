import { create } from 'zustand';

export type Task = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  agentId?: string | null;
};

export type Agent = {
  id: string;
  name: string;
};

type CalendarView = 'day' | 'week';

interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  tasks: Task[];
  agents: Agent[];
  setCurrentDate: (date: Date) => void;
  setView: (view: CalendarView) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  addAgent: (agent: Agent) => void;
  removeAgent: (agentId: string) => void;
  moveTask: (taskId: string, newStartDate: Date, newAgentId: string | null) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  currentDate: new Date(),
  view: 'week',
  tasks: [],
  agents: [],
  
  setCurrentDate: (date) => set({ currentDate: date }),
  setView: (view) => set({ view }),
  
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  
  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId ? { ...task, ...updates } : task
    ),
  })),
  
  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== taskId),
  })),
  
  addAgent: (agent) => set((state) => ({
    agents: [...state.agents, agent],
  })),
  
  removeAgent: (agentId) => set((state) => ({
    agents: state.agents.filter((agent) => agent.id !== agentId),
    tasks: state.tasks.filter((task) => task.agentId !== agentId),
  })),
  
  moveTask: (taskId, newStartDate, newAgentId) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            startDate: newStartDate,
            agentId: newAgentId,
          }
        : task
    ),
  })),
})); 