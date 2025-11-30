import React, { useState, useMemo } from 'react';
import { Card, CardBody, Chip, Button, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { ModalProvider, useModal } from '../../contexts/ModalContext';
import { ModalRenderer } from '../ModalRenderer';
import CalendarViewSelector from './CalendarViewSelector';
import CalendarFilters from './CalendarFilters';
import CalendarLegend from './CalendarLegend';
import WeekView from './WeekView';
import DayView from './DayView';
import RentalTooltip from './RentalTooltip';
import PaymentIndicator from './PaymentIndicator';
import { determineRentalStatus } from '../../lib/rental-utils';

function RentalCalendarContent({ rentals, properties = [], onRentalsChange }) {
    const { openModal } = useModal();
    const [view, setView] = useState('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedProperty, setSelectedProperty] = useState('all');
    const [selectedStatuses, setSelectedStatuses] = useState(new Set(['all']));
    const [selectedTypes, setSelectedTypes] = useState(new Set(['all']));
    const [showFilters, setShowFilters] = useState(false);

    // Filter rentals based on selected filters
    const filteredRentals = useMemo(() => {
        return rentals.filter(rental => {
            // Filter by property
            if (selectedProperty !== 'all' && rental.property_id !== selectedProperty) {
                return false;
            }

            // Filter by status
            if (!selectedStatuses.has('all')) {
                const status = determineRentalStatus(rental.status, rental.start_date, rental.end_date);
                if (!selectedStatuses.has(status)) {
                    return false;
                }
            }

            // Filter by type
            if (!selectedTypes.has('all') && !selectedTypes.has(rental.rental_type)) {
                return false;
            }

            return true;
        });
    }, [rentals, selectedProperty, selectedStatuses, selectedTypes]);

    const handleClearFilters = () => {
        setSelectedProperty('all');
        setSelectedStatuses(new Set(['all']));
        setSelectedTypes(new Set(['all']));
    };

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const getRentalsForDay = (day) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return filteredRentals.filter(rental => {
            return rental.start_date <= dateStr && rental.end_date >= dateStr;
        });
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
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

    const renderRentalChip = (rental) => {
        const status = determineRentalStatus(rental.status, rental.start_date, rental.end_date);

        return (
            <RentalTooltip key={rental.id} rental={rental}>
                <Chip
                    size="sm"
                    color={getStatusColor(status)}
                    variant="flat"
                    className="w-full justify-start mb-1 cursor-pointer"
                >
                    <span className="truncate text-xs flex items-center gap-1">
                        {rental.properties?.title}
                        <PaymentIndicator status={rental.paymentStatus} />
                    </span>
                </Chip>
            </RentalTooltip>
        );
    };

    const handleDayClick = (day) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        openModal('quickCreateRental', {
            initialDate: dateStr,
            properties,
            rentals,
            onSuccess: handleQuickCreateSuccess
        });
    };

    const handleQuickCreateSuccess = () => {
        if (onRentalsChange) {
            onRentalsChange();
        }
    };

    const renderMonthView = () => (
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
                        <div
                            key={day}
                            className="h-20 sm:h-32 border border-gray-200 rounded-lg p-1 sm:p-2 flex flex-col hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => dayRentals.length === 0 && handleDayClick(day)}
                        >
                            <div className="text-right text-xs sm:text-sm font-medium text-gray-700 mb-1">{day}</div>
                            <div className="flex-1 overflow-hidden">
                                {dayRentals.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-xs text-gray-400">
                                        + Crear
                                    </div>
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            {/* View Selector */}
            <div className="flex justify-between items-center">
                <CalendarViewSelector view={view} onViewChange={setView} />
                <Button
                    size="sm"
                    variant="flat"
                    onPress={() => setShowFilters(!showFilters)}
                >
                    {showFilters ? '▲' : '▼'} Filtros
                </Button>
            </div>

            {/* Filters */}
            {showFilters && (
                <CalendarFilters
                    properties={properties}
                    selectedProperty={selectedProperty}
                    selectedStatuses={selectedStatuses}
                    selectedTypes={selectedTypes}
                    onPropertyChange={setSelectedProperty}
                    onStatusChange={setSelectedStatuses}
                    onTypeChange={setSelectedTypes}
                    onClearFilters={handleClearFilters}
                />
            )}

            {/* Legend */}
            <CalendarLegend />

            {/* Results count */}
            <div className="text-sm text-gray-600">
                Mostrando {filteredRentals.length} de {rentals.length} alquileres
            </div>

            {/* Views */}
            {view === 'month' && renderMonthView()}
            {view === 'week' && (
                <WeekView
                    rentals={filteredRentals}
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                />
            )}
            {view === 'day' && (
                <DayView
                    rentals={filteredRentals}
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                />
            )}

            {/* Centralized Modal Rendering */}
            <ModalRenderer />
        </div>
    );
}

// Wrap with ModalProvider
export default function RentalCalendar(props) {
    return (
        <ModalProvider>
            <RentalCalendarContent {...props} />
        </ModalProvider>
    );
}
