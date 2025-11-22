import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Chip, Tabs, Tab, Tooltip } from "@heroui/react";
import { getRentals, deleteRental } from '../../lib/rentals';
import { sendTenantInvitation } from '../../lib/auth-tenant';
import RentalCalendar from './RentalCalendar';
import PaymentManager from './PaymentManager';

export default function Rentals() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRental, setSelectedRental] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        loadRentals();
    }, []);

    const loadRentals = async () => {
        setLoading(true);
        const data = await getRentals();
        setRentals(data);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar este alquiler?')) {
            await deleteRental(id);
            loadRentals();
        }
    };

    const handleInvite = async (rental) => {
        if (!rental.tenant_email) {
            alert('Este alquiler no tiene un email de inquilino configurado.');
            return;
        }

        if (!confirm(`¿Enviar invitación por email a ${rental.tenant_email}?`)) {
            return;
        }

        try {
            await sendTenantInvitation(rental.id, rental.tenant_email, rental.properties?.title);
            alert(`Invitación enviada correctamente a ${rental.tenant_email}`);
        } catch (error) {
            console.error('Error sending invite:', error);

            // Fallback to clipboard if email fails
            const inviteUrl = `${window.location.origin}/tenant/accept-invitation?email=${encodeURIComponent(rental.tenant_email)}`;
            alert(`Error al enviar email. Puedes copiar el link manual:\n\n${inviteUrl}`);
        }
    };

    const columns = [
        { name: "PROPIEDAD", uid: "property" },
        { name: "INQUILINO", uid: "tenant" },
        { name: "FECHAS", uid: "dates" },
        { name: "ESTADO", uid: "status" },
        { name: "ACCIONES", uid: "actions" },
    ];

    const renderCell = (rental, columnKey) => {
        switch (columnKey) {
            case "property":
                return (
                    <div>
                        <p className="font-bold">{rental.properties?.title}</p>
                        <p className="text-tiny text-gray-500">{rental.properties?.slug}</p>
                    </div>
                );
            case "tenant":
                return (
                    <div>
                        <p className="font-bold">{rental.tenant_name}</p>
                        <p className="text-tiny text-gray-500">{rental.tenant_contact}</p>
                    </div>
                );
            case "dates":
                return (
                    <div className="flex flex-col">
                        <span className="text-small">{rental.start_date}</span>
                        <span className="text-tiny text-gray-500">hasta</span>
                        <span className="text-small">{rental.end_date}</span>
                    </div>
                );
            case "status":
                const statusMap = {
                    active: "Activo",
                    pending: "Pendiente",
                    completed: "Completado",
                    cancelled: "Cancelado"
                };
                return (
                    <Chip
                        color={rental.status === 'active' ? 'success' : rental.status === 'pending' ? 'warning' : 'default'}
                        size="sm"
                        variant="flat"
                    >
                        {statusMap[rental.status] || rental.status}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        {!rental.tenant_user_id && rental.tenant_email && (
                            <Tooltip content="Invitar Inquilino">
                                <span
                                    className="text-lg text-primary cursor-pointer active:opacity-50"
                                    onClick={() => handleInvite(rental)}
                                >
                                    <InviteIcon />
                                </span>
                            </Tooltip>
                        )}
                        <Tooltip content="Pagos">
                            <span
                                className="text-lg text-success cursor-pointer active:opacity-50"
                                onClick={() => {
                                    setSelectedRental(rental);
                                    setIsPaymentModalOpen(true);
                                }}
                            >
                                <MoneyIcon />
                            </span>
                        </Tooltip>
                        <Tooltip content="Editar">
                            <a href={`/admin/rentals/${rental.id}`} className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <EditIcon />
                            </a>
                        </Tooltip>
                        <Tooltip color="danger" content="Eliminar">
                            <span
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                onClick={() => handleDelete(rental.id)}
                            >
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return rental[columnKey];
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Gestión de Alquileres</h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button
                        color="default"
                        variant="light"
                        onPress={() => window.location.href = '/admin/dashboard'}
                        className="w-full sm:w-auto"
                    >
                        <span className="hidden sm:inline">Volver al Dashboard</span>
                        <span className="sm:hidden">Dashboard</span>
                    </Button>
                    <Button
                        color="primary"
                        onPress={() => window.location.href = '/admin/rentals/new'}
                        className="w-full sm:w-auto"
                    >
                        Nuevo Alquiler
                    </Button>
                </div>
            </div>

            <Tabs aria-label="Vistas de Alquileres">
                <Tab key="list" title="Lista">
                    <Table aria-label="Tabla de alquileres">
                        <TableHeader columns={columns}>
                            {(column) => (
                                <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                                    {column.name}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody items={rentals} emptyContent={"No hay alquileres registrados."}>
                            {(item) => (
                                <TableRow key={item.id}>
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Tab>
                <Tab key="calendar" title="Calendario">
                    <RentalCalendar rentals={rentals} />
                </Tab>
            </Tabs>

            {/* Payment Manager Modal */}
            <PaymentManager
                rental={selectedRental}
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedRental(null);
                }}
            />
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

const MoneyIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="currentColor" />
    </svg>
);

const InviteIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor" />
    </svg>
);
