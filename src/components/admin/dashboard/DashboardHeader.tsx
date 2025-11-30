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
        <>
            {/* Desktop + Mobile Header */}
            <div className="flex flex-row justify-between items-center w-full">
                {/* Left: Welcome Message */}
                <div className="text-left">
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
