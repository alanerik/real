import React from "react";
import { Button, Tooltip } from "@heroui/react";

interface NavigationItemsProps {
    isMobile?: boolean;
    isExpanded?: boolean;
    handleLogout: () => Promise<void>;
}

const NavigationItems: React.FC<NavigationItemsProps> = ({ isMobile = false, isExpanded = false, handleLogout }) => {
    const renderButton = (
        icon: React.ReactNode,
        label: string,
        href?: string,
        onClick?: () => void,
        color: "default" | "primary" | "secondary" | "success" | "warning" | "danger" = "default"
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
                variant="light"
                as={href ? "a" : "button"}
                href={href}
                onPress={onClick}
                className={`
                    ${isExpanded ? "w-full justify-start px-4" : ""}
                    ${color === "default" ? "text-default-500 hover:text-primary" : ""}
                    ${color === "primary" ? "text-default-500 hover:text-primary" : ""}
                    ${color === "secondary" ? "text-default-500 hover:text-secondary" : ""}
                    ${color === "warning" ? "text-default-500 hover:text-warning" : ""}
                    ${color === "danger" ? "text-default-500 hover:text-danger" : ""}
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
            {renderButton(
                <PlusIcon className="w-6 h-6" />,
                "Nueva Propiedad",
                "/admin/properties/new",
                undefined,
                "primary"
            )}
            {renderButton(
                <KeyIcon className="w-6 h-6" />,
                "Gestionar Alquileres",
                "/admin/rentals",
                undefined,
                "secondary"
            )}
            {renderButton(
                <WrenchIcon className="w-6 h-6" />,
                "Mantenimiento",
                "/admin/maintenance",
                undefined,
                "warning"
            )}
            {renderButton(
                <AgentsIcon className="w-6 h-6" />,
                "Gestionar Agentes",
                "/admin/agents",
                undefined,
                "success"
            )}
            {renderButton(
                <PendingIcon className="w-6 h-6" />,
                "Propiedades Pendientes",
                "/admin/pending-properties",
                undefined,
                "warning"
            )}
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
const PlusIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M19 12h2l-9 -9l-9 9h2v7a2 2 0 0 0 2 2h5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M16 19h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M19 16v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const KeyIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M19 10l-7 -7l-9 9h2v7a2 2 0 0 0 2 2h6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M9 21v-6a2 2 0 0 1 2 -2h2c.387 0 .748 .11 1.054 .3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M21 15h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M19 21v1m0 -8v1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const WrenchIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const AgentsIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const PendingIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const LogOutIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M9 12h12l-3 -3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M18 15l3 -3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

export default React.memo(NavigationItems);
