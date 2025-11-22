import { useState } from 'react';
import { createProvider } from '../../../lib/providers';
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

export default function ProviderForm({ onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        trade: '',
        phone: '',
        email: '',
        notes: ''
    });

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
            await createProvider(formData);
            showToast({
                title: 'Proveedor creado',
                description: 'El proveedor se ha guardado exitosamente',
                color: 'success'
            });
            setFormData({
                name: '',
                trade: '',
                phone: '',
                email: '',
                notes: ''
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error creating provider:', error);
            showToast({
                title: 'Error al crear',
                description: error.message || 'Intenta nuevamente',
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Nuevo Proveedor</h2>

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
                    {loading ? 'Guardando...' : 'Guardar Proveedor'}
                </Button>
            </Form>
        </div>
    );
}
