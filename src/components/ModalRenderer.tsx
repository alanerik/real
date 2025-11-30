import React from 'react';
import { useModal } from '../contexts/ModalContext';
import ProfileModal from './admin/ProfileModal';
import SettingsModal from './admin/SettingsModal';

/**
 * ModalRenderer component
 * Renders all active modals based on ModalContext state
 */
export const ModalRenderer: React.FC = () => {
    const { modals, closeModal, getModalProps } = useModal();

    return (
        <>
            {/* Profile Modal */}
            <ProfileModal
                isOpen={modals.profile?.isOpen ?? false}
                onClose={() => closeModal('profile')}
                currentUser={getModalProps('profile').currentUser}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={modals.settings?.isOpen ?? false}
                onClose={() => closeModal('settings')}
            />

            {/* Add more modals here as needed */}
        </>
    );
};
