import React, { useState } from "react";
import { Input, Button } from "@heroui/react";
import { SearchIcon } from "../icons/Icons";
import { RentalAlerts } from "./RentalAlerts";
import UserMenu from "../UserMenu";
import MobileSidebar from "../MobileSidebar";
import type { User } from "../../../types/dashboard";

interface DashboardHeaderProps {
    currentUser: User | null;
    filterValue: string;
    onFilterChange: (value: string) => void;
    onOpenProfile: () => void;
    onOpenSettings: () => void;
    handleLogout: () => Promise<void>;
}

/**
 * DashboardHeader component
 * Displays the welcome message, search bar, alerts, and user menu
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    currentUser,
    filterValue,
    onFilterChange,
    onOpenProfile,
    onOpenSettings,
    handleLogout,
}) => {
    const userName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || "Usuario";
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <>
            {/* Mobile Sidebar */}
            <MobileSidebar
                isOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
                currentUser={currentUser}
                handleLogout={handleLogout}
                onOpenProfile={onOpenProfile}
                onOpenSettings={onOpenSettings}
            />

            {/* Desktop + Mobile Header */}
            <div className="flex flex-row justify-between items-center w-full">
                {/* Mobile Left: Hamburger Button */}
                <div className="sm:hidden">
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={() => setIsMobileSidebarOpen(true)}
                        className="text-default-500"
                        aria-label="Abrir menú"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </Button>
                </div>

                {/* Desktop Left: Welcome Message */}
                <div className="hidden sm:block text-left">
                    <h1 className="text-xl font-bold">
                        Bienvenido, <span className="text-primary">{userName}</span>
                    </h1>
                </div>

                {/* Mobile Right: Alerts Only */}
                <div className="sm:hidden">
                    <RentalAlerts />
                </div>

                {/* Desktop Right: Alerts + Search + User Menu */}
                <div className="hidden sm:flex items-center justify-end gap-4 flex-1 max-w-xl">
                    <Input
                        isClearable
                        className="w-full"
                        placeholder="Buscar por nombre o ciudad..."
                        startContent={<SearchIcon />}
                        value={filterValue}
                        onValueChange={onFilterChange}
                        aria-label="Buscar propiedades"
                    />
                    <RentalAlerts />
                    <UserMenu
                        currentUser={currentUser}
                        onOpenProfile={onOpenProfile}
                        onOpenSettings={onOpenSettings}
                    />
                </div>
            </div>

            {/* Mobile Search (Below Header) */}
            <div className="sm:hidden w-full">
                <Input
                    isClearable
                    className="w-full"
                    placeholder="Buscar por nombre o ciudad..."
                    startContent={<SearchIcon />}
                    value={filterValue}
                    onValueChange={onFilterChange}
                    aria-label="Buscar propiedades"
                />
            </div>
        </>
    );
};

// Icons
const MenuIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M3 12h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M3 6h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M3 18h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);
