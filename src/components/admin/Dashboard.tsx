import React, { useEffect, useState, useMemo } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User,
    Chip,
    Tooltip,
    Button,
    Input,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Card,
    CardBody,
    HeroUIProvider,
    Pagination,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Badge,
} from "@heroui/react";
import { supabase } from "../../lib/supabase";

const statusColorMap = {
    available: "success",
    reserved: "warning",
    sold: "danger",
};

const statusOptions = [
    { name: "Disponible", uid: "available" },
    { name: "Reservado", uid: "reserved" },
    { name: "Vendido", uid: "sold" },
];

const columns = [
    { name: "PROPIEDAD", uid: "title" },
    { name: "PRECIO", uid: "price" },
    { name: "ESTADO", uid: "status" },
    { name: "ACCIONES", uid: "actions" },
];

export default function Dashboard({ alertsOnly = false }: { alertsOnly?: boolean }) {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterValue, setFilterValue] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        loadProperties();
    }, []);

    async function loadProperties() {
        setLoading(true);
        const { data, error } = await supabase
            .from("properties")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error loading properties:", error);
        } else {
            setProperties(data || []);
        }
        setLoading(false);
    }

    const handleStatusChange = async (id, newStatus) => {
        // Optimistic update
        setProperties((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );

        const { error } = await supabase
            .from("properties")
            .update({ status: newStatus })
            .eq("id", id);

        if (error) {
            console.error("Error updating status:", error);
            alert("Error al actualizar el estado");
            loadProperties(); // Revert on error
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) return;

        const { error } = await supabase.from("properties").delete().eq("id", id);

        if (error) {
            alert("Error al eliminar: " + error.message);
        } else {
            setProperties((prev) => prev.filter((p) => p.id !== id));
        }
    };

    // Stats
    const stats = useMemo(() => {
        return {
            total: properties.length,
            available: properties.filter((p) => p.status === "available" || !p.status).length,
            reserved: properties.filter((p) => p.status === "reserved").length,
            sold: properties.filter((p) => p.status === "sold").length,
        };
    }, [properties]);

    // Filter and Pagination
    const filteredItems = useMemo(() => {
        let filtered = [...properties];

        if (filterValue) {
            filtered = filtered.filter((item) =>
                item.title.toLowerCase().includes(filterValue.toLowerCase()) ||
                item.city?.toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        return filtered;
    }, [properties, filterValue]);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems]);

    const renderCell = React.useCallback((property, columnKey) => {
        const cellValue = property[columnKey];

        switch (columnKey) {
            case "title":
                return (
                    <User
                        avatarProps={{ radius: "lg", src: property.image_url || "/images/placeholder-property.webp" }}
                        description={property.city}
                        name={cellValue}
                    >
                        {property.city}
                    </User>
                );
            case "price":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize">
                            {property.currency} {property.price?.toLocaleString()}
                        </p>
                        <p className="text-bold text-xs capitalize text-default-400">
                            {property.operation}
                        </p>
                    </div>
                );
            case "status":
                return (
                    <Dropdown>
                        <DropdownTrigger>
                            <Chip
                                className="capitalize cursor-pointer"
                                color={statusColorMap[property.status] || "default"}
                                size="sm"
                                variant="flat"
                            >
                                {statusOptions.find(o => o.uid === property.status)?.name || "Desconocido"}
                            </Chip>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Cambiar estado"
                            onAction={(key) => handleStatusChange(property.id, key)}
                        >
                            {statusOptions.map((status) => (
                                <DropdownItem key={status.uid} color={statusColorMap[status.uid]}>
                                    {status.name}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Editar">
                            <a href={`/admin/properties/${property.id}`} className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                <EditIcon />
                            </a>
                        </Tooltip>
                        <Tooltip color="danger" content="Eliminar">
                            <span
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                onClick={() => handleDelete(property.id)}
                            >
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue;
        }
    }, []);

    // If alertsOnly, just render the alerts component
    if (alertsOnly) {
        return (
            <HeroUIProvider>
                <RentalAlerts />
            </HeroUIProvider>
        );
    }

    return (
        <HeroUIProvider>
            <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4 sm:space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard title="Total Propiedades" value={stats.total} color="primary" />
                    <StatsCard title="Disponibles" value={stats.available} color="success" />
                    <StatsCard title="Reservadas" value={stats.reserved} color="warning" />
                    <StatsCard title="Vendidas" value={stats.sold} color="danger" />
                </div>



                {/* Search and Table */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-3 items-stretch sm:items-end">
                        <Input
                            isClearable
                            className="w-full sm:max-w-[44%]"
                            placeholder="Buscar por nombre o ciudad..."
                            startContent={<SearchIcon />}
                            value={filterValue}
                            onValueChange={setFilterValue}
                        />
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button color="secondary" as="a" href="/admin/rentals" className="w-full sm:w-auto">
                                <span className="hidden sm:inline">Gestionar Alquileres</span>
                                <span className="sm:hidden">Alquileres</span>
                            </Button>
                            <Button color="primary" as="a" href="/admin/properties/new" endContent={<PlusIcon />} className="w-full sm:w-auto">
                                <span className="hidden sm:inline">Nueva Propiedad</span>
                                <span className="sm:hidden">Nueva</span>
                            </Button>
                        </div>
                    </div>

                    <Table
                        aria-label="Tabla de propiedades"
                        bottomContent={
                            <div className="flex w-full justify-center">
                                <Pagination
                                    isCompact
                                    showControls
                                    showShadow
                                    color="primary"
                                    page={page}
                                    total={Math.ceil(filteredItems.length / rowsPerPage)}
                                    onChange={(page) => setPage(page)}
                                />
                            </div>
                        }
                        classNames={{
                            wrapper: "min-h-[222px]",
                        }}
                    >
                        <TableHeader columns={columns}>
                            {(column) => (
                                <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                                    {column.name}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody items={items} emptyContent={"No se encontraron propiedades"}>
                            {(item) => (
                                <TableRow key={item.id}>
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </HeroUIProvider>
    );
}

const StatsCard = ({ title, value, color }) => (
    <Card className="w-full">
        <CardBody className="flex flex-row items-center justify-between p-4">
            <div>
                <p className="text-xs sm:text-sm text-default-500 font-medium uppercase">{title}</p>
                <h4 className={`text-xl sm:text-2xl font-bold text-${color}`}>{value}</h4>
            </div>
        </CardBody>
    </Card>
);

// Icons
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

const SearchIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M22 22L20 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const PlusIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M6 12h12" />
            <path d="M12 18V6" />
        </g>
    </svg>
);

const RentalAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        const { getActiveRentals } = await import("../../lib/rentals");
        const rentals = await getActiveRentals();

        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const upcoming = rentals.filter((r: any) => {
            const endDate = new Date(r.end_date);
            return endDate >= today && endDate <= nextWeek;
        });

        setAlerts(upcoming as any);
    };

    const hasAlerts = alerts.length > 0;

    return (
        <>
            <Tooltip content="Alertas de Alquileres">
                <Badge
                    content={alerts.length}
                    color="danger"
                    isInvisible={!hasAlerts}
                    shape="circle"
                >
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={() => setIsOpen(true)}
                        className={hasAlerts ? "text-warning-600" : "text-default-400"}
                    >
                        <BellIcon className={hasAlerts ? "animate-pulse" : ""} />
                    </Button>
                </Badge>
            </Tooltip>

            <Modal
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                size="2xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                Alertas de Alquileres ({alerts.length})
                            </ModalHeader>
                            <ModalBody>
                                {hasAlerts ? (
                                    <div className="flex flex-col gap-3">
                                        {alerts.map((alert: any) => (
                                            <Card key={alert.id} className="border border-warning-200">
                                                <CardBody className="p-4">
                                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-base text-gray-800">{alert.properties?.title}</p>
                                                            <p className="text-sm text-gray-600 mt-1">Inquilino: {alert.tenant_name}</p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Chip size="sm" color="warning" variant="flat">
                                                                    Finaliza: {new Date(alert.end_date).toLocaleDateString()}
                                                                </Chip>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            color="warning"
                                                            variant="flat"
                                                            as="a"
                                                            href={`/admin/rentals/${alert.id}`}
                                                            className="w-full sm:w-auto"
                                                        >
                                                            Ver Detalles
                                                        </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>No hay alertas de alquileres próximos a vencer</p>
                                    </div>
                                )}
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
        </>
    );
};

const BellIcon = ({ className = "" }: { className?: string }) => (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);
