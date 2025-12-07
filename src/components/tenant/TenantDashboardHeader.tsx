import React from "react";
import { Input } from "@heroui/react";
import TenantUserMenu from "./TenantUserMenu";
import { SearchIcon } from "./icons/TenantIcons";

export interface TenantDashboardHeaderProps {
    tenantName?: string;
    tenantEmail?: string;
    onOpenProfile?: () => void;
    onOpenSettings?: () => void;
    title?: string;
    subtitle?: string;
}

export const TenantDashboardHeader: React.FC<TenantDashboardHeaderProps> = ({
    tenantName = "Inquilino",
    tenantEmail,
    onOpenProfile,
    onOpenSettings,
    title,
    subtitle,
}) => {
    return (
        <>
            {/* Desktop + Mobile Header */}
            <div className="flex flex-row justify-between items-center w-full mb-6">
                {/* Desktop Left: Title or Welcome Message */}
                <div className="text-left">
                    {title ? (
                        <div>
                            <h1 className="text-xl font-bold text-default-900 dark:text-default-100">{title}</h1>
                            {subtitle && <p className="text-sm text-default-500">{subtitle}</p>}
                        </div>
                    ) : (
                        <h1 className="text-xl font-bold">
                            Bienvenido, <span className="text-primary-600 dark:text-primary-400">{tenantName}</span>
                        </h1>
                    )}
                </div>

                {/* Desktop Right: Search + User Menu */}
                <div className="hidden sm:flex items-center justify-end gap-4 flex-1 max-w-xl">
                    <Input
                        isClearable
                        className="w-full"
                        placeholder="Buscar..."
                        startContent={<SearchIcon />}
                        aria-label="Buscar"
                    />
                    <TenantUserMenu
                        tenantName={tenantName}
                        tenantEmail={tenantEmail}
                        onOpenProfile={onOpenProfile}
                        onOpenSettings={onOpenSettings}
                    />
                </div>

                {/* Mobile Right: User Menu (compact) */}
                <div className="sm:hidden flex items-center gap-2">
                    <TenantUserMenu
                        tenantName={tenantName}
                        tenantEmail={tenantEmail}
                        onOpenProfile={onOpenProfile}
                        onOpenSettings={onOpenSettings}
                    />
                </div>
            </div>

            {/* Mobile Search (Below Header) */}
            <div className="sm:hidden w-full mb-6">
                <Input
                    isClearable
                    className="w-full"
                    placeholder="Buscar..."
                    startContent={<SearchIcon />}
                    aria-label="Buscar"
                />
            </div>
        </>
    );
};
