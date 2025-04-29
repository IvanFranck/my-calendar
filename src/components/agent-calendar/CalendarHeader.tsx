import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarHeaderProps {
    days: Date[];
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ days }) => {
    return (
        <div className="grid grid-cols-7 gap-px bg-gray-200">
            {days.map((day) => (
                <div
                    key={day.toISOString()}
                    className="bg-white p-2 text-center"
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