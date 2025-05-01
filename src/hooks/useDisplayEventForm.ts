import { CalendarEvent } from "@/types";
import { useState } from "react";

export const useDisplayEventForm = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    return {
        isOpen,
        setIsOpen,
        selectedEvent,
        setSelectedEvent,
    };
};