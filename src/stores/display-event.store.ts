import { create } from 'zustand'
import { CalendarEvent, TaskInterface } from '@/types'

interface DisplayEventFormState {
  isOpen: boolean
  selectedEvent: CalendarEvent | TaskInterface | null
  setIsOpen: (isOpen: boolean) => void
  setSelectedEvent: (event: CalendarEvent | TaskInterface | null) => void
}

export const useDisplayEventFormStore = create<DisplayEventFormState>((set) => ({
  isOpen: false,
  selectedEvent: null,
  setIsOpen: (isOpen) => set({ isOpen }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
}))
