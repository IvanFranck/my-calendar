import { create } from 'zustand'
import { CalendarEvent } from '@/types'

interface DisplayEventFormState {
  isOpen: boolean
  selectedEvent: CalendarEvent | null
  setIsOpen: (isOpen: boolean) => void
  setSelectedEvent: (event: CalendarEvent | null) => void
}

export const useDisplayEventFormStore = create<DisplayEventFormState>((set) => ({
  isOpen: false,
  selectedEvent: null,
  setIsOpen: (isOpen) => set({ isOpen }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
}))
