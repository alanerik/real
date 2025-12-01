import React, { useState } from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { ModalProvider } from "../../contexts/ModalContext";
import { useAuth } from "../../hooks/useAuth";
import { useProperties } from "../../hooks/useProperties";
import { usePropertyFilters } from "../../hooks/usePropertyFilters";
import StatsCard from "./StatsCard";
import NavigationItems from "./NavigationItems";
import Sidebar from "./Sidebar";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { PropertyTable } from "./dashboard/PropertyTable";
import { RentalAlerts } from "./dashboard/RentalAlerts";
import { ModalRenderer } from "../ModalRenderer";
import { useModal } from "../../contexts/ModalContext";

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
        <>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-0 flex transition-colors duration-200">
                <Sidebar
                    isExpanded={isSidebarExpanded}
                    onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    handleLogout={handleLogout}
                />

                <div className="flex-1 flex flex-col min-w-0">
                    <div className="w-full p-4 sm:p-6 flex flex-col gap-6">
                        {/* Header */}
                        <DashboardHeader
                            currentUser={currentUser}
                            filterValue={filterValue}
                            onFilterChange={setFilterValue}
                            onOpenProfile={() => openModal('profile', { currentUser })}
                            onOpenSettings={() => openModal('settings')}
                            handleLogout={handleLogout}
                        />

                        <div className="flex flex-col gap-6 w-full">
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
                    </div>
                </div>

                {/* Mobile Bottom Navigation */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-default-200 z-50 px-6 py-3 flex justify-between items-center rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <NavigationItems isMobile={true} handleLogout={handleLogout} />
                </div>
            </div>

            {/* Centralized Modal Rendering - OUTSIDE HeroUIProvider so it shares ThemeProvider context */}
            <ModalRenderer />
        </>
    );
}

// Wrap with ThemeProvider, ModalProvider, and HeroUIProvider in correct order
export default function Dashboard(props: DashboardProps) {
    return (
        <ThemeProvider>
            <ModalProvider>
                <HeroUIProvider>
                    <DashboardContent {...props} />
                </HeroUIProvider>
            </ModalProvider>
        </ThemeProvider>
    );
}
