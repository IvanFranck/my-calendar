import { CalendarEvent } from "@/types";
import { create } from "zustand";

interface MissionCalendarState {
    events: CalendarEvent[];
    setEvents: (events: CalendarEvent[]) => void;
}

export const useMissionCalendarStore = create<MissionCalendarState>((set) => ({
    events: [],
    setEvents: (events) => set({ events }),
}))