import { useState, useEffect } from 'react';
import { getMaintenanceTickets, updateMaintenanceTicketStatus, deleteMaintenanceTicket } from '../../../lib/maintenance';
import { showToast } from '../../ToastManager';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Tooltip,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@heroui/react";

const columns = [
    { name: "PROPIEDAD", uid: "property" },
    { name: "PROBLEMA", uid: "title" },
    { name: "PRIORIDAD", uid: "priority" },
    { name: "ESTADO", uid: "status" },
    { name: "COSTO", uid: "cost" },
    { name: "ACCIONES", uid: "actions" },
];

const statusColorMap = {
    pending: "warning",
    in_progress: "primary",
    resolved: "success",
};

const priorityColorMap = {
    high: "danger",
    medium: "warning",
    low: "success",
};

const statusOptions = [
    { name: "Pendiente", uid: "pending" },
    { name: "En Progreso", uid: "in_progress" },
    { name: "Resuelto", uid: "resolved" },
];

export default function MaintenanceTicketList({ refreshTrigger }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTickets();
    }, [refreshTrigger]);

    const loadTickets = async () => {
        try {
            const data = await getMaintenanceTickets();
            setTickets(data || []);
        } catch (error) {
            console.error('Error loading tickets:', error);
            showToast({
                title: 'Error al cargar tickets',
                description: error.message,
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        // Optimistic update
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

        try {
            await updateMaintenanceTicketStatus(id, newStatus);
            showToast({
                title: 'Estado actualizado',
                color: 'success'
            });
        } catch (error) {
            console.error('Error updating status:', error);
            showToast({
                title: 'Error al actualizar',
                description: error.message,
                color: 'danger'
            });
            loadTickets(); // Revert on error
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este ticket?')) return;

        try {
            await deleteMaintenanceTicket(id);
            showToast({
                title: 'Ticket eliminado',
                color: 'success'
            });
            loadTickets();
        } catch (error) {
            console.error('Error deleting ticket:', error);
            showToast({
                title: 'Error al eliminar',
                description: error.message,
                color: 'danger'
            });
        }
    };

    const renderCell = (ticket, columnKey) => {
        const cellValue = ticket[columnKey];

        switch (columnKey) {
            case "property":
                return (
                    <div>
                        <p className="text-bold text-sm capitalize">{ticket.properties?.title || 'Propiedad eliminada'}</p>
                        <p className="text-bold text-xs capitalize text-default-400">{ticket.properties?.city}</p>
                    </div>
                );
            case "title":
                return (
                    <div>
                        <p className="text-bold text-sm capitalize">{ticket.title}</p>
                        <p className="text-bold text-xs text-default-400 truncate max-w-xs">{ticket.description}</p>
                    </div>
                );
            case "priority":
                return (
                    <Chip className="capitalize" color={priorityColorMap[ticket.priority]} size="sm" variant="flat">
                        {ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Media' : 'Baja'}
                    </Chip>
                );
            case "status":
                return (
                    <Dropdown>
                        <DropdownTrigger>
                            <Chip
                                className="capitalize cursor-pointer"
                                color={statusColorMap[ticket.status]}
                                size="sm"
                                variant="flat"
                            >
                                {statusOptions.find(o => o.uid === ticket.status)?.name}
                            </Chip>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Cambiar estado"
                            onAction={(key) => handleStatusChange(ticket.id, key)}
                        >
                            {statusOptions.map((status) => (
                                <DropdownItem key={status.uid} color={statusColorMap[status.uid]}>
                                    {status.name}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                );
            case "cost":
                return (
                    <div className="text-sm text-default-500">
                        ${ticket.cost}
                    </div>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip color="danger" content="Eliminar">
                            <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(ticket.id)}>
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    };

    if (loading) return <div className="text-center py-4">Cargando tickets...</div>;

    return (
        <Table aria-label="Tabla de tickets de mantenimiento">
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody items={tickets} emptyContent={"No hay tickets registrados."}>
                {(item) => (
                    <TableRow key={item.id}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
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
