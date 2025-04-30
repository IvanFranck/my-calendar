import { AgentCalendarModeType, AgentInterface, TaskInterface } from '@/types';
import { create } from 'zustand';


interface CalendarState {
  currentDate: Date;
  view: AgentCalendarModeType;
  tasks: TaskInterface[];
  agents: AgentInterface[];
  setCurrentDate: (date: Date) => void;
  setInitialTasks: (tasks: TaskInterface[]) => void;
  setView: (view: AgentCalendarModeType) => void;
  addTask: (task: TaskInterface) => void;
  updateTask: (taskId: string, updates: Partial<TaskInterface>) => void;
  removeTask: (taskId: string) => void;
  addAgent: (agent: AgentInterface) => void;
  removeAgent: (agentId: string) => void;
  moveTask: (taskId: string, newStartDate: Date, newAgentId: string | null) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  currentDate: new Date(),
  view: 'week',
  tasks: [],
  agents: [],
  setInitialTasks: (tasks: TaskInterface[]) => set({ tasks }),
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