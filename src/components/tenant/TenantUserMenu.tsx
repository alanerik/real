import React from "react";
import {
    Avatar,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@heroui/react";

interface TenantUserMenuProps {
    tenantName?: string;
    tenantEmail?: string;
    onOpenProfile?: () => void;
    onOpenSettings?: () => void;
}

const TenantUserMenu: React.FC<TenantUserMenuProps> = ({ tenantName, tenantEmail, onOpenProfile, onOpenSettings }) => {
    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <Avatar
                    isBordered
                    as="button"
                    className="transition-transform cursor-pointer"
                    color="primary"
                    name={tenantName}
                    size="sm"
                />
            </DropdownTrigger>
            <DropdownMenu aria-label="Menú de inquilino" variant="flat">
                <DropdownItem key="user-info" className="h-14 gap-2" textValue="User info">
                    <p className="font-semibold">Conectado como</p>
                    <p className="font-semibold">{tenantEmail || tenantName}</p>
                </DropdownItem>
                <DropdownItem
                    key="profile"
                    startContent={<UserIcon className="w-4 h-4" />}
                    onPress={onOpenProfile}
                >
                    Perfil
                </DropdownItem>
                <DropdownItem
                    key="settings"
                    startContent={<SettingsIcon className="w-4 h-4" />}
                    onPress={onOpenSettings}
                >
                    Configuraciones
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
};

// Icons
const UserIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
    </svg>
);

const SettingsIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor" />
    </svg>
);

export default React.memo(TenantUserMenu);
