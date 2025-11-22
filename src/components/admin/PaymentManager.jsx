import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Select, SelectItem, Chip, Tooltip, DatePicker } from "@heroui/react";
import { getPayments, createPayment, updatePayment, deletePayment } from '../../lib/rentals';
import { parseDate } from "@internationalized/date";

export default function PaymentManager({ rentalId }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [newPayment, setNewPayment] = useState({
        amount: '',
        date: parseDate(new Date().toISOString().split('T')[0]),
        type: 'Efectivo',
        notes: ''
    });

    useEffect(() => {
        if (rentalId) {
            loadPayments();
        }
    }, [rentalId]);

    const loadPayments = async () => {
        setLoading(true);
        const data = await getPayments(rentalId);
        setPayments(data);
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPayment(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date) => {
        setNewPayment(prev => ({ ...prev, date: date }));
    };

    const handleSelectChange = (e) => {
        setNewPayment(prev => ({ ...prev, type: e.target.value }));
    };

    const handleSubmit = async () => {
        if (!newPayment.amount || !newPayment.date) return;

        try {
            const paymentData = {
                rental_id: rentalId,
                ...newPayment,
                date: newPayment.date.toString(),
                amount: parseFloat(newPayment.amount)
            };

            if (editingId) {
                await updatePayment(editingId, paymentData);
                setEditingId(null);
            } else {
                await createPayment(paymentData);
            }

            setNewPayment({
                amount: '',
                date: parseDate(new Date().toISOString().split('T')[0]),
                type: 'Efectivo',
                notes: ''
            });
            loadPayments();
        } catch (error) {
            console.error("Error saving payment:", error);
            alert("Error al guardar el pago");
        }
    };

    const handleEdit = (payment) => {
        setEditingId(payment.id);
        setNewPayment({
            amount: payment.amount.toString(),
            date: parseDate(payment.date),
            type: payment.type,
            notes: payment.notes || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewPayment({
            amount: '',
            date: parseDate(new Date().toISOString().split('T')[0]),
            type: 'Efectivo',
            notes: ''
        });
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar este pago?')) {
            await deletePayment(id);
            loadPayments();
        }
    };

    const columns = [
        { name: "FECHA", uid: "date" },
        { name: "MONTO", uid: "amount" },
        { name: "TIPO", uid: "type" },
        { name: "NOTAS", uid: "notes" },
        { name: "ACCIONES", uid: "actions" },
    ];

    const renderCell = (payment, columnKey) => {
        switch (columnKey) {
            case "amount":
                return `$${payment.amount}`;
            case "actions":
                return (
                    <div className="relative flex items-center gap-2 justify-center">
                        <Tooltip content="Editar">
                            <span
                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                onClick={() => handleEdit(payment)}
                            >
                                <EditIcon />
                            </span>
                        </Tooltip>
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
        <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                        {editingId ? 'Editar Pago' : 'Registrar Nuevo Pago'}
                    </h3>
                    {editingId && (
                        <Button size="sm" color="danger" variant="light" onPress={handleCancelEdit}>
                            Cancelar Edición
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <DatePicker
                        label="Fecha"
                        value={newPayment.date}
                        onChange={handleDateChange}
                        isRequired
                    />
                    <Input
                        type="number"
                        label="Monto"
                        name="amount"
                        placeholder="0.00"
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <span className="text-default-400 text-small">$</span>
                            </div>
                        }
                        value={newPayment.amount}
                        onChange={handleInputChange}
                        isRequired
                    />
                    <Select
                        label="Tipo de Pago"
                        selectedKeys={[newPayment.type]}
                        onChange={handleSelectChange}
                    >
                        <SelectItem key="Efectivo" value="Efectivo">Efectivo</SelectItem>
                        <SelectItem key="Transferencia" value="Transferencia">Transferencia</SelectItem>
                        <SelectItem key="Depósito" value="Depósito">Depósito</SelectItem>
                        <SelectItem key="Otro" value="Otro">Otro</SelectItem>
                    </Select>
                    <Input
                        type="text"
                        label="Notas"
                        name="notes"
                        value={newPayment.notes}
                        onChange={handleInputChange}
                    />
                    <Button color="primary" onPress={handleSubmit}>
                        {editingId ? 'Actualizar' : 'Agregar Pago'}
                    </Button>
                </div>
            </div>

            <Table aria-label="Tabla de pagos">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={payments} emptyContent={"No hay pagos registrados."}>
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

const EditIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d="M2.5 18.3333H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
    </svg>
);

const DeleteIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M7.08331 4.14169L7.26665 3.05002C7.4 2.24169 7.5 1.64169 8.94165 1.64169H11.0583C12.5 1.64169 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M15.7084 9.16669L15.1667 17.5667C15.0834 18.875 15 19.1667 12.675 19.1667H7.32502C5.00002 19.1667 4.91669 18.875 4.83335 17.5667L4.29169 9.16669" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M8.60834 13.75H11.3833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M7.91669 10.4167H12.0834" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);
