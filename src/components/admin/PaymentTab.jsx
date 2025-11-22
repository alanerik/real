import { useState, useEffect } from 'react';
import { getPaymentsByRental, createPayment, updatePaymentStatus, deletePayment } from '../../lib/payments';
import { showToast } from '../ToastManager';
import {
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Tooltip,
    Input,
    Select,
    SelectItem,
    Textarea,
    Card,
    CardBody
} from "@heroui/react";

const statusColorMap = {
    paid: "success",
    pending: "warning",
    overdue: "danger",
};

export default function PaymentTab({ rentalId }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        due_date: '',
        payment_method: '',
        notes: ''
    });

    useEffect(() => {
        if (rentalId) {
            loadPayments();
        }
    }, [rentalId]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const data = await getPaymentsByRental(rentalId);
            setPayments(data || []);
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createPayment({
                rental_id: rentalId,
                amount: parseFloat(formData.amount),
                due_date: formData.due_date,
                payment_method: formData.payment_method || null,
                notes: formData.notes || null,
                status: 'pending'
            });

            showToast({
                title: 'Pago creado',
                color: 'success'
            });

            setFormData({ amount: '', due_date: '', payment_method: '', notes: '' });
            setShowForm(false);
            loadPayments();
        } catch (error) {
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
            showToast({ title: 'Estado actualizado', color: 'success' });
            loadPayments();
        } catch (error) {
            showToast({ title: 'Error', description: error.message, color: 'danger' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este pago?')) return;
        try {
            await deletePayment(id);
            showToast({ title: 'Pago eliminado', color: 'success' });
            loadPayments();
        } catch (error) {
            showToast({ title: 'Error', description: error.message, color: 'danger' });
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
                    <div className="relative flex items-center gap-2">
                        {payment.status !== 'paid' && (
                            <Tooltip content="Marcar como pagado">
                                <span
                                    className="text-lg text-success cursor-pointer active:opacity-50"
                                    onClick={() => handleStatusChange(payment.id, 'paid')}
                                >
                                    <CheckIcon />
                                </span>
                            </Tooltip>
                        )}
                        <Tooltip color="danger" content="Eliminar">
                            <span
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                onClick={() => handleDelete(payment.id)}
                            >
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return payment[columnKey];
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gestión de Pagos</h3>
                <Button color="primary" onPress={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancelar' : '+ Nuevo Pago'}
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardBody>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                                placeholder="Seleccionar"
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

                            <Button type="submit" color="primary" isLoading={loading}>
                                Guardar Pago
                            </Button>
                        </form>
                    </CardBody>
                </Card>
            )}

            {loading && !showForm ? (
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
    );
}

const DeleteIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M7.08331 4.14169L7.26665 3.05002C7.4 2.24169 7.5 1.64169 8.94165 1.64169H11.0583C12.5 1.64169 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M15.7084 9.16669L15.1667 17.5667C15.0834 18.875 15 19.1667 12.675 19.1667H7.32502C5.00002 19.1667 4.91669 18.875 4.83335 17.5667L4.29169 9.16669" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M8.60834 13.75H11.3833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M7.91669 10.4167H12.0834" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const CheckIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
    </svg>
);
