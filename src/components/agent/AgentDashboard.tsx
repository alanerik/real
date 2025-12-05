import { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Chip,
    Spinner,
    Avatar,
    Divider,
    Button
} from "@heroui/react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useAgentAuth } from '../../hooks/useAgentAuth';
import { getAgentStats, type Agent } from '../../lib/agents';
import { formatCurrency } from '../../lib/commissions';
import AgentSidebar from './AgentSidebar';
import MobileAgentSidebar from './MobileAgentSidebar';
import CommissionAlert from './CommissionAlert';

interface AgentStats {
    properties: { pending: number; approved: number; total: number };
    leads: { new: number; total: number };
    commissions: { pending: number; paid: number; total: number };
}

// Hamburger icon needs to be defined before use
const HamburgerIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

function AgentDashboardContent() {
    const { currentAgent, isCheckingAuth, handleLogout } = useAgentAuth();
    const [stats, setStats] = useState<AgentStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 p-4 gap-4">
            {/* Mobile Hamburger Button */}
            <Button
                isIconOnly
                variant="light"
                className="fixed top-4 left-4 z-30 sm:hidden"
                onPress={() => setIsMobileSidebarOpen(true)}
                aria-label="Abrir menú"
            >
                <HamburgerIcon className="w-6 h-6 text-default-600" />
            </Button>

            {/* Mobile Sidebar */}
            <MobileAgentSidebar
                isOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
                currentAgent={currentAgent}
                handleLogout={handleLogout}
            />

            {/* Desktop Sidebar */}
            <div className="hidden sm:block">
                <AgentSidebar
                    isExpanded={isSidebarExpanded}
                    onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    handleLogout={handleLogout}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-6xl mx-auto">
                {/* Header */}
                <Card className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-600">
                    <CardBody className="py-8">
                        <div className="flex items-center gap-4">
                            <Avatar
                                src={currentAgent.avatar_url || undefined}
                                name={currentAgent.name}
                                size="lg"
                                className="ring-4 ring-white/30"
                            />
                            <div className="text-white">
                                <h1 className="text-2xl font-bold">¡Bienvenido, {currentAgent.name}!</h1>
                                <p className="text-emerald-100">Panel de Agente Inmobiliario</p>
                                {currentAgent.license_number && (
                                    <p className="text-emerald-200 text-sm mt-1">
                                        Matrícula: {currentAgent.license_number}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>

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
                    <CardBody>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <QuickActionCard
                                href="/agent/properties/new"
                                icon={<PlusIcon className="w-6 h-6" />}
                                label="Nueva Propiedad"
                                color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            />
                            <QuickActionCard
                                href="/agent/properties"
                                icon={<PropertiesIcon className="w-6 h-6" />}
                                label="Ver Propiedades"
                                color="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            />
                            <QuickActionCard
                                href="/agent/leads"
                                icon={<LeadsIcon className="w-6 h-6" />}
                                label="Mis Leads"
                                color="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                            />
                            <QuickActionCard
                                href="/agent/commissions"
                                icon={<CommissionsIcon className="w-6 h-6" />}
                                label="Comisiones"
                                color="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                            />
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
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

// Quick Action Card
function QuickActionCard({ href, icon, label, color }: {
    href: string;
    icon: React.ReactNode;
    label: string;
    color: string;
}) {
    return (
        <a href={href}>
            <Card
                isPressable
                className={`${color} hover:scale-105 transition-transform`}
            >
                <CardBody className="flex flex-col items-center justify-center p-6 gap-2">
                    {icon}
                    <span className="text-sm font-medium text-center">{label}</span>
                </CardBody>
            </Card>
        </a>
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
