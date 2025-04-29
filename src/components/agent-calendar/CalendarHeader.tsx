import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCalendarStore } from '@/stores/calendarStore';

interface CalendarHeaderProps {
    days: Date[];
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ days }) => {
    const { view } = useCalendarStore();
    const colSpanStyle = view === 'week' ? 'col-span-1' : 'col-span-7';
    return (
        <div className={`grid grid-cols-8 gap-px bg-gray-200`}>
            <div className="bg-white p-2 text-center"></div>
            {days.map((day) => (
                <div
                    key={day.toISOString()}
                    className={`bg-white p-2 text-center ${colSpanStyle}`}
                >
                    <div className="font-medium">
                        {format(day, 'EEEE', { locale: fr })}
                    </div>
                    <div className="text-sm text-gray-500">
                        {format(day, 'd MMMM', { locale: fr })}
                    </div>
                </div>
            ))}
        </div>
    );
}; 