import { useState } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
    Select,
    SelectItem
} from "@heroui/react";
import { createRenewalRequest } from '../../lib/renewals';
import { logActivity, ActivityTypes, getCurrentUserId } from '../../lib/activity';
import { showToast } from '../ToastManager';

const DURATION_OPTIONS = [
    { value: '6', label: '6 meses' },
    { value: '12', label: '12 meses' },
    { value: '24', label: '24 meses' },
    { value: '36', label: '36 meses' }
];

export default function RenewalRequestModal({ isOpen, onClose, rental }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        duration: '12',
        amount: rental?.total_amount || '',
        message: ''
    });

    const handleSubmit = async () => {
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            showToast({
                title: 'Error',
                description: 'Ingresa un monto válido',
                color: 'danger'
            });
            return;
        }

        setLoading(true);
        try {
            const userId = await getCurrentUserId();

            // Create renewal request
            const request = await createRenewalRequest({
                rental_id: rental.id,
                requested_by: userId || '',
                requested_duration_months: parseInt(formData.duration),
                proposed_amount: parseFloat(formData.amount),
                tenant_message: formData.message
            });

            // Log activity
            await logActivity({
                rental_id: rental.id,
                user_id: userId || '',
                activity_type: ActivityTypes.RENEWAL_REQUESTED,
                description: `Solicitud de renovación enviada - ${formData.duration} meses`,
                metadata: {
                    duration_months: parseInt(formData.duration),
                    proposed_amount: parseFloat(formData.amount)
                }
            });

            showToast({
                title: '¡Solicitud enviada!',
                description: 'Tu solicitud de renovación ha sido enviada al propietario',
                color: 'success'
            });

            onClose();
            window.location.reload(); // Simple refresh to show new status
        } catch (error) {
            showToast({
                title: 'Error al enviar solicitud',
                description: error.message || 'Intenta nuevamente',
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2 className="text-2xl">🔄 Solicitar Renovación de Contrato</h2>
                            <p className="text-sm text-gray-600 font-normal">
                                Tu contrato actual vence el {new Date(rental?.end_date).toLocaleDateString('es-AR')}
                            </p>
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <Select
                                    label="Duración solicitada"
                                    placeholder="Selecciona la duración"
                                    selectedKeys={[formData.duration]}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                >
                                    {DURATION_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Input
                                    type="number"
                                    label="Monto propuesto (mensual)"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    startContent={
                                        <div className="pointer-events-none flex items-center">
                                            <span className="text-default-400 text-small">$</span>
                                        </div>
                                    }
                                />

                                <Textarea
                                    label="Mensaje al propietario (opcional)"
                                    placeholder="Escribe un mensaje explicando tu solicitud..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    minRows={4}
                                />

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>💡 Tip:</strong> El propietario recibirá tu solicitud y podrá aprobarla o rechazarla. Te notificaremos de su respuesta.
                                    </p>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Cancelar
                            </Button>
                            <Button color="success" onPress={handleSubmit} isLoading={loading}>
                                Enviar Solicitud
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
