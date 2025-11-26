import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, DatePicker, Alert } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { createRental } from '../../lib/rentals';

export default function QuickCreateRentalModal({
    isOpen,
    onClose,
    initialDate,
    properties = [],
    rentals = [],
    onSuccess
}) {
    const [loading, setLoading] = useState(false);
    const [conflict, setConflict] = useState(null);
    const [formData, setFormData] = useState({
        property_id: '',
        tenant_name: '',
        tenant_email: '',
        tenant_contact: '',
        start_date: initialDate ? parseDate(initialDate) : null,
        end_date: null,
        total_amount: '',
        status: 'pending'
    });

    // Check for conflicts when property or dates change
    useEffect(() => {
        if (formData.property_id && formData.start_date && formData.end_date) {
            checkAvailability();
        } else {
            setConflict(null);
        }
    }, [formData.property_id, formData.start_date, formData.end_date]);

    const checkAvailability = () => {
        const startDate = formData.start_date.toString();
        const endDate = formData.end_date.toString();

        // Find conflicting rentals for the same property
        const conflicts = rentals.filter(rental => {
            if (rental.property_id !== formData.property_id) return false;
            if (rental.status === 'cancelled' || rental.status === 'terminated') return false;

            // Check if dates overlap
            return (
                (startDate >= rental.start_date && startDate <= rental.end_date) ||
                (endDate >= rental.start_date && endDate <= rental.end_date) ||
                (startDate <= rental.start_date && endDate >= rental.end_date)
            );
        });

        if (conflicts.length > 0) {
            const conflictingRental = conflicts[0];
            const nextAvailable = new Date(conflictingRental.end_date);
            nextAvailable.setDate(nextAvailable.getDate() + 1);

            setConflict({
                rental: conflictingRental,
                nextAvailable: nextAvailable.toISOString().split('T')[0]
            });
        } else {
            setConflict(null);
        }
    };

    const handleSubmit = async () => {
        if (conflict) {
            alert('No puedes crear un alquiler para una propiedad que ya está ocupada en esas fechas.');
            return;
        }

        setLoading(true);
        try {
            const dataToSave = {
                ...formData,
                start_date: formData.start_date ? formData.start_date.toString() : null,
                end_date: formData.end_date ? formData.end_date.toString() : null,
                total_amount: Number(formData.total_amount),
                rental_type: 'long_term',
                notes: 'Creado desde calendario'
            };

            await createRental(dataToSave);

            if (onSuccess) {
                onSuccess();
            }

            // Reset form
            setFormData({
                property_id: '',
                tenant_name: '',
                tenant_email: '',
                tenant_contact: '',
                start_date: initialDate ? parseDate(initialDate) : null,
                end_date: null,
                total_amount: '',
                status: 'pending'
            });
            setConflict(null);

            onClose();
        } catch (error) {
            console.error('Error creating rental:', error);
            alert('Error al crear el alquiler');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const goToFullForm = () => {
        window.location.href = '/admin/rentals/new';
    };

    const useSuggestedDate = () => {
        if (conflict && conflict.nextAvailable) {
            handleChange('start_date', parseDate(conflict.nextAvailable));
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            scrollBehavior="inside"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    Crear Alquiler Rápido
                    <p className="text-sm text-gray-500 font-normal">
                        Completa los campos básicos o ve al formulario completo
                    </p>
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <Select
                            label="Propiedad"
                            placeholder="Seleccionar propiedad"
                            selectedKeys={formData.property_id ? [formData.property_id] : []}
                            onChange={(e) => handleChange('property_id', e.target.value)}
                            isRequired
                        >
                            {properties.map((prop) => (
                                <SelectItem key={prop.id} value={prop.id}>
                                    {prop.data?.title || prop.title}
                                </SelectItem>
                            ))}
                        </Select>

                        {/* Conflict Alert */}
                        {conflict && (
                            <Alert
                                color="danger"
                                title="⚠️ Propiedad No Disponible"
                                variant="flat"
                            >
                                <div className="space-y-2">
                                    <p className="text-sm">
                                        Esta propiedad ya está alquilada del <strong>{conflict.rental.start_date}</strong> al <strong>{conflict.rental.end_date}</strong>
                                    </p>
                                    <p className="text-sm">
                                        Inquilino actual: <strong>{conflict.rental.tenant_name}</strong>
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            size="sm"
                                            color="primary"
                                            variant="flat"
                                            onPress={useSuggestedDate}
                                        >
                                            Usar fecha disponible: {conflict.nextAvailable}
                                        </Button>
                                    </div>
                                </div>
                            </Alert>
                        )}

                        <Input
                            label="Nombre del Inquilino"
                            placeholder="Nombre completo"
                            value={formData.tenant_name}
                            onValueChange={(val) => handleChange('tenant_name', val)}
                            isRequired
                        />

                        <Input
                            type="email"
                            label="Email del Inquilino"
                            placeholder="inquilino@ejemplo.com"
                            value={formData.tenant_email}
                            onValueChange={(val) => handleChange('tenant_email', val)}
                        />

                        <Input
                            label="Contacto"
                            placeholder="Teléfono"
                            value={formData.tenant_contact}
                            onValueChange={(val) => handleChange('tenant_contact', val)}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <DatePicker
                                label="Fecha Inicio"
                                value={formData.start_date}
                                onChange={(val) => handleChange('start_date', val)}
                                isRequired
                            />

                            <DatePicker
                                label="Fecha Fin"
                                value={formData.end_date}
                                onChange={(val) => handleChange('end_date', val)}
                                isRequired
                            />
                        </div>

                        <Input
                            type="number"
                            label="Monto Mensual"
                            placeholder="0.00"
                            startContent={
                                <div className="pointer-events-none flex items-center">
                                    <span className="text-default-400 text-small">$</span>
                                </div>
                            }
                            value={formData.total_amount}
                            onValueChange={(val) => handleChange('total_amount', val)}
                            isRequired
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="default"
                        variant="light"
                        onPress={goToFullForm}
                    >
                        Formulario Completo
                    </Button>
                    <Button
                        color="danger"
                        variant="light"
                        onPress={onClose}
                    >
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleSubmit}
                        isLoading={loading}
                        isDisabled={!formData.property_id || !formData.tenant_name || !formData.start_date || !formData.end_date || !formData.total_amount || conflict !== null}
                    >
                        Crear Alquiler
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
