import { useState } from 'react';
import MaintenanceTicketForm from './MaintenanceTicketForm';
import MaintenanceTicketList from './MaintenanceTicketList';
import { Button } from "@heroui/react";

export default function MaintenanceManager() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showForm, setShowForm] = useState(false);

    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Tickets de Mantenimiento</h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button
                        color="default"
                        variant="light"
                        onPress={() => window.location.href = '/admin/dashboard'}
                        className="w-full sm:w-auto"
                    >
                        <span className="hidden sm:inline">Volver al Dashboard</span>
                        <span className="sm:hidden">Dashboard</span>
                    </Button>
                    <Button
                        color="primary"
                        onPress={() => setShowForm(!showForm)}
                        className="w-full sm:w-auto"
                    >
                        {showForm ? 'Cancelar' : 'Nuevo Ticket'}
                    </Button>
                </div>
            </div>

            {showForm && (
                <div className="mb-8">
                    <MaintenanceTicketForm onSuccess={handleSuccess} />
                </div>
            )}

            <MaintenanceTicketList refreshTrigger={refreshTrigger} />
        </div>
    );
}
