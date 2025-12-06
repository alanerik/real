import React from "react";
import { Input, Button } from "@heroui/react";
import AgentUserMenu from "./AgentUserMenu";
import type { Agent } from "../../lib/agents";

interface AgentDashboardHeaderProps {
    currentAgent: Agent | null;
    onOpenProfile: () => void;
    onOpenSettings: () => void;
    onOpenMobileSidebar: () => void;
    title?: string;
    subtitle?: string;
}

export const AgentDashboardHeader: React.FC<AgentDashboardHeaderProps> = ({
    currentAgent,
    onOpenProfile,
    onOpenSettings,
    onOpenMobileSidebar,
    title,
    subtitle,
}) => {
    const agentName = currentAgent?.name || "Agente";

    return (
        <>

            {/* Desktop + Mobile Header */}
            <div className="flex flex-row justify-between items-center w-full mb-6">
                {/* Mobile Left: Hamburger Button */}
                <div className="sm:hidden">
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={onOpenMobileSidebar}
                        className="text-default-500"
                        aria-label="Abrir menú"
                    >
                        <MenuIcon className="w-6 h-6" />
                    </Button>
                </div>

                {/* Desktop Left: Title or Welcome Message */}
                <div className="hidden sm:block text-left">
                    {title ? (
                        <div>
                            <h1 className="text-xl font-bold text-default-900 dark:text-default-100">{title}</h1>
                            {subtitle && <p className="text-sm text-default-500">{subtitle}</p>}
                        </div>
                    ) : (
                        <h1 className="text-xl font-bold">
                            Bienvenido, <span className="text-emerald-600 dark:text-emerald-400">{agentName}</span>
                        </h1>
                    )}
                </div>

                {/* Desktop Right: Search + User Menu */}
                <div className="hidden sm:flex items-center justify-end gap-4 flex-1 max-w-xl">
                    <Input
                        isClearable
                        className="w-full"
                        placeholder="Buscar propiedades, leads..."
                        startContent={<SearchIcon />}
                        aria-label="Buscar"
                    />
                    <AgentUserMenu
                        currentAgent={currentAgent}
                        onOpenProfile={onOpenProfile}
                        onOpenSettings={onOpenSettings}
                    />
                </div>

                {/* Mobile Right: User Menu (compact) */}
                <div className="sm:hidden flex items-center gap-2">
                    <AgentUserMenu
                        currentAgent={currentAgent}
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

// Icons
const MenuIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M3 12h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M3 6h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M3 18h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const SearchIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M22 22L20 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);
