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
    Input,
    Spinner,
    Pagination,
    Avatar
} from "@heroui/react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useAgentAuth } from '../../hooks/useAgentAuth';
import { supabase } from '../../lib/supabase';
import { AgentLayout } from './AgentLayout';
import { AgentDashboardHeader } from './AgentDashboardHeader';
import { showToast } from '../ToastManager';

interface Property {
    id: string;
    title: string;
    city: string;
    price: number;
    currency: string;
    status: string;
    approval_status: string;
    agent_id: string;
    image_url?: string;
    created_at: string;
    agents?: {
        id: string;
        name: string;
    };
}

const APPROVAL_STATUS_MAP: Record<string, { label: string; color: "success" | "warning" | "danger" }> = {
    pending: { label: 'Pendiente', color: 'warning' },
    approved: { label: 'Aprobada', color: 'success' },
    rejected: { label: 'Rechazada', color: 'danger' },
};

const STATUS_MAP: Record<string, { label: string; color: "success" | "warning" | "danger" }> = {
    available: { label: 'Disponible', color: 'success' },
    reserved: { label: 'Reservada', color: 'warning' },
    sold: { label: 'Vendida', color: 'danger' },
};

function AgentPropertyListContent() {
    const { currentAgent, isCheckingAuth, handleLogout } = useAgentAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterValue, setFilterValue] = useState("");
    const [page, setPage] = useState(1);
    const [showOnlyMine, setShowOnlyMine] = useState(false);
    const rowsPerPage = 10;

    useEffect(() => {
        if (currentAgent) {
            loadProperties();
        }
    }, [currentAgent]);

    const loadProperties = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('properties')
                .select(`
                    *,
                    agents (
                        id,
                        name
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProperties(data || []);
        } catch (error) {
            console.error('Error loading properties:', error);
            showToast({
                title: 'Error',
                description: 'No se pudieron cargar las propiedades',
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.title.toLowerCase().includes(filterValue.toLowerCase()) ||
            property.city.toLowerCase().includes(filterValue.toLowerCase());
        const matchesMine = !showOnlyMine || property.agent_id === currentAgent?.id;
        return matchesSearch && matchesMine;
    });

    const totalPages = Math.ceil(filteredProperties.length / rowsPerPage);
    const paginatedProperties = filteredProperties.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency || 'USD',
            minimumFractionDigits: 0
        }).format(price);
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" color="success" />
            </div>
        );
    }

    return (
        <AgentLayout currentAgent={currentAgent} handleLogout={handleLogout}>
            {({ onOpenProfile, onOpenSettings }) => (
                <>
                    <AgentDashboardHeader
                        currentAgent={currentAgent}
                        onOpenProfile={onOpenProfile}
                        onOpenSettings={onOpenSettings}
                        title="Propiedades"
                        subtitle={showOnlyMine ? 'Mostrando solo tus propiedades' : 'Mostrando todas las propiedades'}
                    />

                    <Card className="mb-6">
                        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="w-full sm:w-auto flex-1">
                                <Input
                                    placeholder="Buscar por título o ciudad..."
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                    className="max-w-md"
                                    startContent={<SearchIcon className="w-4 h-4 text-default-400" />}
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    variant={showOnlyMine ? "solid" : "bordered"}
                                    color="success"
                                    size="sm"
                                    onPress={() => setShowOnlyMine(!showOnlyMine)}
                                >
                                    {showOnlyMine ? 'Mis Propiedades' : 'Todas'}
                                </Button>
                                <Button
                                    as="a"
                                    href="/agent/properties/new"
                                    color="success"
                                    className="bg-emerald-600"
                                    startContent={<PlusIcon className="w-4 h-4" />}
                                >
                                    Nueva Propiedad
                                </Button>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <Table aria-label="Tabla de propiedades">
                                <TableHeader>
                                    <TableColumn>PROPIEDAD</TableColumn>
                                    <TableColumn>AGENTE</TableColumn>
                                    <TableColumn>PRECIO</TableColumn>
                                    <TableColumn>ESTADO</TableColumn>
                                    <TableColumn>APROBACIÓN</TableColumn>
                                    <TableColumn>ACCIONES</TableColumn>
                                </TableHeader>
                                <TableBody
                                    isLoading={loading}
                                    loadingContent={<Spinner />}
                                    emptyContent="No hay propiedades"
                                >
                                    {paginatedProperties.map((property) => (
                                        <TableRow key={property.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        src={property.image_url || undefined}
                                                        name={property.title[0]}
                                                        size="sm"
                                                        radius="md"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-default-800">
                                                            {property.title}
                                                            {property.agent_id === currentAgent?.id && (
                                                                <Chip size="sm" variant="flat" color="primary" className="ml-2">
                                                                    Tuya
                                                                </Chip>
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-default-500">{property.city}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-default-600">
                                                    {property.agents?.name || 'Sin asignar'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold">
                                                    {formatPrice(property.price, property.currency)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="sm"
                                                    color={STATUS_MAP[property.status]?.color || 'default'}
                                                    variant="flat"
                                                >
                                                    {STATUS_MAP[property.status]?.label || property.status}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="sm"
                                                    color={APPROVAL_STATUS_MAP[property.approval_status]?.color || 'default'}
                                                    variant="flat"
                                                >
                                                    {APPROVAL_STATUS_MAP[property.approval_status]?.label || property.approval_status}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        as="a"
                                                        href={`/propiedades/${property.id}`}
                                                        target="_blank"
                                                    >
                                                        Ver
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {totalPages > 1 && (
                                <div className="flex justify-center mt-4">
                                    <Pagination
                                        total={totalPages}
                                        page={page}
                                        onChange={setPage}
                                        color="success"
                                    />
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </>
            )}
        </AgentLayout>
    );
}

// Icons
const PlusIcon = (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

const SearchIcon = (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

export default function AgentPropertyList() {
    return (
        <ThemeProvider>
            <HeroUIProvider>
                <AgentPropertyListContent />
            </HeroUIProvider>
        </ThemeProvider>
    );
}
