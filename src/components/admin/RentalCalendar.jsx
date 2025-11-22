import React, { useState } from 'react';
import { Card, CardBody, Chip, Button, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";

export default function RentalCalendar({ rentals }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const getRentalsForDay = (day) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return rentals.filter(rental => {
            return rental.start_date <= dateStr && rental.end_date >= dateStr;
        });
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const renderRentalChip = (rental) => (
        <Chip
            key={rental.id}
            size="sm"
            color={rental.status === 'active' ? 'success' : rental.status === 'pending' ? 'warning' : 'default'}
            className="w-full justify-start mb-1"
        >
            <span className="truncate text-xs">
                {rental.properties?.title}
            </span>
        </Chip>
    );

    return (
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-base sm:text-xl font-bold capitalize">
                    {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button size="sm" variant="flat" onPress={prevMonth} className="flex-1 sm:flex-none">Anterior</Button>
                    <Button size="sm" variant="flat" onPress={nextMonth} className="flex-1 sm:flex-none">Siguiente</Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, idx) => (
                    <div key={day} className="text-center font-semibold text-gray-500 text-xs sm:text-sm py-1 sm:py-2">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.charAt(0)}</span>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {emptyDays.map(i => (
                    <div key={`empty-${i}`} className="h-20 sm:h-32 bg-gray-50 rounded-lg"></div>
                ))}
                {days.map(day => {
                    const dayRentals = getRentalsForDay(day);
                    const visibleRentals = dayRentals.slice(0, 2);
                    const hiddenCount = dayRentals.length - 2;

                    return (
                        <div key={day} className="h-20 sm:h-32 border border-gray-200 rounded-lg p-1 sm:p-2 flex flex-col">
                            <div className="text-right text-xs sm:text-sm font-medium text-gray-700 mb-1">{day}</div>
                            <div className="flex-1 overflow-hidden">
                                {visibleRentals.map(renderRentalChip)}
                                {hiddenCount > 0 && (
                                    <Popover placement="bottom">
                                        <PopoverTrigger>
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                className="w-full justify-center cursor-pointer bg-gray-100 hover:bg-gray-200"
                                            >
                                                <span className="text-xs font-medium text-gray-600">
                                                    +{hiddenCount} más
                                                </span>
                                            </Chip>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <div className="px-1 py-2 w-48">
                                                <div className="text-small font-bold mb-2">Alquileres del día {day}</div>
                                                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                                                    {dayRentals.map(renderRentalChip)}
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
