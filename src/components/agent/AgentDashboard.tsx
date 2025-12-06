import { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Chip,
    Spinner,
    Divider,
    Listbox,
    ListboxItem
} from "@heroui/react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useAgentAuth } from '../../hooks/useAgentAuth';
import { getAgentStats, type Agent } from '../../lib/agents';
import { formatCurrency } from '../../lib/commissions';
import { AgentLayout } from './AgentLayout';
import { AgentDashboardHeader } from './AgentDashboardHeader';
import CommissionAlert from './CommissionAlert';

interface AgentStats {
    properties: { pending: number; approved: number; total: number };
    leads: { new: number; total: number };
    commissions: { pending: number; paid: number; total: number };
}

function AgentDashboardContent() {
    const { currentAgent, isCheckingAuth, handleLogout } = useAgentAuth();
    const [stats, setStats] = useState<AgentStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (currentAgent) {
            loadStats();
        }
    }, [currentAgent]);

    const loadStats = async () => {
        if (!currentAgent) return;
        setLoadingStats(true);
        try {
            const data = await getAgentStats(currentAgent.id);
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Spinner size="lg" color="success" />
            </div>
        );
    }

    if (!currentAgent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Card className="max-w-md">
                    <CardBody className="text-center p-8">
                        <p className="text-danger mb-4">No se encontró información del agente</p>
                        <a href="/agent/login" className="text-primary hover:underline">
                            Volver al login
                        </a>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <AgentLayout currentAgent={currentAgent} handleLogout={handleLogout}>
            {({ onOpenMobileSidebar, onOpenProfile, onOpenSettings }) => (
                <>
                    {/* Header */}
                    <AgentDashboardHeader
                        currentAgent={currentAgent}
                        onOpenProfile={onOpenProfile}
                        onOpenSettings={onOpenSettings}
                        onOpenMobileSidebar={onOpenMobileSidebar}
                    />

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <StatsCard
                            title="Propiedades"
                            loading={loadingStats}
                            stats={stats?.properties}
                            icon={<PropertiesIcon className="w-8 h-8 text-emerald-500" />}
                            renderContent={(data) => (
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-default-800">{data.total}</div>
                                    <div className="flex gap-2">
                                        <Chip size="sm" color="success" variant="flat">{data.approved} Aprobadas</Chip>
                                        <Chip size="sm" color="warning" variant="flat">{data.pending} Pendientes</Chip>
                                    </div>
                                </div>
                            )}
                        />

                        <StatsCard
                            title="Leads"
                            loading={loadingStats}
                            stats={stats?.leads}
                            icon={<LeadsIcon className="w-8 h-8 text-blue-500" />}
                            renderContent={(data) => (
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-default-800">{data.total}</div>
                                    <div className="flex gap-2">
                                        <Chip size="sm" color="primary" variant="flat">{data.new} Nuevos</Chip>
                                    </div>
                                </div>
                            )}
                        />

                        <StatsCard
                            title="Comisiones"
                            loading={loadingStats}
                            stats={stats?.commissions}
                            icon={<CommissionsIcon className="w-8 h-8 text-amber-500" />}
                            renderContent={(data) => (
                                <div className="space-y-2">
                                    <div className="text-3xl font-bold text-default-800">
                                        {formatCurrency(data.total)}
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <Chip size="sm" color="warning" variant="flat">
                                            {formatCurrency(data.pending)} Pendiente
                                        </Chip>
                                        <Chip size="sm" color="success" variant="flat">
                                            {formatCurrency(data.paid)} Cobrado
                                        </Chip>
                                    </div>
                                </div>
                            )}
                        />
                    </div>

                    {/* Commission Alert */}
                    <div className="mb-6">
                        <CommissionAlert />
                    </div>

                    {/* Quick Actions */}
                    <Card className="mb-6">
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Acciones Rápidas</h3>
                        </CardHeader>
                        <Divider />
                        <CardBody className="p-0">
                            <Listbox
                                aria-label="Acciones rápidas"
                                onAction={(key) => {
                                    window.location.href = key as string;
                                }}
                                className="p-0"
                            >
                                <ListboxItem
                                    key="/agent/properties/new"
                                    startContent={
                                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                            <PlusIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                    }
                                    description="Agregar una nueva propiedad al sistema"
                                >
                                    Nueva Propiedad
                                </ListboxItem>
                                <ListboxItem
                                    key="/agent/properties"
                                    startContent={
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <PropertiesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    }
                                    description="Ver y gestionar tus propiedades"
                                >
                                    Mis Propiedades
                                </ListboxItem>
                                <ListboxItem
                                    key="/agent/leads"
                                    startContent={
                                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                            <LeadsIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                    }
                                    description="Gestionar tus contactos y oportunidades"
                                >
                                    Mis Leads
                                </ListboxItem>
                                <ListboxItem
                                    key="/agent/commissions"
                                    startContent={
                                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                            <CommissionsIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                    }
                                    description="Ver el estado de tus comisiones"
                                >
                                    Comisiones
                                </ListboxItem>
                            </Listbox>
                        </CardBody>
                    </Card>
                </>
            )}
        </AgentLayout>
    );
}

// Stats Card Component
function StatsCard({ title, loading, stats, icon, renderContent }: {
    title: string;
    loading: boolean;
    stats: any;
    icon: React.ReactNode;
    renderContent: (stats: any) => React.ReactNode;
}) {
    return (
        <Card>
            <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-sm font-medium text-default-500">{title}</h3>
                    {icon}
                </div>
                {loading ? (
                    <Spinner size="sm" />
                ) : stats ? (
                    renderContent(stats)
                ) : (
                    <p className="text-default-400">Sin datos</p>
                )}
            </CardBody>
        </Card>
    );
}


// Icons
const PropertiesIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const LeadsIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const CommissionsIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const PlusIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

// Wrap with providers
export default function AgentDashboard() {
    return (
        <ThemeProvider>
            <HeroUIProvider>
                <AgentDashboardContent />
            </HeroUIProvider>
        </ThemeProvider>
    );
}
