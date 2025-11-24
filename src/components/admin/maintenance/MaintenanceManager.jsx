import { useState } from 'react';
import MaintenanceTicketForm from './MaintenanceTicketForm';
import MaintenanceTicketList from './MaintenanceTicketList';
import ProviderForm from './ProviderForm';
import ProviderList from './ProviderList';
import { Button, Tabs, Tab } from "@heroui/react";

export default function MaintenanceManager() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [selectedTab, setSelectedTab] = useState("tickets");
    const [editingProvider, setEditingProvider] = useState(null);

    const handleSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        setShowForm(false);
        setEditingProvider(null);
    };

    const handleEdit = (provider) => {
        setEditingProvider(provider);
        setShowForm(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {selectedTab === "tickets" ? "Tickets de Mantenimiento" : "Agenda de Oficios"}
                </h2>
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
                        onPress={() => {
                            setShowForm(!showForm);
                            if (!showForm) setEditingProvider(null);
                        }}
                        className="w-full sm:w-auto"
                    >
                        {showForm ? 'Cancelar' : (selectedTab === "tickets" ? 'Nuevo Ticket' : 'Nuevo Proveedor')}
                    </Button>
                </div>
            </div>

            <Tabs
                aria-label="Opciones de Mantenimiento"
                selectedKey={selectedTab}
                onSelectionChange={setSelectedTab}
                color="primary"
                variant="underlined"
            >
                <Tab key="tickets" title="Tickets">
                    <div className="mt-4">
                        {showForm && (
                            <div className="mb-8">
                                <MaintenanceTicketForm onSuccess={handleSuccess} />
                            </div>
                        )}
                        <MaintenanceTicketList refreshTrigger={refreshTrigger} />
                    </div>
                </Tab>
                <Tab key="agenda" title="Agenda de Oficios">
                    <div className="mt-4">
                        {showForm && (
                            <div className="mb-8">
                                <ProviderForm onSuccess={handleSuccess} editingProvider={editingProvider} />
                            </div>
                        )}
                        <ProviderList refreshTrigger={refreshTrigger} onEdit={handleEdit} />
                    </div>
                </Tab>
            </Tabs>
        </div>
    );
}
