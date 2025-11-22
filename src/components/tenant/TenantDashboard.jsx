import { useState, useEffect } from 'react';
import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import { getTenantRental } from '../../lib/auth-tenant';
import { showToast } from '../ToastManager';
import MyContract from './MyContract';
import PaymentHistory from './PaymentHistory';
import ReportIssue from './ReportIssue';

export default function TenantDashboard() {
    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState("contract");

    useEffect(() => {
        loadRental();
    }, []);

    const loadRental = async () => {
        try {
            const data = await getTenantRental();
            setRental(data);
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
            {/* Welcome Card */}
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

            {/* Main Tabs */}
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

                <Tab key="report" title="Reportar Problema">
                    <div className="mt-4">
                        <ReportIssue rental={rental} />
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}
