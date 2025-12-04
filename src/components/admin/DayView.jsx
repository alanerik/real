import React from 'react';
import { Button, Card, CardBody, Chip, Divider } from "@heroui/react";
import { determineRentalStatus } from '../../lib/rental-utils';

export default function DayView({ rentals, currentDate, onDateChange }) {
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayRentals = rentals.filter(rental => {
        return rental.start_date <= dateStr && rental.end_date >= dateStr;
    });

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

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pendiente',
            active: 'Activo',
            near_expiration: 'Próximo a Vencer',
            expired: 'Vencido',
            terminated: 'Terminado',
            cancelled: 'Cancelado'
        };
        return labels[status] || status;
    };

    const nextDay = () => {
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 1);
        onDateChange(next);
    };

    const prevDay = () => {
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 1);
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
                    {currentDate.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </h3>
                <div className="flex gap-2">
                    <Button size="sm" variant="flat" onPress={prevDay}>Anterior</Button>
                    <Button size="sm" variant="flat" onPress={goToToday}>Hoy</Button>
                    <Button size="sm" variant="flat" onPress={nextDay}>Siguiente</Button>
                </div>
            </div>

            {/* Rentals List */}
            <div className="space-y-3">
                {dayRentals.length === 0 ? (
                    <Card>
                        <CardBody>
                            <p className="text-center text-gray-500 dark:text-gray-400">No hay alquileres activos este día</p>
                        </CardBody>
                    </Card>
                ) : (
                    dayRentals.map(rental => {
                        const status = determineRentalStatus(rental.status, rental.start_date, rental.end_date);
                        const today = new Date();
                        const endDate = new Date(rental.end_date);
                        const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

                        return (
                            <Card key={rental.id} className="border-l-4" style={{
                                borderLeftColor: status === 'active' ? '#10b981' :
                                    status === 'near_expiration' ? '#f59e0b' :
                                        status === 'expired' ? '#ef4444' :
                                            status === 'pending' ? '#3b82f6' : '#6b7280'
                            }}>
                                <CardBody>
                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{rental.properties?.title}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{rental.tenant_name}</p>
                                                </div>
                                                <Chip
                                                    size="sm"
                                                    color={getStatusColor(status)}
                                                    variant="flat"
                                                >
                                                    {getStatusLabel(status)}
                                                </Chip>
                                            </div>

                                            <Divider className="my-2" />

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Contacto:</span>
                                                    <p className="font-medium dark:text-gray-200">{rental.tenant_contact}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Monto:</span>
                                                    <p className="font-medium dark:text-gray-200">${rental.total_amount || 0}/mes</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Inicio:</span>
                                                    <p className="font-medium dark:text-gray-200">{rental.start_date}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Fin:</span>
                                                    <p className="font-medium dark:text-gray-200">{rental.end_date}</p>
                                                </div>
                                            </div>

                                            {remainingDays >= 0 && (
                                                <div className="mt-3">
                                                    <Chip size="sm" variant="dot" color={remainingDays <= 30 ? 'warning' : 'success'}>
                                                        {remainingDays} día{remainingDays !== 1 ? 's' : ''} restante{remainingDays !== 1 ? 's' : ''}
                                                    </Chip>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex md:flex-col gap-2">
                                            <Button
                                                size="sm"
                                                color="primary"
                                                variant="flat"
                                                onPress={() => window.location.href = `/admin/rentals/${rental.id}`}
                                            >
                                                Ver Detalles
                                            </Button>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
