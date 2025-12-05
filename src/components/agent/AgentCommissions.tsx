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
    Divider
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
import AgentSidebar from './AgentSidebar';
import CommissionAlert from './CommissionAlert';

function AgentCommissionsContent() {
    const { currentAgent, isCheckingAuth, handleLogout } = useAgentAuth();
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

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
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 p-4 gap-4">
            <AgentSidebar
                isExpanded={isSidebarExpanded}
                onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
                handleLogout={handleLogout}
            />

            <div className="flex-1 max-w-6xl mx-auto space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-amber-500 to-orange-600">
                        <CardBody className="text-white">
                            <p className="text-amber-100 text-sm">Comisiones Pendientes</p>
                            <p className="text-3xl font-bold mt-1">
                                {loading ? '...' : formatCurrency(summary?.pending?.total || 0)}
                            </p>
                            <p className="text-amber-200 text-sm mt-1">
                                {summary?.pending?.count || 0} ventas
                            </p>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-500 to-green-600">
                        <CardBody className="text-white">
                            <p className="text-emerald-100 text-sm">Comisiones Cobradas</p>
                            <p className="text-3xl font-bold mt-1">
                                {loading ? '...' : formatCurrency(summary?.paid?.total || 0)}
                            </p>
                            <p className="text-emerald-200 text-sm mt-1">
                                {summary?.paid?.count || 0} ventas
                            </p>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500 to-indigo-600">
                        <CardBody className="text-white">
                            <p className="text-blue-100 text-sm">Total Histórico</p>
                            <p className="text-3xl font-bold mt-1">
                                {loading ? '...' : formatCurrency(summary?.all?.total || 0)}
                            </p>
                            <p className="text-blue-200 text-sm mt-1">
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
                    <CardBody>
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
        </div>
    );
}

export default function AgentCommissions() {
    return (
        <ThemeProvider>
            <HeroUIProvider>
                <AgentCommissionsContent />
            </HeroUIProvider>
        </ThemeProvider>
    );
}
