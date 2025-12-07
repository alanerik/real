import React from 'react';
import { useDisclosure } from "@heroui/react";
import UnifiedLayout from '../shared/UnifiedLayout';

interface TenantLayoutProps {
    children: React.ReactNode | ((props: {
        onOpenProfile: () => void;
        onOpenSettings: () => void;
    }) => React.ReactNode);
    handleLogout: () => Promise<void>;
    sidebarItems: any[]; // Accepting sidebar items from parent for tab navigation compatibility
}

export const TenantLayout: React.FC<TenantLayoutProps> = ({ children, handleLogout, sidebarItems }) => {
    const { isOpen: isProfileOpen, onOpen: onOpenProfile, onClose: onCloseProfile } = useDisclosure();
    const { isOpen: isSettingsOpen, onOpen: onOpenSettings, onClose: onCloseSettings } = useDisclosure();

    return (
        <UnifiedLayout
            roleTitle="Inquilino"
            sidebarItems={sidebarItems}
            handleLogout={handleLogout}
        >
            {typeof children === 'function'
                ? children({
                    onOpenProfile,
                    onOpenSettings
                })
                : children
            }
        </UnifiedLayout>
    );
};
