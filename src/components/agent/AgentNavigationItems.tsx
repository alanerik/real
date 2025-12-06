import React from "react";
import { Button, Tooltip } from "@heroui/react";

interface AgentNavigationItemsProps {
    isMobile?: boolean;
    isExpanded?: boolean;
    handleLogout: () => Promise<void>;
}

const AgentNavigationItems: React.FC<AgentNavigationItemsProps> = ({
    isMobile = false,
    isExpanded = false,
    handleLogout
}) => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const navItems = [
        { href: '/agent/dashboard', label: 'Dashboard', icon: DashboardIcon, color: 'primary' as const },
        { href: '/agent/properties', label: 'Propiedades', icon: PropertiesIcon, color: 'success' as const },
        { href: '/agent/leads', label: 'Leads', icon: LeadsIcon, color: 'secondary' as const },
        { href: '/agent/commissions', label: 'Comisiones', icon: CommissionsIcon, color: 'warning' as const },
    ];

    const renderButton = (
        icon: React.ReactNode,
        label: string,
        href?: string,
        onClick?: () => void,
        color: "default" | "primary" | "secondary" | "success" | "warning" | "danger" = "default",
        isActive: boolean = false
    ) => {
        const buttonContent = (
            <div className={`flex items-center gap-3 ${isExpanded ? "w-full" : ""}`}>
                {icon}
                {isExpanded && <span className="font-medium text-sm">{label}</span>}
            </div>
        );

        const button = (
            <Button
                isIconOnly={!isExpanded}
                variant={isActive ? "flat" : "light"}
                as={href ? "a" : "button"}
                href={href}
                onPress={onClick}
                className={`
                    ${isExpanded ? "w-full justify-start px-4" : ""}
                    ${isActive
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : "text-default-500 hover:text-emerald-600"}
                `}
                aria-label={label}
            >
                {buttonContent}
            </Button>
        );

        if (isExpanded) {
            return button;
        }

        return (
            <Tooltip content={label} placement={isMobile ? "top" : "right"}>
                {button}
            </Tooltip>
        );
    };

    return (
        <>
            {navItems.map((item) => {
                const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
                const IconComponent = item.icon;

                return (
                    <React.Fragment key={item.href}>
                        {renderButton(
                            <IconComponent className="w-6 h-6" />,
                            item.label,
                            item.href,
                            undefined,
                            item.color,
                            isActive
                        )}
                    </React.Fragment>
                );
            })}

            <div className={isMobile ? "" : "mt-auto w-full"}>
                {renderButton(
                    <LogOutIcon className="w-6 h-6" />,
                    "Cerrar Sesión",
                    undefined,
                    handleLogout,
                    "danger"
                )}
            </div>
        </>
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

const LogOutIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

export default React.memo(AgentNavigationItems);
