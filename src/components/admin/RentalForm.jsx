import React, { useState, useEffect } from 'react';
import { Input, Button, Select, SelectItem, Textarea, DatePicker, Tabs, Tab } from "@heroui/react";
import { createRental, updateRental, getRentalById } from '../../lib/rentals';
import { getAllProperties } from '../../lib/properties';
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import PaymentTab from './PaymentTab';
import DocumentManager from './DocumentManager';

/**
 * @param {{ rentalId?: string | null }} props
 */
export default function RentalForm({ rentalId: initialRentalId = null }) {
    const [rentalId, setRentalId] = useState(initialRentalId);
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [formData, setFormData] = useState({
        property_id: '',
        tenant_name: '',
        tenant_contact: '',
        tenant_email: '',
        start_date: null,
        end_date: null,
        status: 'pending',
        total_amount: '',
        notes: ''
    });

    useEffect(() => {
        loadProperties();
        if (rentalId) {
            loadRental(rentalId);
        }
    }, [rentalId]);

    const loadProperties = async () => {
        const props = await getAllProperties();
        setProperties(props);
    };

    const loadRental = async (id) => {
        const rental = await getRentalById(id);
        if (rental) {
            setFormData({
                ...rental,
                start_date: rental.start_date ? parseDate(rental.start_date) : null,
                end_date: rental.end_date ? parseDate(rental.end_date) : null
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await saveRental(false);
    };

    const saveRental = async (shouldRedirect = false) => {
        setLoading(true);
        try {
            const dataToSave = {
                ...formData,
                start_date: formData.start_date ? formData.start_date.toString() : null,
                end_date: formData.end_date ? formData.end_date.toString() : null,
                total_amount: Number(formData.total_amount)
            };

            let savedId = rentalId;

            if (rentalId) {
                await updateRental(rentalId, dataToSave);
            } else {
                const newRental = await createRental(dataToSave);
                savedId = newRental.id;
                setRentalId(savedId);
                // Update URL without reloading
                window.history.replaceState(null, '', `/admin/rentals/${savedId}`);
            }

            if (shouldRedirect) {
                window.location.href = '/admin/rentals';
            } else {
                // Optional: Show a toast here
                // alert('Guardado correctamente. Ahora puedes agregar pagos y documentos.');
            }
        } catch (error) {
            console.error('Error saving rental:', error);
            alert('Error saving rental');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {rentalId ? 'Editar Alquiler' : 'Nuevo Alquiler'}
                </h2>
                <Button
                    color="default"
                    variant="light"
                    onPress={() => window.location.href = '/admin/rentals'}
                    className="w-full sm:w-auto"
                >
                    <span className="hidden sm:inline">Volver a la lista</span>
                    <span className="sm:hidden">Lista</span>
                </Button>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">

                <Tabs aria-label="Opciones de Alquiler">
                    <Tab key="general" title="General">
                        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Propiedad"
                                    placeholder="Seleccionar propiedad"
                                    selectedKeys={formData.property_id ? [formData.property_id] : []}
                                    onChange={(e) => handleChange('property_id', e.target.value)}
                                    isRequired
                                >
                                    {properties.map((prop) => (
                                        <SelectItem key={prop.id} value={prop.id}>
                                            {prop.data.title}
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Select
                                    label="Estado"
                                    placeholder="Seleccionar estado"
                                    selectedKeys={[formData.status]}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    isRequired
                                >
                                    <SelectItem key="pending" value="pending">Pendiente</SelectItem>
                                    <SelectItem key="active" value="active">Activo</SelectItem>
                                    <SelectItem key="completed" value="completed">Completado</SelectItem>
                                    <SelectItem key="cancelled" value="cancelled">Cancelado</SelectItem>
                                </Select>

                                <Input
                                    label="Nombre del Inquilino"
                                    placeholder="Nombre completo"
                                    value={formData.tenant_name}
                                    onValueChange={(val) => handleChange('tenant_name', val)}
                                    isRequired
                                />

                                <Input
                                    label="Contacto"
                                    placeholder="Teléfono o Email"
                                    value={formData.tenant_contact}
                                    onValueChange={(val) => handleChange('tenant_contact', val)}
                                />

                                <Input
                                    type="email"
                                    label="Email del Inquilino"
                                    placeholder="inquilino@ejemplo.com"
                                    value={formData.tenant_email}
                                    onValueChange={(val) => handleChange('tenant_email', val)}
                                    description="Email para enviar la invitación al portal"
                                />

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

                                <Input
                                    type="number"
                                    label="Monto Total"
                                    placeholder="0.00"
                                    startContent={
                                        <div className="pointer-events-none flex items-center">
                                            <span className="text-default-400 text-small">$</span>
                                        </div>
                                    }
                                    value={formData.total_amount}
                                    onValueChange={(val) => handleChange('total_amount', val)}
                                />
                            </div>

                            <Textarea
                                label="Notas"
                                placeholder="Notas adicionales..."
                                value={formData.notes}
                                onValueChange={(val) => handleChange('notes', val)}
                            />

                            <div className="flex justify-end gap-4">
                                <Button
                                    color="primary"
                                    type="submit"
                                    isLoading={loading}
                                >
                                    {rentalId ? 'Guardar Cambios' : 'Guardar y Continuar'}
                                </Button>
                                <Button
                                    color="success"
                                    className="text-white"
                                    onPress={() => saveRental(true)}
                                    isLoading={loading}
                                >
                                    Guardar y Salir
                                </Button>
                            </div>
                        </form>
                    </Tab>
                    <Tab key="payments" title="Pagos" isDisabled={!rentalId}>
                        <div className="mt-4">
                            {rentalId ? (
                                <PaymentTab rentalId={rentalId} />
                            ) : (
                                <p className="text-gray-500">Guarda el alquiler primero para gestionar pagos.</p>
                            )}
                        </div>
                    </Tab>
                    <Tab key="documents" title="Documentos" isDisabled={!rentalId}>
                        <div className="mt-4">
                            {rentalId ? (
                                <DocumentManager rentalId={rentalId} />
                            ) : (
                                <p className="text-gray-500">Guarda el alquiler primero para gestionar documentos.</p>
                            )}
                        </div>
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
}
