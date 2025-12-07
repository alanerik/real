import { useState, useEffect } from 'react';
import { Card, CardBody, Button, useDisclosure } from "@heroui/react";
import { getTenantRental } from '../../lib/auth-tenant';
import { getPaymentsByRental } from '../../lib/payments';
import { getTicketsByProperty } from '../../lib/maintenance';
import { getAttachments } from '../../lib/rentals';
import { canRequestRenewal, getPendingRenewalRequest, getDaysUntilExpiration } from '../../lib/renewals';
import { showToast } from '../ToastManager';
import { supabase } from '../../lib/supabase';

// Components
import MyContract from './MyContract';
import PaymentHistory from './PaymentHistory';
import ReportIssue from './ReportIssue';
import TenantDocuments from './TenantDocuments';
import ActivityTimeline from './ActivityTimeline';
import RenewalRequestModal from './RenewalRequestModal';
import UnifiedLayout from '../shared/UnifiedLayout';

import {
    NextPaymentWidget,
    MaintenanceStatusWidget,
    ContractProgressWidget,
    QuickActionsWidget
} from './DashboardWidgets';

import {
    HomeIcon,
    FileTextIcon,
    CreditCardIcon,
    FolderIcon,
    ClockIcon,
    AlertCircleIcon
} from './icons/TenantIcons';

