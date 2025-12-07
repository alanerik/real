import React from "react";
import { Input } from "@heroui/react";
import { SearchIcon } from "../icons/Icons";
import { RentalAlerts } from "./RentalAlerts";
import UserMenu from "../UserMenu";
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
}) => {
    const userName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || "Usuario";

    return (
        <div className="flex flex-col gap-4">
            {/* Desktop + Mobile Header */}
            <div className="flex flex-row justify-between items-center w-full">
                {/* Left: Welcome Message (Always visible now as layout handles hamburger) */}
                <div className="text-left">
                    <h1 className="text-xl font-bold">
                        Bienvenido, <span className="text-primary">{userName}</span>
                    </h1>
                </div>

                {/* Right Area */}
                <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1 max-w-xl">
                    {/* Search - Hidden on tiny screens if needed, but flex handles it */}
                    <div className="hidden sm:block w-full max-w-xs">
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
        </div>
    );
};

