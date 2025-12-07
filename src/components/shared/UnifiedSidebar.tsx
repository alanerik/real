import React, { useMemo } from "react";
import { Button, Tooltip } from "@heroui/react";

export interface NavItem {
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    onClick?: () => void;
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    isActive?: boolean;
}

interface UnifiedSidebarProps {
    items: NavItem[];
    roleTitle: string;
    isExpanded: boolean;
    onToggle: () => void;
    handleLogout: () => Promise<void>;
    logo?: React.ReactNode;
}

const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({
    items,
    roleTitle,
    isExpanded,
    onToggle,
    handleLogout,
    logo
}) => {
    // Helper to determine if a link is active
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    // Sort items so logout is always last if handled manually, 
    // but typically we render items then logout separately.

    const renderButton = (item: NavItem) => {
        const isActive = item.isActive !== undefined
            ? item.isActive
            : (item.href ? (currentPath === item.href || currentPath.startsWith(item.href + '/')) : false);

        const IconComponent = item.icon;

        const content = (
            <div className={`flex items-center gap-3 ${isExpanded ? "w-full" : "justify-center"}`}>
                <IconComponent className="w-6 h-6 shrink-0" />
                {isExpanded && <span className="font-medium text-sm truncate">{item.label}</span>}
            </div>
        );

        const buttonElement = (
            <Button
                key={item.key}
                isIconOnly={!isExpanded}
                variant={isActive ? "flat" : "light"}
                as={item.href ? "a" : "button"}
                href={item.href}
                onPress={item.onClick}
                className={`
                    ${isExpanded ? "w-full justify-start px-4" : "w-12 h-12"}
                    ${isActive
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        : "text-default-500 hover:text-primary-600 dark:hover:text-primary-400"}
                    transition-all duration-200
                `}
                aria-label={item.label}
            >
                {content}
            </Button>
        );

        if (isExpanded) {
            return buttonElement;
        }

        return (
            <Tooltip key={item.key} content={item.label} placement="right">
                {buttonElement}
            </Tooltip>
        );
    };

    return (
        <aside
            className={`
                hidden sm:flex flex-col py-6 px-3 
                bg-white/80 dark:bg-black/20 backdrop-blur-md shadow-lg 
                h-[calc(100vh-2rem)] sticky top-4 
                transition-all duration-300 ease-in-out z-40
                ${isExpanded ? "w-64" : "w-20 items-center"}
                rounded-2xl ml-4
            `}
        >
            {/* Header / Logo Area */}
            <div className={`flex items-center ${isExpanded ? "justify-between w-full px-2" : "justify-center"} mb-6`}>
                {isExpanded && (
                    <span className="font-bold text-xl text-default-700 truncate">{roleTitle}</span>
                )}
                <Button
                    isIconOnly
                    variant="light"
                    onPress={onToggle}
                    className="text-default-500 min-w-[2.5rem]"
                    aria-label={isExpanded ? "Colapsar menú" : "Expandir menú"}
                >
                    {isExpanded ? <ChevronLeftIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                </Button>
            </div>

            {/* Nav Items */}
            <nav className={`flex flex-col gap-2 flex-1 ${isExpanded ? "w-full" : "items-center"}`}>
                {items.map(renderButton)}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Logout */}
                {renderButton({
                    key: 'logout',
                    label: 'Cerrar Sesión',
                    icon: LogOutIcon,
                    onClick: handleLogout,
                    color: 'danger',
                    isActive: false
                })}
            </nav>
        </aside>
    );
};

// Default Icons
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

const LogOutIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

export default React.memo(UnifiedSidebar);
