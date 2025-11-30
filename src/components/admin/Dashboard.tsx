import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
import { showToast } from "../ToastManager";
import StatsCard from "./StatsCard";
import NavigationItems from "./NavigationItems";
import Sidebar from "./Sidebar";
import UserMenu from "./UserMenu";
import ProfileModal from "./ProfileModal";
import SettingsModal from "./SettingsModal";
import { STATUS_COLOR_MAP, STATUS_OPTIONS, COLUMNS } from "../../constants/property";
import type { Property, User as UserType, RentalAlert, StatsData } from "../../types/dashboard";

interface DashboardProps {
    alertsOnly?: boolean;
}

export default function Dashboard({ alertsOnly = false }: DashboardProps) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterValue, setFilterValue] = useState("");
    const [page, setPage] = useState(1);
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const isMounted = useRef(true);
    const rowsPerPage = 10;

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Check user authentication
    const checkUser = useCallback(async (): Promise<void> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!isMounted.current) return;

            if (!user) {
                // Redirect to login if not authenticated
                window.location.href = "/admin/login";
                return;
            }

            setCurrentUser(user);
        } catch (error) {
            console.error("Error checking user:", error);
            if (isMounted.current) {
                showToast({
                    title: "Error al verificar autenticación",
                    color: "danger"
                });
            }
        } finally {
            if (isMounted.current) {
                setIsCheckingAuth(false);
            }
        }
    }, []);

    // Load properties with error handling
    const loadProperties = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("properties")
                .select("*")
                .order("created_at", { ascending: false });

            if (!isMounted.current) return;

            if (error) {
                console.error("Error loading properties:", error);
                showToast({
                    title: "Error al cargar propiedades",
                    color: "danger"
                });
                setProperties([]);
            } else {
                setProperties(data || []);
            }
        } catch (error) {
            console.error("Unexpected error loading properties:", error);
            if (isMounted.current) {
                showToast({
                    title: "Error inesperado al cargar propiedades",
                    color: "danger"
                });
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, []);

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem("userSettings");
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.darkMode) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
    }, []);

    // Initialize data
    useEffect(() => {
        checkUser();
        loadProperties();
    }, [checkUser, loadProperties]);

    // Reset page when filter changes
    useEffect(() => {
        setPage(1);
    }, [filterValue]);

    // Handle status change with optimistic update
    const handleStatusChange = useCallback(async (id: number, newStatus: string): Promise<void> => {
        // Store old state for rollback
        const previousProperties = [...properties];

        // Optimistic update
        setProperties((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: newStatus as any } : p))
        );

        try {
            const { error } = await supabase
                .from("properties")
                .update({ status: newStatus })
                .eq("id", id);

            if (error) throw error;

            if (isMounted.current) {
                showToast({
                    title: "Estado actualizado correctamente",
                    color: "success"
                });
            }
        } catch (error) {
            console.error("Error updating status:", error);

            if (isMounted.current) {
                // Rollback to previous state
                setProperties(previousProperties);
                showToast({
                    title: "Error al actualizar el estado",
                    color: "danger"
                });
            }
        }
    }, [properties]);

    // Handle delete with confirmation
    const handleDelete = useCallback(async (id: number): Promise<void> => {
        if (!confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) return;

        try {
            const { error } = await supabase.from("properties").delete().eq("id", id);

            if (error) throw error;

            if (isMounted.current) {
                setProperties((prev) => prev.filter((p) => p.id !== id));
                showToast({
                    title: "Propiedad eliminada correctamente",
                    color: "success"
                });
            }
        } catch (error: any) {
            console.error("Error deleting property:", error);
            if (isMounted.current) {
                showToast({
                    title: "Error al eliminar",
                    description: error.message || 'Error desconocido',
                    color: "danger"
                });
            }
        }
    }, []);

    // Handle logout
    const handleLogout = useCallback(async (): Promise<void> => {
        await supabase.auth.signOut();
        window.location.href = "/admin/login";
    }, []);

    // Calculate stats
    const stats: StatsData = useMemo(() => ({
        total: properties.length,
        available: properties.filter((p) => p.status === "available" || !p.status).length,
        reserved: properties.filter((p) => p.status === "reserved").length,
        sold: properties.filter((p) => p.status === "sold").length,
    }), [properties]);

    // Filter items
    const filteredItems = useMemo(() => {
        let filtered = [...properties];

        filtered = filtered.filter((item) =>
            item.title.toLowerCase().includes(filterValue.toLowerCase()) ||
            item.city?.toLowerCase().includes(filterValue.toLowerCase())
        );

        return filtered;
    }, [properties, filterValue]);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    // Navigation handlers
    const handlePropertyClick = useCallback((id: number) => {
        window.location.href = `/admin/properties/${id}`;
    }, []);

    const handleEdit = useCallback((property: Property) => {
        window.location.href = `/admin/properties/${property.id}`;
    }, []);

    const renderCell = useCallback((property: Property, columnKey: string): React.ReactNode => {
        const cellValue = property[columnKey as keyof Property];

        switch (columnKey) {
            case "title":
                return (
                    <User
                        avatarProps={{ radius: "lg", src: property.image_url || "/images/placeholder-property.webp" }}
                        description={property.city}
                        name={property.title}
                    >
                        {property.city}
                    </User>
                );
            case "price":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize text-default-900">
                            {property.currency} {property.price?.toLocaleString()}
                        </p>
                        <p className="text-bold text-xs capitalize text-default-400">{property.operation}</p>
                    </div>
                );
            case "status":
                return (
                    <Dropdown>
                        <DropdownTrigger>
                            <Chip
                                className="capitalize cursor-pointer transition-transform hover:scale-105"
                                color={STATUS_COLOR_MAP[property.status] || "default"}
                                size="sm"
                                variant="flat"
                            >
                                {STATUS_OPTIONS.find(o => o.uid === property.status)?.name || property.status}
                            </Chip>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Cambiar estado"
                            onAction={(key) => handleStatusChange(property.id, key as string)}
                        >
                            {STATUS_OPTIONS.map((status) => (
                                <DropdownItem key={status.uid} color={STATUS_COLOR_MAP[status.uid]}>
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
                            <a
                                href={`/admin/properties/${property.id}`}
                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                aria-label={`Editar propiedad ${property.title}`}
                            >
                                <EditIcon />
                            </a>
                        </Tooltip>
                        <Tooltip content="Eliminar">
                            <span
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                onClick={() => handleDelete(property.id)}
                                role="button"
                                tabIndex={0}
                                aria-label={`Eliminar propiedad ${property.title}`}
                                onKeyDown={(e) => e.key === 'Enter' && handleDelete(property.id)}
                            >
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue as React.ReactNode;
        }
    }, [handleStatusChange, handleDelete]);

    // Show loading while checking authentication
    if (isCheckingAuth) {
        return (
            <HeroUIProvider>
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-lg text-default-500">Verificando autenticación...</p>
                </div>
            </HeroUIProvider>
        );
    }

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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-0 flex transition-colors duration-200">
                <Sidebar
                    isExpanded={isSidebarExpanded}
                    onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    handleLogout={handleLogout}
                />

                <div className="flex-1 flex flex-col min-w-0">
                    <div className="w-full p-4 sm:p-6 flex flex-col gap-6">

                        {/* Header */}
                        <div className="flex flex-row justify-between items-center w-full">
                            {/* Desktop Left: Welcome */}
                            <div className="hidden sm:block text-left">
                                <h1 className="text-xl font-bold">
                                    Bienvenido, <span className="text-primary">{currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || "Usuario"}</span>
                                </h1>
                            </div>

                            {/* Mobile Left: Welcome */}
                            <div className="sm:hidden">
                                <h1 className="text-xl font-bold">
                                    Bienvenido, <span className="text-primary">{currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || "Usuario"}</span>
                                </h1>
                            </div>

                            {/* Mobile Right: Alerts */}
                            <div className="sm:hidden">
                                <RentalAlerts />
                            </div>

                            {/* Desktop Right: Alerts + Search + User Menu */}
                            <div className="hidden sm:flex items-center justify-end gap-4 flex-1 max-w-xl">
                                <Input
                                    isClearable
                                    className="w-full"
                                    placeholder="Buscar por nombre o ciudad..."
                                    startContent={<SearchIcon />}
                                    value={filterValue}
                                    onValueChange={setFilterValue}
                                    aria-label="Buscar propiedades"
                                />
                                <RentalAlerts />
                                <UserMenu
                                    currentUser={currentUser}
                                    onOpenProfile={() => setIsProfileModalOpen(true)}
                                    onOpenSettings={() => setIsSettingsModalOpen(true)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 w-full">

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatsCard title="Total Propiedades" value={stats.total} color="primary" />
                                <StatsCard title="Disponibles" value={stats.available} color="success" />
                                <StatsCard title="Reservadas" value={stats.reserved} color="warning" />
                                <StatsCard title="Vendidas" value={stats.sold} color="danger" />
                            </div>

                            {/* Mobile Search (Below Stats) */}
                            <div className="sm:hidden w-full">
                                <Input
                                    isClearable
                                    className="w-full"
                                    placeholder="Buscar por nombre o ciudad..."
                                    startContent={<SearchIcon />}
                                    value={filterValue}
                                    onValueChange={setFilterValue}
                                    aria-label="Buscar propiedades"
                                />
                            </div>

                            {/* Table */}
                            <Table
                                aria-label="Tabla de propiedades"
                                classNames={{
                                    wrapper: "min-h-[222px]",
                                }}
                            >
                                <TableHeader columns={COLUMNS}>
                                    {(column) => (
                                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                                            {column.name}
                                        </TableColumn>
                                    )}
                                </TableHeader>
                                <TableBody items={items} emptyContent={"No se encontraron propiedades"} isLoading={loading}>
                                    {(item) => (
                                        <TableRow key={item.id}>
                                            {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination - Outside table to prevent horizontal scroll */}
                            <div className="flex w-full justify-center mt-4">
                                <Pagination
                                    isCompact
                                    showControls

                                    variant="flat"
                                    page={page}
                                    total={Math.ceil(filteredItems.length / rowsPerPage) || 1}
                                    onChange={(page) => setPage(page)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Bottom Navigation */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-default-200 z-50 px-6 py-3 flex justify-between items-center rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <NavigationItems isMobile={true} handleLogout={handleLogout} />
                </div>
            </div>

            {/* Modals */}
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                currentUser={currentUser}
            />
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />
        </HeroUIProvider>
    );
}

// Icons
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d="M2.5 18.3333H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
    </svg>
);

const DeleteIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M7.08331 4.14169L7.26665 3.05002C7.4 2.24169 7.5 1.64169 8.94165 1.64169H11.0583C12.5 1.64169 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M15.7084 9.16669L15.1667 17.5667C15.0834 18.875 15 19.1667 12.675 19.1667H7.32502C5.00002 19.1667 4.91669 18.875 4.83335 17.5667L4.29169 9.16669" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M8.60834 13.75H11.3833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M7.91669 10.4167H12.0834" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);



const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M22 22L20 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

// Rental Alerts Component
const RentalAlerts: React.FC = () => {
    const [alerts, setAlerts] = useState<RentalAlert[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const loadAlerts = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('rentals')
                .select('*, properties(title)')
                .in('status', ['near_expiration', 'expired'])
                .order('end_date', { ascending: true });

            if (!isMounted.current) return;

            if (error) {
                console.error('Error loading rental alerts:', error);
                showToast({
                    title: "Error al cargar alertas",
                    color: "danger"
                });
                setAlerts([]);
            } else {
                setAlerts(data || []);
            }
        } catch (error) {
            console.error('Unexpected error loading alerts:', error);
            if (isMounted.current) {
                setAlerts([]);
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadAlerts();
    }, [loadAlerts]);

    // Refresh alerts when modal opens
    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
        if (open) {
            loadAlerts();
        }
    }, [loadAlerts]);

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
                        aria-label="Ver alertas de alquileres"
                    >
                        <BellIcon className={hasAlerts ? "animate-pulse" : ""} />
                    </Button>
                </Badge>
            </Tooltip>

            <Modal
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
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
                                {isLoading ? (
                                    <div className="text-center py-8">
                                        <p className="text-default-500">Cargando alertas...</p>
                                    </div>
                                ) : hasAlerts ? (
                                    <div className="flex flex-col gap-3">
                                        {alerts.map((alert) => {
                                            const remainingDays = Math.ceil((new Date(alert.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                            const isExpired = remainingDays < 0;
                                            const daysAgo = Math.abs(remainingDays);

                                            return (
                                                <Card key={alert.id} className={`border ${isExpired ? 'border-danger-200' : 'border-warning-200'}`}>
                                                    <CardBody className="p-4">
                                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-base text-gray-800">{alert.properties?.title}</p>
                                                                <p className="text-sm text-gray-600 mt-1">Inquilino: {alert.tenant_name}</p>
                                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                                    <Chip size="sm" color={isExpired ? "danger" : "warning"} variant="flat">
                                                                        {isExpired ? `Vencido hace ${daysAgo} día${daysAgo !== 1 ? 's' : ''}` : `${remainingDays} día${remainingDays !== 1 ? 's' : ''} restante${remainingDays !== 1 ? 's' : ''}`}
                                                                    </Chip>
                                                                    <Chip size="sm" color={isExpired ? "danger" : "warning"} variant="dot">
                                                                        {isExpired ? "Finalizó: " : "Finaliza: "} {new Date(alert.end_date).toLocaleDateString()}
                                                                    </Chip>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                color={isExpired ? "danger" : "warning"}
                                                                variant="flat"
                                                                as="a"
                                                                href={`/admin/rentals`}
                                                                className="w-full sm:w-auto"
                                                            >
                                                                Ver Detalles
                                                            </Button>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            );
                                        })}
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

const BellIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);
