import React from 'react';
import { Button, Chip, Card, CardBody } from "@heroui/react";
import RentalTooltip from './RentalTooltip';
import { determineRentalStatus } from '../../lib/rental-utils';

export default function WeekView({ rentals, currentDate, onDateChange }) {
    // Get the start of the week (Sunday)
    const getWeekStart = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    };

    const weekStart = getWeekStart(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        return day;
    });

    const getRentalsForDay = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return rentals.filter(rental => {
            return rental.start_date <= dateStr && rental.end_date >= dateStr;
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'primary',
            active: 'success',
            near_expiration: 'warning',
            expired: 'danger',
            terminated: 'default',
            cancelled: 'default'
        };
        return colors[status] || 'default';
    };

    const nextWeek = () => {
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 7);
        onDateChange(next);
    };

    const prevWeek = () => {
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 7);
        onDateChange(prev);
    };

    const goToToday = () => {
        onDateChange(new Date());
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-gray-900/30">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Semana del {weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </h3>
                <div className="flex gap-2">
                    <Button size="sm" variant="flat" onPress={prevWeek}>Anterior</Button>
                    <Button size="sm" variant="flat" onPress={goToToday}>Hoy</Button>
                    <Button size="sm" variant="flat" onPress={nextWeek}>Siguiente</Button>
                </div>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, idx) => {
                    const dayRentals = getRentalsForDay(day);
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                        <div key={idx} className="flex flex-col">
                            {/* Day Header */}
                            <div className={`text-center p-2 rounded-t-lg ${isToday ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                <div className="text-xs font-semibold">
                                    {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                                </div>
                                <div className="text-lg font-bold">
                                    {day.getDate()}
                                </div>
                            </div>

                            {/* Rentals */}
                            <div className="border dark:border-gray-700 border-t-0 rounded-b-lg p-2 min-h-[300px] space-y-2 bg-white dark:bg-gray-800">
                                {dayRentals.map(rental => {
                                    const status = determineRentalStatus(rental.status, rental.start_date, rental.end_date);
                                    return (
                                        <RentalTooltip key={rental.id} rental={rental}>
                                            <Chip
                                                size="sm"
                                                color={getStatusColor(status)}
                                                variant="flat"
                                                className="w-full justify-start cursor-pointer"
                                            >
                                                <span className="truncate text-xs">
                                                    {rental.properties?.title}
                                                </span>
                                            </Chip>
                                        </RentalTooltip>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
