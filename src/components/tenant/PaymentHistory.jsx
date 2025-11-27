import { useState, useEffect } from 'react';
import { getPaymentsByRental } from '../../lib/payments';
import { getAttachments, uploadAttachment, getAttachmentUrl } from '../../lib/rentals';
import { showToast } from '../ToastManager';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Button,
    Card,
    CardBody,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure
} from "@heroui/react";

const columns = [
    { name: "FECHA VENCIMIENTO", uid: "due_date" },
    { name: "MONTO", uid: "amount" },
    { name: "ESTADO", uid: "status" },
    { name: "COMPROBANTE", uid: "receipt" },
    { name: "FECHA PAGO", uid: "payment_date" },
    { name: "MÉTODO", uid: "payment_method" },
];

const statusColorMap = {
    paid: "success",
    pending: "warning",
    overdue: "danger",
};

const statusLabelMap = {
    paid: "Pagado",
    pending: "Pendiente",
    overdue: "Vencido",
};

export default function PaymentHistory({ rentalId }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [receipts, setReceipts] = useState({});
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        loadPayments();
    }, [rentalId]);

    const loadPayments = async () => {
        try {
            const data = await getPaymentsByRental(rentalId);
            setPayments(data || []);

            // Load all attachments and group by payment_id
            const attachments = await getAttachments(rentalId);
            const receiptsByPayment = {};

            attachments?.forEach(att => {
                if (att.payment_id) {
                    if (!receiptsByPayment[att.payment_id]) {
                        receiptsByPayment[att.payment_id] = [];
                    }
                    receiptsByPayment[att.payment_id].push(att);
                }
            });

            setReceipts(receiptsByPayment);
        } catch (error) {
            console.error('Error loading payments:', error);
            showToast({
                title: 'Error al cargar pagos',
                description: error.message,
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUploadClick = (paymentId) => {
        setSelectedPaymentId(paymentId);
        document.getElementById('payment-receipt-upload').click();
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                showToast({
                    title: 'Archivo muy grande',
                    description: 'El archivo excede el tamaño máximo de 10MB',
                    color: 'danger'
                });
                return;
            }
            setSelectedFile(file);
            onOpen();
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !selectedPaymentId) return;

        setUploading(true);
        try {
            await uploadAttachment(selectedFile, rentalId, {
                category: 'payment_receipt',
                description: `Comprobante de pago`,
                visibleToTenant: true,
                uploadedByTenant: true,
                paymentId: selectedPaymentId
            });

            showToast({
                title: 'Comprobante subido',
                description: 'Tu comprobante ha sido enviado exitosamente',
                color: 'success'
            });

            // Reload payments and receipts
            loadPayments();
            onClose();
            setSelectedFile(null);
            setSelectedPaymentId(null);
        } catch (error) {
            showToast({
                title: 'Error al subir comprobante',
                description: error.message || 'Intenta nuevamente',
                color: 'danger'
            });
        } finally {
            setUploading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-AR');
    };

    const renderCell = (payment, columnKey) => {
        switch (columnKey) {
            case "due_date":
                return <span className="text-sm">{formatDate(payment.due_date)}</span>;
            case "amount":
                return <span className="text-sm font-semibold">${payment.amount?.toLocaleString()}</span>;
            case "status":
                return (
                    <Chip
                        color={statusColorMap[payment.status]}
                        size="sm"
                        variant="flat"
                    >
                        {statusLabelMap[payment.status]}
                    </Chip>
                );
            case "receipt":
                const paymentReceipts = receipts[payment.id] || [];
                if (paymentReceipts.length > 0) {
                    return (
                        <div className="flex items-center gap-2">
                            <Chip color="success" size="sm" variant="flat" startContent={<CheckIcon />}>
                                {paymentReceipts.length}
                            </Chip>
                            <Button
                                size="sm"
                                variant="light"
                                color="primary"
                                as="a"
                                href={getAttachmentUrl(paymentReceipts[0].file_path)}
                                target="_blank"
                            >
                                Ver
                            </Button>
                        </div>
                    );
                }
                // Show upload button for pending/overdue payments
                if (payment.status === 'pending' || payment.status === 'overdue') {
                    return (
                        <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => handleUploadClick(payment.id)}
                            startContent={<UploadIcon />}
                        >
                            Subir
                        </Button>
                    );
                }
                return <span className="text-gray-400 text-sm">-</span>;
            case "payment_date":
                return <span className="text-sm">{formatDate(payment.payment_date)}</span>;
            case "payment_method":
                return <span className="text-sm capitalize">{payment.payment_method || '-'}</span>;
            default:
                return payment[columnKey];
        }
    };

    if (loading) {
        return <div className="text-center py-4">Cargando pagos...</div>;
    }

    if (payments.length === 0) {
        return (
            <Card>
                <CardBody>
                    <p className="text-center text-gray-600">No hay pagos registrados aún.</p>
                </CardBody>
            </Card>
        );
    }

    // Calculate summary
    const totalPaid = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalPending = payments
        .filter(p => p.status === 'pending' || p.status === 'overdue')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardBody className="text-center p-4">
                        <p className="text-sm text-gray-600">Total Pagado</p>
                        <p className="text-2xl font-bold text-success">${totalPaid.toLocaleString()}</p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="text-center p-4">
                        <p className="text-sm text-gray-600">Pendiente</p>
                        <p className="text-2xl font-bold text-warning">${totalPending.toLocaleString()}</p>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody className="text-center p-4">
                        <p className="text-sm text-gray-600">Total Pagos</p>
                        <p className="text-2xl font-bold text-primary">{payments.length}</p>
                    </CardBody>
                </Card>
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                id="payment-receipt-upload"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
            />

            {/* Payments Table */}
            <Table aria-label="Historial de pagos">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={payments}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Upload Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Subir Comprobante de Pago</ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div className="text-sm text-gray-600">
                                        Archivo seleccionado: <strong>{selectedFile?.name}</strong>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-800">
                                            Este comprobante quedará vinculado al pago seleccionado.
                                        </p>
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={handleUpload} isLoading={uploading}>
                                    Confirmar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}

const CheckIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const UploadIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);
