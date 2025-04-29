import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCalendarStore } from '../../stores/calendarStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarNavigationProps {
    days: Date[];
}

export const CalendarNavigation: React.FC<CalendarNavigationProps> = ({ days }) => {
    const { currentDate, view, setCurrentDate, setView } = useCalendarStore();

    const displayDays = useMemo(() => {
        if (days.length === 0) {
            return '';
        }
        if (view === 'week') {
            const weekStart = format(days[0], 'd MMMM', { locale: fr });
            const weekEnd = format(days[days.length - 1], 'd MMMM', { locale: fr });
            return `${weekStart} - ${weekEnd}`;
        } else {
            return format(days[0], 'd MMMM yyyy', { locale: fr });
        }
    }, [days, view, currentDate]);

    const goToPrevious = () => {
        const newDate = new Date(currentDate);
        if (view === 'week') {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setDate(newDate.getDate() - 1);
        }
        setCurrentDate(newDate);
    };

    const goToNext = () => {
        const newDate = new Date(currentDate);
        if (view === 'week') {
            newDate.setDate(newDate.getDate() + 7);
        } else {
            newDate.setDate(newDate.getDate() + 1);
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };


    return (
        <div className="flex items-center justify-between p-4 bg-white border-b">
            <div className="flex items-center space-x-4">
                <button
                    onClick={goToPrevious}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={goToToday}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md"
                >
                    Aujourd'hui
                </button>
                <button
                    onClick={goToNext}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="text-lg font-semibold">
                {displayDays}
            </div>

            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setView('day')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${view === 'day'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Jour
                </button>
                <button
                    onClick={() => setView('week')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${view === 'week'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Semaine
                </button>
            </div>
        </div>
    );
}; 