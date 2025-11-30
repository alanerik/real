import React, { useState, useCallback } from "react";
import {
    Button,
    Card,
    CardBody,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Badge,
    Tooltip,
} from "@heroui/react";
import { useRentalAlerts } from "../../../hooks/useRentalAlerts";
import { calculateRemainingDays } from "../../../utils/dashboard/statsCalculator";
import { BellIcon } from "../icons/Icons";

/**
 * RentalAlerts component
 * Displays rental expiration alerts in a modal
 */
export const RentalAlerts: React.FC = () => {
    const { alerts, isLoading, loadAlerts } = useRentalAlerts();
    const [isOpen, setIsOpen] = useState(false);

    // Refresh alerts when modal opens
    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
        if (open) {
            loadAlerts();
        }
    }, [loadAlerts]);

    const hasAlerts = alerts.length > 0;

    return (
        <>
            <Tooltip content="Alertas de Alquileres">
                <Badge
                    content={alerts.length}
                    color="danger"
                    isInvisible={!hasAlerts}
                    shape="circle"
                >
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={() => setIsOpen(true)}
                        className={hasAlerts ? "text-warning-600" : "text-default-400"}
                        aria-label="Ver alertas de alquileres"
                    >
                        <BellIcon className={hasAlerts ? "animate-pulse" : ""} />
                    </Button>
                </Badge>
            </Tooltip>

            <Modal
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                size="2xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                Alertas de Alquileres ({alerts.length})
                            </ModalHeader>
                            <ModalBody>
                                {isLoading ? (
                                    <div className="text-center py-8">
                                        <p className="text-default-500">Cargando alertas...</p>
                                    </div>
                                ) : hasAlerts ? (
                                    <div className="flex flex-col gap-3">
                                        {alerts.map((alert) => {
                                            const remainingDays = calculateRemainingDays(alert.end_date);
                                            const isExpired = remainingDays < 0;
                                            const daysAgo = Math.abs(remainingDays);

                                            return (
                                                <Card key={alert.id} className={`border ${isExpired ? 'border-danger-200' : 'border-warning-200'}`}>
                                                    <CardBody className="p-4">
                                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-base text-gray-800">{alert.properties?.title}</p>
                                                                <p className="text-sm text-gray-600 mt-1">Inquilino: {alert.tenant_name}</p>
                                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                                    <Chip size="sm" color={isExpired ? "danger" : "warning"} variant="flat">
                                                                        {isExpired ? `Vencido hace ${daysAgo} día${daysAgo !== 1 ? 's' : ''}` : `${remainingDays} día${remainingDays !== 1 ? 's' : ''} restante${remainingDays !== 1 ? 's' : ''}`}
                                                                    </Chip>
                                                                    <Chip size="sm" color={isExpired ? "danger" : "warning"} variant="dot">
                                                                        {isExpired ? "Finalizó: " : "Finaliza: "} {new Date(alert.end_date).toLocaleDateString()}
                                                                    </Chip>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                color={isExpired ? "danger" : "warning"}
                                                                variant="flat"
                                                                as="a"
                                                                href={`/admin/rentals`}
                                                                className="w-full sm:w-auto"
                                                            >
                                                                Ver Detalles
                                                            </Button>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>No hay alertas de alquileres próximos a vencer</p>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cerrar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
