import React, { useState } from "react";
import { HeroUIProvider, Card, CardBody } from "@heroui/react";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { ModalProvider } from "../../contexts/ModalContext";
import { useAuth } from "../../hooks/useAuth";
import { useProperties } from "../../hooks/useProperties";
import { usePropertyFilters } from "../../hooks/usePropertyFilters";
import StatsCard from "./StatsCard";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { PropertyTable } from "./dashboard/PropertyTable";
import { RentalAlerts } from "./dashboard/RentalAlerts";
import { ModalRenderer } from "../ModalRenderer";
import { useModal } from "../../contexts/ModalContext";
import { AdminLayoutContent } from "./AdminLayout";
// Removed UnifiedLayout, SidebarIcons content imports 

interface DashboardProps {
    alertsOnly?: boolean;
}

function DashboardContent({ alertsOnly = false }: DashboardProps) {
    // Custom hooks
    const { currentUser, isCheckingAuth, handleLogout } = useAuth();
    const { properties, loading, handleStatusChange, handleDelete } = useProperties();
    const {
        filterValue,
        setFilterValue,
        page,
        setPage,
        filteredItems,
        paginatedItems,
        stats,
        rowsPerPage,
    } = usePropertyFilters(properties);
    const { openModal } = useModal();

    // Local state
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    // Show loading while checking authentication
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg text-default-500">Verificando autenticación...</p>
            </div>
        );
    }

    // If alertsOnly, just render the alerts component
    if (alertsOnly) {
        return <RentalAlerts />;
    }

    // Calculate total pages for pagination
    const totalPages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

    return (
        <AdminLayoutContent
            headerContent={
                <DashboardHeader
                    currentUser={currentUser}
                    filterValue={filterValue}
                    onFilterChange={setFilterValue}
                    onOpenProfile={() => openModal('profile', { currentUser })}
                    onOpenSettings={() => openModal('settings')}
                    handleLogout={handleLogout}
                />
            }
        >
            <div className="flex flex-col gap-6 w-full">
                {/* Minimalist Mobile Navigation Card */}
                <MobileNavCard />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard title="Total Propiedades" value={stats.total} color="primary" />
                    <StatsCard title="Disponibles" value={stats.available} color="success" />
                    <StatsCard title="Reservadas" value={stats.reserved} color="warning" />
                    <StatsCard title="Vendidas" value={stats.sold} color="danger" />
                </div>

                {/* Property Table */}
                <PropertyTable
                    items={paginatedItems}
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                />
            </div>
        </AdminLayoutContent>
    );
}

// Minimalist Mobile Navigation Card
function MobileNavCard() {
    return (
        <Card className="sm:hidden shadow-sm border border-default-200 dark:border-default-100">
            <CardBody className="py-2 px-1">
                <div className="flex justify-around items-center">
                    <MobileNavButton
                        href="/admin/agents"
                        icon={<AgentsIcon className="w-5 h-5 text-default-600 dark:text-default-400" />}
                        label="Agentes"
                    />
                    <MobileNavButton
                        href="/admin/pending-properties"
                        icon={<PendingIcon className="w-5 h-5 text-default-600 dark:text-default-400" />}
                        label="Pendientes"
                    />
                    <MobileNavButton
                        href="/admin/maintenance"
                        icon={<WrenchIcon className="w-5 h-5 text-default-600 dark:text-default-400" />}
                        label="Soporte"
                    />
                    <MobileNavButton
                        href="/admin/daily-summary"
                        icon={<ChartIcon className="w-5 h-5 text-default-600 dark:text-default-400" />}
                        label="Resumen"
                    />
                </div>
            </CardBody>
        </Card>
    );
}

function MobileNavButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <a href={href} className="flex flex-col items-center gap-1 p-2 active:bg-default-100 rounded-lg transition-colors">
            {icon}
            <span className="text-[10px] font-medium text-default-500">{label}</span>
        </a>
    );
}

// Icons
import { AgentsIcon, PendingIcon, WrenchIcon, ChartIcon } from "./icons/SidebarIcons";

export default function Dashboard(props: DashboardProps) {
    return (
        <ThemeProvider>
            <ModalProvider>
                <DashboardContent {...props} />
            </ModalProvider>
        </ThemeProvider>
    );
}
