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
    Spinner,
    Button
} from "@heroui/react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useAgentAuth } from '../../hooks/useAgentAuth';
import {
    getAgentCommissions,
    getCommissionSummary,
    formatCurrency,
    type Commission
} from '../../lib/commissions';
import { AgentLayout } from './AgentLayout';
import { AgentDashboardHeader } from './AgentDashboardHeader';
import CommissionAlert from './CommissionAlert';

function AgentCommissionsContent() {
    const { currentAgent, isCheckingAuth, handleLogout } = useAgentAuth();
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentAgent) {
            loadData();
        }
    }, [currentAgent]);

    const loadData = async () => {
        if (!currentAgent) return;
        setLoading(true);
        try {
            const [commissionsData, summaryData] = await Promise.all([
                getAgentCommissions(currentAgent.id),
                getCommissionSummary(currentAgent.id)
            ]);
            setCommissions(commissionsData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Error loading commissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getMyAmount = (commission: Commission) => {
        if (!currentAgent) return 0;
        if (commission.capturing_agent_id === currentAgent.id) {
            return commission.capturing_amount;
        }
        return commission.selling_amount;
    };

    const getMyRole = (commission: Commission) => {
        if (!currentAgent) return '';
        if (commission.capturing_agent_id === currentAgent.id &&
            commission.selling_agent_id === currentAgent.id) {
            return 'Captación + Venta';
        }
        if (commission.capturing_agent_id === currentAgent.id) {
            return 'Captación';
        }
        return 'Venta';
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
                        title="Comisiones"
                        subtitle="Gestiona y visualiza tus comisiones"
                    />

                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardBody className="p-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="text-sm text-default-500">Comisiones Pendientes</p>
                                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                            <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-default-800">
                                        {loading ? '...' : formatCurrency(summary?.pending?.total || 0)}
                                    </p>
                                    <p className="text-sm text-default-400 mt-1">
                                        {summary?.pending?.count || 0} ventas
                                    </p>
                                </CardBody>
                            </Card>

                            <Card>
                                <CardBody className="p-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="text-sm text-default-500">Comisiones Cobradas</p>
                                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                            <CheckIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-default-800">
                                        {loading ? '...' : formatCurrency(summary?.paid?.total || 0)}
                                    </p>
                                    <p className="text-sm text-default-400 mt-1">
                                        {summary?.paid?.count || 0} ventas
                                    </p>
                                </CardBody>
                            </Card>

                            <Card>
                                <CardBody className="p-6">
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="text-sm text-default-500">Total Histórico</p>
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                            <ChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-default-800">
                                        {loading ? '...' : formatCurrency(summary?.all?.total || 0)}
                                    </p>
                                    <p className="text-sm text-default-400 mt-1">
                                        {summary?.all?.count || 0} operaciones
                                    </p>
                                </CardBody>
                            </Card>
                        </div>

                        {/* Commission Info Alert */}
                        <CommissionAlert />

                        {/* Commissions Table */}
                        <Card>
                            <CardHeader>
                                <div>
                                    <h1 className="text-2xl font-bold text-default-800">Historial de Comisiones</h1>
                                    <p className="text-default-500">Detalle de todas tus comisiones</p>
                                </div>
                            </CardHeader>
                            <CardBody className="overflow-x-auto">
                                <Table aria-label="Tabla de comisiones">
                                    <TableHeader>
                                        <TableColumn>PROPIEDAD</TableColumn>
                                        <TableColumn>VALOR VENTA</TableColumn>
                                        <TableColumn>MI ROL</TableColumn>
                                        <TableColumn>MI COMISIÓN</TableColumn>
                                        <TableColumn>ESTADO</TableColumn>
                                        <TableColumn>FECHA</TableColumn>
                                    </TableHeader>
                                    <TableBody
                                        isLoading={loading}
                                        loadingContent={<Spinner />}
                                        emptyContent="No hay comisiones registradas"
                                    >
                                        {commissions.map((commission) => (
                                            <TableRow key={commission.id}>
                                                <TableCell>
                                                    {commission.properties ? (
                                                        <div>
                                                            <p className="font-medium">{commission.properties.title}</p>
                                                            <p className="text-sm text-default-400">{commission.properties.city}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-default-400">Propiedad eliminada</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-semibold">
                                                        {formatCurrency(commission.sale_price)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="sm"
                                                        variant="flat"
                                                        color={getMyRole(commission) === 'Captación + Venta' ? 'success' : 'primary'}
                                                    >
                                                        {getMyRole(commission)}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                            {formatCurrency(getMyAmount(commission))}
                                                        </span>
                                                        <p className="text-xs text-default-400">
                                                            {commission.capturing_agent_id === currentAgent?.id
                                                                ? `${commission.capturing_share}%`
                                                                : `${commission.selling_share}%`} del {commission.commission_rate}%
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="sm"
                                                        color={commission.status === 'paid' ? 'success' : 'warning'}
                                                        variant="flat"
                                                    >
                                                        {commission.status === 'paid' ? 'Cobrada' : 'Pendiente'}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="text-sm">{formatDate(commission.created_at)}</p>
                                                        {commission.payment_date && (
                                                            <p className="text-xs text-default-400">
                                                                Pagada: {formatDate(commission.payment_date)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardBody>
                        </Card>
                    </div>
                </>
            )}
        </AgentLayout>
    );
}

// Icons
const ClockIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const CheckIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

const ChartIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

export default function AgentCommissions() {
    return (
        <ThemeProvider>
            <HeroUIProvider>
                <AgentCommissionsContent />
            </HeroUIProvider>
        </ThemeProvider>
    );
}
