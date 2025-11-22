import { useState, useEffect } from 'react';
import { getPaymentsByRental, createPayment, updatePaymentStatus, deletePayment } from '../../lib/payments';
import { showToast } from '../ToastManager';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Tooltip,
    useDisclosure,
    Form,
    Input,
    Select,
    SelectItem,
    Textarea
} from "@heroui/react";

const statusColorMap = {
    paid: "success",
    pending: "warning",
    overdue: "danger",
};

export default function PaymentManager({ rental, isOpen, onClose }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
    const [formData, setFormData] = useState({
        amount: '',
        due_date: '',
        payment_method: '',
        notes: ''
    });

    useEffect(() => {
        if (isOpen && rental) {
            loadPayments();
        }
    }, [isOpen, rental]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const data = await getPaymentsByRental(rental.id);
            setPayments(data || []);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createPayment({
                rental_id: rental.id,
                amount: parseFloat(formData.amount),
                due_date: formData.due_date,
                payment_method: formData.payment_method || null,
                notes: formData.notes || null,
                status: 'pending'
            });

            showToast({
                title: 'Pago creado',
                description: 'El pago se ha registrado correctamente',
                color: 'success'
            });

            setFormData({ amount: '', due_date: '', payment_method: '', notes: '' });
            onFormClose();
            loadPayments();
        } catch (error) {
            console.error('Error creating payment:', error);
            showToast({
                title: 'Error al crear pago',
                description: error.message,
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updatePaymentStatus(id, newStatus);
            showToast({
                title: 'Estado actualizado',
                color: 'success'
            });
            loadPayments();
        } catch (error) {
            console.error('Error updating status:', error);
            showToast({
                title: 'Error al actualizar',
                description: error.message,
                color: 'danger'
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este pago?')) return;

        try {
            await deletePayment(id);
            showToast({
                title: 'Pago eliminado',
                color: 'success'
            });
            loadPayments();
        } catch (error) {
            console.error('Error deleting payment:', error);
            showToast({
                title: 'Error al eliminar',
                description: error.message,
                color: 'danger'
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-AR');
    };

    const columns = [
        { name: "VENCIMIENTO", uid: "due_date" },
        { name: "MONTO", uid: "amount" },
        { name: "ESTADO", uid: "status" },
        { name: "FECHA PAGO", uid: "payment_date" },
        { name: "ACCIONES", uid: "actions" },
    ];

    const renderCell = (payment, columnKey) => {
        switch (columnKey) {
            case "due_date":
                return <span className="text-sm">{formatDate(payment.due_date)}</span>;
            case "amount":
                return <span className="text-sm font-semibold">${payment.amount?.toLocaleString()}</span>;
            case "status":
                return (
                    <Chip color={statusColorMap[payment.status]} size="sm" variant="flat">
                        {payment.status === 'paid' ? 'Pagado' : payment.status === 'pending' ? 'Pendiente' : 'Vencido'}
                    </Chip>
                );
            case "payment_date":
                return <span className="text-sm">{formatDate(payment.payment_date)}</span>;
            case "actions":
                return (
                    <div className="flex gap-2">
                        {payment.status !== 'paid' && (
                            <Tooltip content="Marcar como pagado">
                                <Button
                                    size="sm"
                                    color="success"
                                    variant="flat"
                                    onPress={() => handleStatusChange(payment.id, 'paid')}
                                >
                                    ✓
                                </Button>
                            </Tooltip>
                        )}
                        <Tooltip content="Eliminar" color="danger">
                            <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                onPress={() => handleDelete(payment.id)}
                            >
                                ✕
                            </Button>
                        </Tooltip>
                    </div>
                );
            default:
                return payment[columnKey];
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <div>
                                    <h3 className="text-xl font-bold">Gestión de Pagos</h3>
                                    <p className="text-sm text-gray-600 font-normal">
                                        {rental?.tenant_name} - {rental?.properties?.title}
                                    </p>
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <Button color="primary" onPress={onFormOpen} className="w-full">
                                        + Registrar Nuevo Pago
                                    </Button>

                                    {loading ? (
                                        <div className="text-center py-8">Cargando...</div>
                                    ) : payments.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No hay pagos registrados
                                        </div>
                                    ) : (
                                        <Table aria-label="Tabla de pagos">
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
                                    )}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" variant="light" onPress={onClose}>
                                    Cerrar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Payment Form Modal */}
            <Modal isOpen={isFormOpen} onClose={onFormClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Registrar Pago</ModalHeader>
                            <ModalBody>
                                <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <Input
                                        type="number"
                                        label="Monto"
                                        placeholder="50000"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        isRequired
                                        startContent={<span className="text-gray-500">$</span>}
                                    />

                                    <Input
                                        type="date"
                                        label="Fecha de Vencimiento"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        isRequired
                                    />

                                    <Select
                                        label="Método de Pago (Opcional)"
                                        placeholder="Seleccionar método"
                                        selectedKeys={formData.payment_method ? [formData.payment_method] : []}
                                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                    >
                                        <SelectItem key="cash">Efectivo</SelectItem>
                                        <SelectItem key="transfer">Transferencia</SelectItem>
                                        <SelectItem key="mercadopago">Mercado Pago</SelectItem>
                                        <SelectItem key="other">Otro</SelectItem>
                                    </Select>

                                    <Textarea
                                        label="Notas (Opcional)"
                                        placeholder="Información adicional..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        minRows={2}
                                    />

                                    <div className="flex gap-2 justify-end mt-4">
                                        <Button color="default" variant="light" onPress={onClose}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit" color="primary" isLoading={loading}>
                                            Guardar
                                        </Button>
                                    </div>
                                </Form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
