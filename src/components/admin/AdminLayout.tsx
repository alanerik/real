import React from 'react';
import UnifiedLayout from '../shared/UnifiedLayout';
import { adminSidebarItems } from './AdminSidebarItems';
import { useAuth } from '../../hooks/useAuth';
import UserMenu from './UserMenu';
import { ModalProvider, useModal } from '../../contexts/ModalContext';
import { ModalRenderer } from '../ModalRenderer';

interface AdminLayoutContentProps {
    children: React.ReactNode;
    headerContent?: React.ReactNode;
    title?: string;
    hideSidebar?: boolean;
    hideUserMenu?: boolean;
    hideMobileNav?: boolean;
}

export const AdminLayoutContent: React.FC<AdminLayoutContentProps> = ({
    children,
    headerContent,
    title,
    hideSidebar = false,
    hideUserMenu = false,
    hideMobileNav = false
}) => {
    const { currentUser, handleLogout } = useAuth();
    const { openModal } = useModal();

    const defaultHeader = (
        <div className="flex justify-between items-center w-full mb-6">
            <h1 className="text-xl font-bold text-default-900 dark:text-default-100">{title || ''}</h1>
            {!hideUserMenu && (
                <UserMenu
                    currentUser={currentUser}
                    onOpenProfile={() => openModal('profile', { currentUser })}
                    onOpenSettings={() => openModal('settings')}
                />
            )}
        </div>
    );

    return (
        <UnifiedLayout
            roleTitle="Admin"
            sidebarItems={adminSidebarItems}
            handleLogout={handleLogout}
            headerContent={headerContent || defaultHeader}
            hideSidebar={hideSidebar}
            hideMobileNav={hideMobileNav}
        >
            {children}
            <ModalRenderer />
        </UnifiedLayout>
    );
};

export const AdminLayout: React.FC<AdminLayoutContentProps> = (props) => {
    return (
        <ModalProvider>
            <AdminLayoutContent {...props} />
        </ModalProvider>
    );
};
