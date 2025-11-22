import { useState } from 'react';
import { createMaintenanceTicket } from '../../lib/maintenance';
import { showToast } from '../ToastManager';
import { Form, Input, Select, SelectItem, Textarea, Button, Card, CardBody } from "@heroui/react";

export default function ReportIssue({ rental }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium'
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
            const ticketData = {
                property_id: rental.property_id,
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                status: 'pending',
                cost: 0,
                created_by_tenant: true
            };

            await createMaintenanceTicket(ticketData);

            showToast({
                title: 'Reporte enviado',
                description: 'Tu reporte ha sido recibido. Te contactaremos pronto.',
                color: 'success'
            });

            // Reset form
            setFormData({
                title: '',
                description: '',
                priority: 'medium'
            });
        } catch (error) {
            console.error('Error creating ticket:', error);
            showToast({
                title: 'Error al enviar reporte',
                description: error.message || 'Intenta nuevamente',
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardBody className="p-6">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Reportar un Problema</h3>
                        <p className="text-gray-600 mt-1">
                            Describe el problema que estás experimentando en tu propiedad
                        </p>
                    </div>

                    <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Título del Problema"
                            placeholder="Ej: Gotera en el baño"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            isRequired
                            description="Resume el problema en pocas palabras"
                        />

                        <Textarea
                            label="Descripción Detallada"
                            placeholder="Describe el problema con el mayor detalle posible..."
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            isRequired
                            minRows={4}
                            description="Incluye detalles como ubicación, cuándo empezó, etc."
                        />

                        <Select
                            label="Urgencia"
                            selectedKeys={[formData.priority]}
                            onChange={(e) => handleSelectChange("priority", e.target.value)}
                            description="Indica qué tan urgente es el problema"
                        >
                            <SelectItem key="low">Baja - Puede esperar</SelectItem>
                            <SelectItem key="medium">Media - Atención en días</SelectItem>
                            <SelectItem key="high">Alta - Requiere atención inmediata</SelectItem>
                        </Select>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                            <p className="text-sm text-blue-800">
                                <strong>Nota:</strong> Tu reporte será enviado al administrador.
                                Te contactaremos lo antes posible para resolver el problema.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            color="primary"
                            isLoading={loading}
                            className="w-full mt-2"
                            size="lg"
                        >
                            {loading ? 'Enviando...' : 'Enviar Reporte'}
                        </Button>
                    </Form>
                </CardBody>
            </Card>

            {/* Info Card */}
            <Card className="mt-6">
                <CardBody className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Información de Contacto</h4>
                    <p className="text-sm text-gray-600">
                        Si el problema es una emergencia (fuga de gas, incendio, etc.),
                        por favor contacta inmediatamente a los servicios de emergencia
                        y luego notifica al administrador.
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}
