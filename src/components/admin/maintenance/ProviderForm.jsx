import { useState, useEffect } from 'react';
import { createProvider, updateProvider } from '../../../lib/providers';
import { showToast } from '../../ToastManager';
import { Form, Input, Select, SelectItem, Textarea, Button } from "@heroui/react";

const TRADES = [
    { key: 'plomero', label: 'Plomero' },
    { key: 'electricista', label: 'Electricista' },
    { key: 'gasista', label: 'Gasista' },
    { key: 'pintor', label: 'Pintor' },
    { key: 'albanil', label: 'Albañil' },
    { key: 'cerrajero', label: 'Cerrajero' },
    { key: 'jardinero', label: 'Jardinero' },
    { key: 'aire_acondicionado', label: 'Técnico Aire Acondicionado' },
    { key: 'otro', label: 'Otro' },
];

export default function ProviderForm({ onSuccess, editingProvider }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        trade: '',
        phone: '',
        email: '',
        notes: ''
    });

    useEffect(() => {
        if (editingProvider) {
            setFormData({
                name: editingProvider.name || '',
                trade: editingProvider.trade || '',
                phone: editingProvider.phone || '',
                email: editingProvider.email || '',
                notes: editingProvider.notes || ''
            });
        }
    }, [editingProvider]);

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
            if (editingProvider) {
                await updateProvider(editingProvider.id, formData);
                showToast({
                    title: 'Proveedor actualizado',
                    description: 'Los cambios se han guardado exitosamente',
                    color: 'success'
                });
            } else {
                await createProvider(formData);
                showToast({
                    title: 'Proveedor creado',
                    description: 'El proveedor se ha guardado exitosamente',
                    color: 'success'
                });
            }
            setFormData({
                name: '',
                trade: '',
                phone: '',
                email: '',
                notes: ''
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error saving provider:', error);
            showToast({
                title: editingProvider ? 'Error al actualizar' : 'Error al crear',
                description: error.message || 'Intenta nuevamente',
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>

            <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nombre Completo"
                        placeholder="Ej: Juan Perez"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        isRequired
                    />

                    <Select
                        label="Oficio / Rubro"
                        placeholder="Seleccionar oficio"
                        selectedKeys={formData.trade ? [formData.trade] : []}
                        onChange={(e) => handleSelectChange("trade", e.target.value)}
                        isRequired
                    >
                        {TRADES.map((trade) => (
                            <SelectItem key={trade.key} value={trade.key}>
                                {trade.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Teléfono"
                        placeholder="Ej: +54 9 11 1234 5678"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        isRequired
                        description="Incluye el código de área para WhatsApp"
                    />

                    <Input
                        type="email"
                        label="Email (Opcional)"
                        placeholder="juan@ejemplo.com"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <Textarea
                    label="Notas Adicionales"
                    placeholder="Horarios, zonas de cobertura, etc."
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    minRows={2}
                />

                <Button
                    type="submit"
                    color="primary"
                    isLoading={loading}
                    className="w-full mt-2"
                >
                    {loading ? 'Guardando...' : (editingProvider ? 'Actualizar Proveedor' : 'Guardar Proveedor')}
                </Button>
            </Form>
        </div>
    );
}
