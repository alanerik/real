import { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Textarea,
    useDisclosure
} from "@heroui/react";
import { getRenewalRequestsByRental, updateRenewalStatus } from '../../lib/renewals';
import { logActivity, ActivityTypes, getCurrentUserId } from '../../lib/activity';
import { showToast } from '../ToastManager';

const statusColorMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'default'
};

const statusLabelMap = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    cancelled: 'Cancelada'
};

export default function RenewalManagement({ rentalId }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [processing, setProcessing] = useState(false);
    const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure();
    const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();

    useEffect(() => {
        loadRequests();
    }, [rentalId]);

    const loadRequests = async () => {
        try {
            const data = await getRenewalRequestsByRental(rentalId);
            setRequests(data || []);
        } catch (error) {
            showToast({
                title: 'Error al cargar solicitudes',
                description: error.message,
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        setProcessing(true);
        try {
            const userId = await getCurrentUserId();

            await updateRenewalStatus(selectedRequest.id, 'approved', adminResponse);

            await logActivity({
                rental_id: rentalId,
                user_id: userId,
                activity_type: ActivityTypes.RENEWAL_APPROVED,
                description: 'Solicitud de renovación aprobada',
                metadata: {
                    duration_months: selectedRequest.requested_duration_months,
                    amount: selectedRequest.proposed_amount
                }
            });

            showToast({
                title: 'Solicitud aprobada',
                description: 'La renovación ha sido aprobada exitosamente',
                color: 'success'
            });

            loadRequests();
            onApproveClose();
            setAdminResponse('');
        } catch (error) {
            showToast({
                title: 'Error al aprobar',
                description: error.message,
                color: 'danger'
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !adminResponse.trim()) {
            showToast({
                title: 'Motivo requerido',
                description: 'Debes explicar el motivo del rechazo',
                color: 'warning'
            });
            return;
        }

        setProcessing(true);
        try {
            const userId = await getCurrentUserId();

            await updateRenewalStatus(selectedRequest.id, 'rejected', adminResponse);

            await logActivity({
                rental_id: rentalId,
                user_id: userId,
                activity_type: ActivityTypes.RENEWAL_REJECTED,
                description: 'Solicitud de renovación rechazada',
                metadata: {
                    reason: adminResponse
                }
            });

            showToast({
                title: 'Solicitud rechazada',
                description: 'La renovación ha sido rechazada',
                color: 'success'
            });

            loadRequests();
            onRejectClose();
            setAdminResponse('');
        } catch (error) {
            showToast({
                title: 'Error al rechazar',
                description: error.message,
                color: 'danger'
            });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardBody>
                    <p className="text-center">Cargando solicitudes...</p>
                </CardBody>
            </Card>
        );
    }

    if (requests.length === 0) {
        return (
            <Card>
                <CardBody>
                    <p className="text-center text-gray-600">No hay solicitudes de renovación</p>
                </CardBody>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-bold">Solicitudes de Renovación</h3>
                </CardHeader>
                <CardBody>
                    <Table aria-label="Solicitudes de renovación">
                        <TableHeader>
                            <TableColumn>FECHA</TableColumn>
                            <TableColumn>DURACIÓN</TableColumn>
                            <TableColumn>MONTO</TableColumn>
                            <TableColumn>MENSAJE</TableColumn>
                            <TableColumn>ESTADO</TableColumn>
                            <TableColumn>ACCIONES</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {requests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>
                                        {new Date(request.created_at).toLocaleDateString('es-AR')}
                                    </TableCell>
                                    <TableCell>{request.requested_duration_months} meses</TableCell>
                                    <TableCell>${request.proposed_amount.toLocaleString()}</TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {request.tenant_message || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip color={statusColorMap[request.status]} variant="flat" size="sm">
                                            {statusLabelMap[request.status]}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        {request.status === 'pending' ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    color="success"
                                                    variant="flat"
                                                    onPress={() => {
                                                        setSelectedRequest(request);
                                                        onApproveOpen();
                                                    }}
                                                >
                                                    Aprobar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    color="danger"
                                                    variant="flat"
                                                    onPress={() => {
                                                        setSelectedRequest(request);
                                                        onRejectOpen();
                                                    }}
                                                >
                                                    Rechazar
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500">
                                                {request.admin_response || '-'}
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* Approve Modal */}
            <Modal isOpen={isApproveOpen} onClose={onApproveClose}>
                <ModalContent>
                    <ModalHeader>Aprobar Renovación</ModalHeader>
                    <ModalBody>
                        <p className="mb-4">
                            ¿Aprobar renovación de <strong>{selectedRequest?.requested_duration_months} meses</strong> por <strong>${selectedRequest?.proposed_amount.toLocaleString()}/mes</strong>?
                        </p>
                        <Textarea
                            label="Mensaje al inquilino (opcional)"
                            placeholder="Ej: Aprobado. Gracias por tu solicitud."
                            value={adminResponse}
                            onChange={(e) => setAdminResponse(e.target.value)}
                            minRows={3}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onApproveClose}>
                            Cancelar
                        </Button>
                        <Button color="success" onPress={handleApprove} isLoading={processing}>
                            Confirmar Aprobación
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Reject Modal */}
            <Modal isOpen={isRejectOpen} onClose={onRejectClose}>
                <ModalContent>
                    <ModalHeader>Rechazar Renovación</ModalHeader>
                    <ModalBody>
                        <Textarea
                            label="Motivo del rechazo (requerido)"
                            placeholder="Explica el motivo del rechazo..."
                            value={adminResponse}
                            onChange={(e) => setAdminResponse(e.target.value)}
                            minRows={4}
                            isRequired
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onRejectClose}>
                            Cancelar
                        </Button>
                        <Button color="danger" onPress={handleReject} isLoading={processing}>
                            Confirmar Rechazo
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
