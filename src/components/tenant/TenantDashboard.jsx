import { useState, useEffect } from 'react';
import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import { getTenantRental } from '../../lib/auth-tenant';
import { getPaymentsByRental } from '../../lib/payments';
import { getTicketsByProperty } from '../../lib/maintenance';
import { getAttachments } from '../../lib/rentals';
import { showToast } from '../ToastManager';
import MyContract from './MyContract';
import PaymentHistory from './PaymentHistory';
import ReportIssue from './ReportIssue';
import TenantDocuments from './TenantDocuments';
import {
    NextPaymentWidget,
    MaintenanceStatusWidget,
    ContractProgressWidget,
    QuickActionsWidget
} from './DashboardWidgets';

export default function TenantDashboard() {
    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState("contract");

    // Widget data
    const [nextPayment, setNextPayment] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [hasReceipt, setHasReceipt] = useState(false);
    const [loadingWidgets, setLoadingWidgets] = useState(true);

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

            const [paymentsData, ticketsData, attachmentsData] = await Promise.all([
                getPaymentsByRental(rentalData.id).catch(() => []),
                getTicketsByProperty(rentalData.property_id).catch(() => []),
                getAttachments(rentalData.id).catch(() => [])
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

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!rental) {
        return (
            <Card>
                <CardBody>
                    <p className="text-center text-gray-600">No se encontró información de alquiler.</p>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-primary-50 to-primary-100">
                <CardBody className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        ¡Hola, {rental.tenant_name}!
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Bienvenido a tu portal de inquilino
                    </p>
                </CardBody>
            </Card>

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
                    <QuickActionsWidget onAction={setSelectedTab} />
                </div>
            )}

            <Tabs
                aria-label="Opciones del Portal"
                selectedKey={selectedTab}
                onSelectionChange={setSelectedTab}
                color="primary"
                variant="underlined"
                size="lg"
            >
                <Tab key="contract" title="Mi Contrato">
                    <div className="mt-4">
                        <MyContract rental={rental} />
                    </div>
                </Tab>

                <Tab key="payments" title="Pagos">
                    <div className="mt-4">
                        <PaymentHistory rentalId={rental.id} />
                    </div>
                </Tab>

                <Tab key="documents" title="Documentos">
                    <div className="mt-4">
                        <TenantDocuments rental={rental} />
                    </div>
                </Tab>

                <Tab key="report" title="Reportar Problema">
                    <div className="mt-4">
                        <ReportIssue rental={rental} />
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}
