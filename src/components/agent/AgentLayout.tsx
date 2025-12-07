import React from 'react';
import { useDisclosure } from "@heroui/react";
import UnifiedLayout from '../shared/UnifiedLayout';
import AgentProfileModal from './AgentProfileModal';
import SettingsModal from '../admin/SettingsModal';
import type { Agent } from '../../lib/agents';
import {
    DashboardIcon,
    PropertiesIcon,
    LeadsIcon,
    CommissionsIcon
} from './icons/AgentIcons';

interface AgentLayoutProps {
    children: React.ReactNode | ((props: {
        onOpenProfile: () => void;
        onOpenSettings: () => void;
    }) => React.ReactNode);
    currentAgent: Agent | null;
    handleLogout: () => Promise<void>;
}

export const AgentLayout: React.FC<AgentLayoutProps> = ({ children, currentAgent, handleLogout }) => {
    const { isOpen: isProfileOpen, onOpen: onOpenProfile, onClose: onCloseProfile } = useDisclosure();
    const { isOpen: isSettingsOpen, onOpen: onOpenSettings, onClose: onCloseSettings } = useDisclosure();

    // Define Navigation Items
    const sidebarItems = [
        { key: 'dashboard', href: '/agent/dashboard', label: 'Dashboard', icon: DashboardIcon, color: 'primary' as const },
        { key: 'properties', href: '/agent/properties', label: 'Propiedades', icon: PropertiesIcon, color: 'success' as const },
        { key: 'leads', href: '/agent/leads', label: 'Leads', icon: LeadsIcon, color: 'secondary' as const },
        { key: 'commissions', href: '/agent/commissions', label: 'Comisiones', icon: CommissionsIcon, color: 'warning' as const },
    ];

    return (
        <>
            {/* Modals */}
            <AgentProfileModal
                isOpen={isProfileOpen}
                onClose={onCloseProfile}
                currentAgent={currentAgent}
            />
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={onCloseSettings}
            />

            <UnifiedLayout
                roleTitle="Agente"
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
        </>
    );
};
