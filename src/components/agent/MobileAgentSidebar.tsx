import React from "react";
import { Button, Avatar } from "@heroui/react";
import type { Agent } from "../../lib/agents";

interface MobileAgentSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentAgent: Agent | null;
    handleLogout: () => Promise<void>;
}

const MobileAgentSidebar: React.FC<MobileAgentSidebarProps> = ({
    isOpen,
    onClose,
    currentAgent,
    handleLogout,
}) => {
    const agentName = currentAgent?.name || "Agente";
    const agentEmail = currentAgent?.email || "";
    const agentAvatar = currentAgent?.avatar_url || "";

    const navItems = [
        { label: "Dashboard", href: "/agent/dashboard", icon: DashboardIcon },
        { label: "Propiedades", href: "/agent/properties", icon: PropertyIcon },
        { label: "Leads", href: "/agent/leads", icon: LeadsIcon },
        { label: "Comisiones", href: "/agent/commissions", icon: CommissionIcon },
    ];

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 sm:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed top-0 left-0 h-full w-64 
                    bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg 
                    z-50 sm:hidden
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="flex flex-col h-full py-6 px-4">
                    {/* Header with Close Button */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="font-bold text-xl text-emerald-600">Portal Agente</span>
                        <Button
                            isIconOnly
                            variant="light"
                            onPress={onClose}
                            className="text-default-500"
                            aria-label="Cerrar menú"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* Agent Info */}
                    <div className="flex flex-col items-center mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <Avatar
                            isBordered
                            className="mb-3"
                            color="success"
                            name={agentName}
                            size="lg"
                            src={agentAvatar}
                        />
                        <p className="font-semibold text-default-700 dark:text-white text-center">{agentName}</p>
                        <p className="text-xs text-default-500 text-center truncate w-full">{agentEmail}</p>
                        {currentAgent?.license_number && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                Mat. {currentAgent.license_number}
                            </p>
                        )}
                    </div>

                    {/* Navigation Items */}
                    <div className="flex flex-col gap-2 flex-1">
                        {navItems.map((item) => {
                            const isActive = currentPath === item.href ||
                                (item.href !== '/agent/dashboard' && currentPath.startsWith(item.href));
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="block w-full"
                                    onClick={onClose}
                                >
                                    <Button
                                        variant={isActive ? "flat" : "light"}
                                        color={isActive ? "success" : "default"}
                                        className={`w-full justify-start px-4 ${isActive
                                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                                : "text-default-600 hover:text-emerald-600"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </div>
                                    </Button>
                                </a>
                            );
                        })}
                    </div>

                    {/* Logout Button */}
                    <div className="mt-auto pt-4 border-t border-default-200 dark:border-default-700">
                        <Button
                            variant="light"
                            color="danger"
                            className="w-full justify-start px-4"
                            onPress={async () => {
                                await handleLogout();
                                onClose();
                            }}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <LogoutIcon className="w-5 h-5" />
                                <span className="font-medium text-sm">Cerrar Sesión</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

// Icons
const CloseIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const DashboardIcon = (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const PropertyIcon = (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const LeadsIcon = (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const CommissionIcon = (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const LogoutIcon = (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

export default MobileAgentSidebar;
