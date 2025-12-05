import React from "react";
import { Button, Tooltip } from "@heroui/react";

interface AgentSidebarProps {
    isExpanded: boolean;
    onToggle: () => void;
    handleLogout: () => Promise<void>;
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({ isExpanded, onToggle, handleLogout }) => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const navItems = [
        { href: '/agent/dashboard', label: 'Dashboard', icon: DashboardIcon },
        { href: '/agent/properties', label: 'Propiedades', icon: PropertiesIcon },
        { href: '/agent/leads', label: 'Leads', icon: LeadsIcon },
        { href: '/agent/commissions', label: 'Comisiones', icon: CommissionsIcon },
    ];

    return (
        <div
            className={`
                hidden sm:flex flex-col py-6 px-3 
                bg-white/80 dark:bg-black/20 backdrop-blur-md shadow-lg 
                h-[calc(100vh-2rem)] sticky top-4 
                transition-all duration-300 ease-in-out z-40
                ${isExpanded ? "w-64" : "w-20 items-center"}
                rounded-2xl ml-4
            `}
        >
            <div className={`flex items-center ${isExpanded ? "justify-between w-full px-2" : "justify-center"} mb-6`}>
                {isExpanded && (
                    <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">Agente</span>
                )}
                <Button
                    isIconOnly
                    variant="light"
                    onPress={onToggle}
                    className="text-default-500"
                    aria-label={isExpanded ? "Colapsar menú" : "Expandir menú"}
                >
                    {isExpanded ? (
                        <ChevronLeftIcon className="w-5 h-5" />
                    ) : (
                        <MenuIcon className="w-5 h-5" />
                    )}
                </Button>
            </div>

            <div className={`flex flex-col gap-2 flex-1 ${isExpanded ? "w-full" : "items-center"}`}>
                {navItems.map((item) => {
                    const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
                    const IconComponent = item.icon;

                    return (
                        <div key={item.href} className="w-full">
                            {isExpanded ? (
                                <a href={item.href} className="block">
                                    <Button
                                        isIconOnly={false}
                                        variant={isActive ? "flat" : "light"}
                                        color={isActive ? "success" : "default"}
                                        className={`w-full justify-start px-4 ${isActive
                                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                                : "text-default-500 hover:text-emerald-600"
                                            }`}
                                        aria-label={item.label}
                                    >
                                        <div className="flex items-center gap-3 w-full">
                                            <IconComponent className="w-5 h-5" />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </div>
                                    </Button>
                                </a>
                            ) : (
                                <Tooltip content={item.label} placement="right">
                                    <a href={item.href} className="block">
                                        <Button
                                            isIconOnly
                                            variant={isActive ? "flat" : "light"}
                                            color={isActive ? "success" : "default"}
                                            className={isActive
                                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                                : "text-default-500 hover:text-emerald-600"
                                            }
                                            aria-label={item.label}
                                        >
                                            <IconComponent className="w-5 h-5" />
                                        </Button>
                                    </a>
                                </Tooltip>
                            )}
                        </div>
                    );
                })}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Logout Button */}
                <div className="w-full pt-4 border-t border-default-200">
                    {isExpanded ? (
                        <Button
                            variant="light"
                            color="danger"
                            className="w-full justify-start px-4"
                            onPress={handleLogout}
                        >
                            <div className="flex items-center gap-3 w-full">
                                <LogoutIcon className="w-5 h-5" />
                                <span className="font-medium text-sm">Cerrar Sesión</span>
                            </div>
                        </Button>
                    ) : (
                        <Tooltip content="Cerrar Sesión" placement="right">
                            <Button
                                isIconOnly
                                variant="light"
                                color="danger"
                                onPress={handleLogout}
                            >
                                <LogoutIcon className="w-5 h-5" />
                            </Button>
                        </Tooltip>
                    )}
                </div>
            </div>
        </div>
    );
};

// Icons
const DashboardIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M9 22V12h6v10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const PropertiesIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const LeadsIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const CommissionsIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const LogoutIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const ChevronLeftIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const MenuIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M3 12h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M3 6h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M3 18h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

export default AgentSidebar;
