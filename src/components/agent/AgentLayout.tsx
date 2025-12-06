import React, { useState } from 'react';
import { useDisclosure, Button } from "@heroui/react";
import AgentSidebar from './AgentSidebar';
import MobileAgentSidebar from './MobileAgentSidebar';
import AgentNavigationItems from './AgentNavigationItems';
import AgentProfileModal from './AgentProfileModal';
import SettingsModal from '../admin/SettingsModal';
import type { Agent } from '../../lib/agents';

interface AgentLayoutProps {
    children: React.ReactNode | ((props: {
        onOpenMobileSidebar: () => void;
        onOpenProfile: () => void;
        onOpenSettings: () => void;
    }) => React.ReactNode);
    currentAgent: Agent | null;
    handleLogout: () => Promise<void>;
}

export const AgentLayout: React.FC<AgentLayoutProps> = ({ children, currentAgent, handleLogout }) => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const { isOpen: isProfileOpen, onOpen: onOpenProfile, onClose: onCloseProfile } = useDisclosure();
    const { isOpen: isSettingsOpen, onOpen: onOpenSettings, onClose: onCloseSettings } = useDisclosure();

    const handleOpenMobileSidebar = () => setIsMobileSidebarOpen(true);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 p-4 pb-20 sm:pb-4 gap-4">
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

            {/* Mobile Sidebar */}
            <MobileAgentSidebar
                isOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
                currentAgent={currentAgent}
                handleLogout={handleLogout}
                onOpenProfile={onOpenProfile}
                onOpenSettings={onOpenSettings}
            />

            {/* Desktop Sidebar */}
            <div className="hidden sm:block">
                <AgentSidebar
                    isExpanded={isSidebarExpanded}
                    onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    handleLogout={handleLogout}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-6xl mx-auto w-full">
                {typeof children === 'function'
                    ? children({
                        onOpenMobileSidebar: handleOpenMobileSidebar,
                        onOpenProfile,
                        onOpenSettings
                    })
                    : children
                }
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-default-200 z-50 px-6 py-3 flex justify-between items-center rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <AgentNavigationItems isMobile={true} handleLogout={handleLogout} />
            </div>
        </div>
    );
};