export default function TenantDashboard() {
    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState("dashboard"); // Default to dashboard view

    // Widget data
    const [nextPayment, setNextPayment] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [hasReceipt, setHasReceipt] = useState(false);
    const [loadingWidgets, setLoadingWidgets] = useState(true);

    // Renewal state
    const [canRenew, setCanRenew] = useState(false);
    const [renewalRequest, setRenewalRequest] = useState(null);
    const [daysUntilExpiration, setDaysUntilExpiration] = useState(0);
    const { isOpen: isRenewalOpen, onOpen: onRenewalOpen, onClose: onRenewalClose } = useDisclosure();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const rentalData = await getTenantRental();
            setRental(rentalData);
            loadWidgetData(rentalData);
        } catch (error) {
            console.error('Error loading rental:', error);
            showToast({
                title: 'Error al cargar información',
                description: error.message,
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const loadWidgetData = async (rentalData) => {
        try {
            setLoadingWidgets(true);

            const [paymentsData, ticketsData, attachmentsData, pendingRenewal] = await Promise.all([
                getPaymentsByRental(rentalData.id).catch(() => []),
                getTicketsByProperty(rentalData.property_id).catch(() => []),
                getAttachments(rentalData.id).catch(() => []),
                getPendingRenewalRequest(rentalData.id).catch(() => null)
            ]);

            const pendingPayments = paymentsData
                ?.filter(p => p.status === 'pending' || p.status === 'overdue')
                .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

            if (pendingPayments && pendingPayments.length > 0) {
                setNextPayment(pendingPayments[0]);
                const paymentReceipts = attachmentsData?.filter(
                    att => att.payment_id === pendingPayments[0].id
                ) || [];
                setHasReceipt(paymentReceipts.length > 0);
            }

            setTickets(ticketsData || []);

            // Check renewal eligibility
            const renewalCheck = canRequestRenewal(rentalData, pendingRenewal);
            setCanRenew(renewalCheck.can);
            setRenewalRequest(pendingRenewal);
            setDaysUntilExpiration(getDaysUntilExpiration(rentalData.end_date));
        } catch (error) {
            console.error('Error loading widget data:', error);
        } finally {
            setLoadingWidgets(false);
        }
    };

    const handleUploadReceipt = (paymentId) => {
        setSelectedTab('payments');
        showToast({
            title: 'Subir comprobante',
            description: 'Ve a la tabla de pagos y haz click en "Subir"',
            color: 'primary'
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/tenant/login';
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!rental) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card>
                    <CardBody>
                        <p className="text-center text-gray-600">No se encontró información de alquiler.</p>
                        <Button color="primary" className="mt-4" onPress={handleLogout}>Cerrar Sesión</Button>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // Sidebar items mapping
    const sidebarItems = [
        { key: 'dashboard', label: 'Inicio', icon: HomeIcon, onClick: () => setSelectedTab('dashboard'), isActive: selectedTab === 'dashboard', color: 'primary' },
        { key: 'contract', label: 'Mi Contrato', icon: FileTextIcon, onClick: () => setSelectedTab('contract'), isActive: selectedTab === 'contract', color: 'secondary' },
        { key: 'payments', label: 'Pagos', icon: CreditCardIcon, onClick: () => setSelectedTab('payments'), isActive: selectedTab === 'payments', color: 'success' },
        { key: 'documents', label: 'Documentos', icon: FolderIcon, onClick: () => setSelectedTab('documents'), isActive: selectedTab === 'documents', color: 'warning' },
        { key: 'activity', label: 'Actividad', icon: ClockIcon, onClick: () => setSelectedTab('activity'), isActive: selectedTab === 'activity' },
        { key: 'report', label: 'Reportar', icon: AlertCircleIcon, onClick: () => setSelectedTab('report'), isActive: selectedTab === 'report', color: 'danger' },
    ];

    const getRenewalStatusInfo = () => {
        if (renewalRequest) {
            if (renewalRequest.status === 'pending') {
                return { color: 'warning', text: '⏳ Solicitud Pendiente' };
            } else if (renewalRequest.status === 'approved') {
                return { color: 'success', text: '✅ Renovación Aprobada' };
            } else if (renewalRequest.status === 'rejected') {
                return { color: 'danger', text: '❌ Renovación Rechazada' };
            }
        }
        return null;
    };

    const renewalStatus = getRenewalStatusInfo();

    const renderDashboardOverview = () => (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/20 border-none">
                <CardBody className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ¡Hola, {rental.tenant_name}!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Bienvenido a tu portal de inquilino. Aquí puedes ver el estado de tu alquiler.
                    </p>
                </CardBody>
            </Card>

            {/* Renewal Widget */}
            {(canRenew || renewalRequest) && (
                <Card className={`border-2 ${renewalStatus?.color === 'warning' ? 'border-warning bg-warning-50' :
                    renewalStatus?.color === 'success' ? 'border-success bg-success-50' :
                        renewalStatus?.color === 'danger' ? 'border-danger bg-danger-50' :
                            'border-primary bg-primary-50'
                    }`}>
                    <CardBody className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-default-700">
                                    {renewalStatus ? renewalStatus.text : '🔄 Renovación de Contrato'}
                                </h3>
                                <p className="text-sm mt-1 text-default-600">
                                    {renewalRequest ?
                                        `Duración: ${renewalRequest.requested_duration_months} meses | $${renewalRequest.proposed_amount.toLocaleString()}/mes` :
                                        `Tu contrato vence en ${daysUntilExpiration} días`
                                    }
                                </p>
                                {renewalRequest?.admin_response && (
                                    <p className="text-sm mt-2 italic">"{renewalRequest.admin_response}"</p>
                                )}
                            </div>
                            {canRenew && (
                                <Button color="success" onPress={onRenewalOpen}>
                                    Solicitar Renovación
                                </Button>
                            )}
                        </div>
                    </CardBody>
                </Card>
            )}

            {loadingWidgets ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="h-40">
                            <CardBody className="flex items-center justify-center">
                                <div className="animate-pulse text-gray-400">Cargando...</div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <NextPaymentWidget
                        payment={nextPayment}
                        hasReceipt={hasReceipt}
                        onUploadReceipt={handleUploadReceipt}
                    />
                    <MaintenanceStatusWidget
                        tickets={tickets}
                        onReportClick={() => setSelectedTab('report')}
                    />
                    <ContractProgressWidget rental={rental} />
                    <QuickActionsWidget onAction={(key) => setSelectedTab(key)} />
                </div>
            )}
        </div>
    );

    return (
        <UnifiedLayout
            roleTitle="Inquilino"
            sidebarItems={sidebarItems}
            handleLogout={handleLogout}
        >
            <div className="space-y-6">
                {selectedTab === 'dashboard' && renderDashboardOverview()}

                {selectedTab === 'contract' && (
                    <div className="mt-4">
                        <h2 className="text-2xl font-bold mb-4">Mi Contrato</h2>
                        <MyContract rental={rental} />
                    </div>
                )}

                {selectedTab === 'payments' && (
                    <div className="mt-4">
                        <h2 className="text-2xl font-bold mb-4">Historial de Pagos</h2>
                        <PaymentHistory rentalId={rental.id} />
                    </div>
                )}

                {selectedTab === 'documents' && (
                    <div className="mt-4">
                        <h2 className="text-2xl font-bold mb-4">Documentos</h2>
                        <TenantDocuments rental={rental} />
                    </div>
                )}

                {selectedTab === 'activity' && (
                    <div className="mt-4">
                        <h2 className="text-2xl font-bold mb-4">Actividad Reciente</h2>
                        <ActivityTimeline rentalId={rental.id} />
                    </div>
                )}

                {selectedTab === 'report' && (
                    <div className="mt-4">
                        <h2 className="text-2xl font-bold mb-4">Reportar Problema</h2>
                        <ReportIssue rental={rental} />
                    </div>
                )}
            </div>

            {/* Modal for Renewals */}
            <RenewalRequestModal
                isOpen={isRenewalOpen}
                onClose={onRenewalClose}
                rental={rental}
            />
        </UnifiedLayout>
    );
}
