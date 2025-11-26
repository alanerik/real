import { useState, useEffect } from 'react';
import { createMaintenanceTicket } from '../../../lib/maintenance';
import { getAllProperties } from '../../../lib/properties';
import { getProviders } from '../../../lib/providers';
import { showToast } from '../../ToastManager';
import { Form, Input, Select, SelectItem, Textarea, Button } from "@heroui/react";

export default function MaintenanceTicketForm({ onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [providers, setProviders] = useState([]);
    const [formData, setFormData] = useState({
        property_id: '',
        title: '',
        description: '',
        priority: 'medium',
        cost: 0,
        status: 'pending',
        assigned_provider_id: null
    });

    useEffect(() => {
        loadProperties();
        loadProviders();
    }, []);

    const loadProperties = async () => {
        try {
            const data = await getAllProperties();
            setProperties(data || []);
        } catch (error) {
            console.error('Error loading properties:', error);
            showToast({
                title: 'Error al cargar propiedades',
                description: error.message || 'Intenta recargar la página',
                color: 'danger'
            });
        }
    };

    const loadProviders = async () => {
        try {
            const data = await getProviders();
            setProviders(data || []);
        } catch (error) {
            console.error('Error loading providers:', error);
            showToast({
                title: 'Error al cargar proveedores',
                description: error.message || 'Intenta recargar la página',
                color: 'danger'
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.property_id) {
                showToast({
                    title: 'Error de validación',
                    description: 'Por favor selecciona una propiedad',
                    color: 'danger'
                });
                setLoading(false);
                return;
            }

            await createMaintenanceTicket(formData);
            showToast({
                title: 'Ticket creado',
                description: 'El ticket se ha registrado exitosamente',
                color: 'success'
            });
            setFormData({
                property_id: '',
                title: '',
                description: '',
                priority: 'medium',
                cost: 0,
                status: 'pending',
                assigned_provider_id: null
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error creating ticket:', error);
            showToast({
                title: 'Error al crear ticket',
                description: error.message || 'Intenta nuevamente',
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Nuevo Ticket de Mantenimiento</h2>

            <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Select
                    label="Propiedad"
                    placeholder="Seleccionar propiedad"
                    selectedKeys={formData.property_id ? [formData.property_id] : []}
                    onChange={(e) => handleSelectChange("property_id", e.target.value)}
                    isRequired
                >
                    {properties.map((prop) => (
                        <SelectItem key={prop.id} value={prop.id}>
                            {prop.data?.title || 'Sin título'}
                        </SelectItem>
                    ))}
                </Select>

                <Input
                    label="Título del Problema"
                    placeholder="Ej: Gotera en baño principal"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    isRequired
                />

                <Textarea
                    label="Descripción Detallada"
                    placeholder="Detalles adicionales..."
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    minRows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Prioridad"
                        selectedKeys={[formData.priority]}
                        onChange={(e) => handleSelectChange("priority", e.target.value)}
                    >
                        <SelectItem key="low">Baja</SelectItem>
                        <SelectItem key="medium">Media</SelectItem>
                        <SelectItem key="high">Alta</SelectItem>
                    </Select>

                    <Input
                        type="number"
                        label="Costo Estimado ($)"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        min={0}
                    />
                </div>

                <Select
                    label="Responsable / Técnico"
                    placeholder="Sin asignar (opcional)"
                    selectedKeys={formData.assigned_provider_id ? [String(formData.assigned_provider_id)] : []}
                    onChange={(e) => {
                        handleSelectChange("assigned_provider_id", e.target.value || null);
                    }}
                    description="Puedes asignar un técnico ahora o después"
                >
                    {providers.map((provider) => (
                        <SelectItem
                            key={String(provider.id)}
                            value={String(provider.id)}
                            textValue={`${provider.name} - ${provider.trade.replace('_', ' ')}`}
                        >
                            {provider.name} - {provider.trade.replace('_', ' ')}
                        </SelectItem>
                    ))}
                </Select>

                <Button
                    type="submit"
                    color="primary"
                    isLoading={loading}
                    className="w-full mt-2"
                >
                    {loading ? 'Guardando...' : 'Crear Ticket'}
                </Button>
            </Form>
        </div>
    );
}
