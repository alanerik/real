import React, { useState, useEffect } from 'react';
import { Input, Button, Select, SelectItem, Textarea, DatePicker, Tabs, Tab, Checkbox, CheckboxGroup, Switch, Card, CardBody, Divider, Alert } from "@heroui/react";
import { createRental, updateRental, getRentalById, getRentals } from '../../lib/rentals';
import { getAllProperties } from '../../lib/properties';
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { AVAILABLE_SERVICES, RENTAL_TYPES } from '../../lib/rental-utils';
import PaymentTab from './PaymentTab';
import DocumentManager from './DocumentManager';

/**
 * @param {{ rentalId?: string | null }} props
 */
export default function RentalForm({ rentalId: initialRentalId = null }) {
    const [rentalId, setRentalId] = useState(initialRentalId);
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [allRentals, setAllRentals] = useState([]);
    const [conflict, setConflict] = useState(null);
    const [formData, setFormData] = useState({
        property_id: '',
        tenant_name: '',
        tenant_contact: '',
        tenant_email: '',
        start_date: null,
        end_date: null,
        status: 'pending',
        total_amount: '',
        notes: '',
        // Phase 1 new fields
        rental_type: 'long_term',
        services_included: [],
        utilities_included_in_rent: true,
        pets_allowed: false,
        max_pets: 0,
        smoking_allowed: false,
        max_occupants: 2,
        special_conditions: ''
    });

    useEffect(() => {
        loadProperties();
        loadAllRentals();
        if (rentalId) {
            loadRental(rentalId);
        }
    }, [rentalId]);

    useEffect(() => {
        if (formData.property_id && formData.start_date && formData.end_date) {
            checkAvailability();
        } else {
            setConflict(null);
        }
    }, [formData.property_id, formData.start_date, formData.end_date]);

    const loadProperties = async () => {
        const props = await getAllProperties();
        setProperties(props);
    };

    const loadAllRentals = async () => {
        const rentals = await getRentals();
        setAllRentals(rentals);
    };

    const checkAvailability = () => {
        const startDate = formData.start_date.toString();
        const endDate = formData.end_date.toString();

        const conflicts = allRentals.filter(rental => {
            if (rentalId && rental.id === rentalId) return false;
            if (rental.property_id !== formData.property_id) return false;
            if (rental.status === 'cancelled' || rental.status === 'terminated') return false;

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
        if (conflict && !rentalId) {
            alert('No puedes crear un alquiler para una propiedad que ya está ocupada en esas fechas.');
            return;
        }

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
                            {/* Basic Information */}
                            <Card>
                                <CardBody className="gap-4">
                                    <h3 className="text-lg font-semibold">Información Básica</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            label="Tipo de Alquiler"
                                            placeholder="Seleccionar tipo"
                                            selectedKeys={[formData.rental_type]}
                                            onChange={(e) => handleChange('rental_type', e.target.value)}
                                            description="Define la duración y características del alquiler"
                                            isRequired
                                        >
                                            {Object.entries(RENTAL_TYPES).map(([key, { label, icon, description }]) => (
                                                <SelectItem key={key} value={key} textValue={label}>
                                                    <div className="flex flex-col">
                                                        <span>{label}</span>
                                                        <span className="text-xs text-gray-500">{description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </Select>

                                        <div className="space-y-2">
                                            <Select
                                                label="Estado"
                                                placeholder="Seleccionar estado"
                                                selectedKeys={[formData.status]}
                                                onChange={(e) => handleChange('status', e.target.value)}
                                                isRequired
                                                description="Solo puedes cambiar manualmente a 'Terminado' o 'Cancelado'. Los demás estados se calculan automáticamente según las fechas."
                                            >
                                                {/* Read-only automatic states */}
                                                <SelectItem key="pending" value="pending" isDisabled>
                                                    Pendiente (Automático)
                                                </SelectItem>
                                                <SelectItem key="active" value="active" isDisabled>
                                                    Activo (Automático)
                                                </SelectItem>
                                                <SelectItem key="near_expiration" value="near_expiration" isDisabled>
                                                    Próximo a Vencer (Automático)
                                                </SelectItem>
                                                <SelectItem key="expired" value="expired" isDisabled>
                                                    Vencido (Automático)
                                                </SelectItem>

                                                {/* Manual states */}
                                                <SelectItem key="terminated" value="terminated">
                                                    Terminado (Manual)
                                                </SelectItem>
                                                <SelectItem key="cancelled" value="cancelled">
                                                    Cancelado (Manual)
                                                </SelectItem>
                                            </Select>

                                            {(formData.status === 'pending' || formData.status === 'active' || formData.status === 'near_expiration' || formData.status === 'expired') && (
                                                <Alert
                                                    color="primary"
                                                    variant="flat"
                                                    title="Estado Automático"
                                                    description={`Estado actual: ${formData.status === 'pending' ? 'Pendiente' :
                                                        formData.status === 'active' ? 'Activo' :
                                                            formData.status === 'near_expiration' ? 'Próximo a Vencer' :
                                                                'Vencido'
                                                        } (calculado automáticamente según las fechas)`}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Tenant Information */}
                            <Card>
                                <CardBody className="gap-4">
                                    <h3 className="text-lg font-semibold">Información del Inquilino</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            className="md:col-span-2"
                                        />
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Dates and Amount */}
                            <Card>
                                <CardBody className="gap-4">
                                    <h3 className="text-lg font-semibold">Fechas y Monto</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                        onPress={() => handleChange('start_date', parseDate(conflict.nextAvailable))}
                                                    >
                                                        Usar fecha disponible: {conflict.nextAvailable}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Alert>
                                    )}
                                </CardBody>
                            </Card>

                            {/* Services Included */}
                            <Card>
                                <CardBody className="gap-4">
                                    <h3 className="text-lg font-semibold">Servicios Incluidos</h3>

                                    <CheckboxGroup
                                        value={formData.services_included}
                                        onValueChange={(value) => handleChange('services_included', value)}
                                        orientation="horizontal"
                                        classNames={{
                                            wrapper: "grid grid-cols-2 md:grid-cols-3 gap-2"
                                        }}
                                    >
                                        {AVAILABLE_SERVICES.map(service => (
                                            <Checkbox key={service.value} value={service.value}>
                                                {service.icon} {service.label}
                                            </Checkbox>
                                        ))}
                                    </CheckboxGroup>

                                    <Divider />

                                    <Switch
                                        isSelected={formData.utilities_included_in_rent}
                                        onValueChange={(value) => handleChange('utilities_included_in_rent', value)}
                                    >
                                        Servicios incluidos en la renta mensual
                                    </Switch>
                                    <p className="text-xs text-gray-500">
                                        {formData.utilities_included_in_rent
                                            ? "Los servicios están incluidos en el precio de la renta"
                                            : "Los servicios se pagan por separado"
                                        }
                                    </p>
                                </CardBody>
                            </Card>

                            {/* Conditions and Restrictions */}
                            <Card>
                                <CardBody className="gap-4">
                                    <h3 className="text-lg font-semibold">Condiciones y Restricciones</h3>

                                    <div className="space-y-4">
                                        {/* Pets */}
                                        <div className="flex items-start gap-4">
                                            <Switch
                                                isSelected={formData.pets_allowed}
                                                onValueChange={(value) => {
                                                    handleChange('pets_allowed', value);
                                                    if (!value) handleChange('max_pets', 0);
                                                }}
                                            >
                                                Mascotas permitidas
                                            </Switch>

                                            {formData.pets_allowed && (
                                                <Input
                                                    type="number"
                                                    label="Máximo de mascotas"
                                                    value={String(formData.max_pets)}
                                                    onValueChange={(val) => handleChange('max_pets', Number(val))}
                                                    className="w-40"
                                                    min={1}
                                                    max={10}
                                                />
                                            )}
                                        </div>

                                        <Divider />

                                        {/* Smoking */}
                                        <Switch
                                            isSelected={formData.smoking_allowed}
                                            onValueChange={(value) => handleChange('smoking_allowed', value)}
                                        >
                                            Permitido fumar
                                        </Switch>

                                        <Divider />

                                        {/* Max Occupants */}
                                        <Input
                                            type="number"
                                            label="Máximo de ocupantes"
                                            value={String(formData.max_occupants)}
                                            onValueChange={(val) => handleChange('max_occupants', Number(val))}
                                            className="max-w-xs"
                                            min={1}
                                            max={20}
                                            description="Número máximo de personas que pueden habitar la propiedad"
                                        />

                                        <Divider />

                                        {/* Special Conditions */}
                                        <Textarea
                                            label="Condiciones especiales"
                                            placeholder="Ej: Horarios de ruido, restricciones de uso, normas de convivencia, etc."
                                            value={formData.special_conditions}
                                            onValueChange={(val) => handleChange('special_conditions', val)}
                                            minRows={3}
                                        />
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Notes */}
                            <Textarea
                                label="Notas Adicionales"
                                placeholder="Notas internas sobre el alquiler..."
                                value={formData.notes}
                                onValueChange={(val) => handleChange('notes', val)}
                                minRows={2}
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
