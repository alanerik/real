import { useState, useEffect } from 'react';
import { getPaymentsByRental } from '../../lib/payments';
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
    CardBody
} from "@heroui/react";

const columns = [
    { name: "FECHA VENCIMIENTO", uid: "due_date" },
    { name: "MONTO", uid: "amount" },
    { name: "ESTADO", uid: "status" },
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

    useEffect(() => {
        loadPayments();
    }, [rentalId]);

    const loadPayments = async () => {
        try {
            const data = await getPaymentsByRental(rentalId);
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
        </div>
    );
}
