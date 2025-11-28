import React from "react";
import { Button, Tooltip } from "@heroui/react";

interface NavigationItemsProps {
    isMobile?: boolean;
    handleLogout: () => Promise<void>;
}

const NavigationItems: React.FC<NavigationItemsProps> = ({ isMobile = false, handleLogout }) => (
    <>
        <Tooltip content="Nueva Propiedad" placement={isMobile ? "top" : "right"}>
            <Button
                isIconOnly
                variant="light"
                as="a"
                href="/admin/properties/new"
                className="text-default-500 hover:text-primary"
                aria-label="Crear nueva propiedad"
            >
                <PlusIcon className="w-6 h-6" />
            </Button>
        </Tooltip>
        <Tooltip content="Gestionar Alquileres" placement={isMobile ? "top" : "right"}>
            <Button
                isIconOnly
                variant="light"
                as="a"
                href="/admin/rentals"
                className="text-default-500 hover:text-secondary"
                aria-label="Gestionar alquileres"
            >
                <KeyIcon className="w-6 h-6" />
            </Button>
        </Tooltip>
        <Tooltip content="Mantenimiento" placement={isMobile ? "top" : "right"}>
            <Button
                isIconOnly
                variant="light"
                as="a"
                href="/admin/maintenance"
                className="text-default-500 hover:text-warning"
                aria-label="Gestionar mantenimiento"
            >
                <WrenchIcon className="w-6 h-6" />
            </Button>
        </Tooltip>
        <div className={isMobile ? "" : "mt-auto"}>
            <Tooltip content="Cerrar Sesión" placement={isMobile ? "top" : "right"}>
                <Button
                    isIconOnly
                    variant="light"
                    onPress={handleLogout}
                    className="text-default-500 hover:text-danger"
                    aria-label="Cerrar sesión"
                >
                    <LogOutIcon className="w-6 h-6" />
                </Button>
            </Tooltip>
        </div>
    </>
);

// Icons
const PlusIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M6 12h12" />
            <path d="M12 18V6" />
        </g>
    </svg>
);

const KeyIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M14 14l6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M20 10V4h-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M9 20a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const WrenchIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M14.5 2l-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M19.5 7l-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M21 3l-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M11 11L3 19c-1.1 1.1-1.1 2.9 0 4s2.9 1.1 4 0l8-8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const LogOutIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M16 17l5-5-5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M21 12H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

export default React.memo(NavigationItems);
