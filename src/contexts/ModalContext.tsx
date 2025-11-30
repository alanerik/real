import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface ModalState {
    [key: string]: {
        isOpen: boolean;
        props?: any;
    };
}

interface ModalContextType {
    modals: ModalState;
    openModal: (modalId: string, props?: any) => void;
    closeModal: (modalId: string) => void;
    closeAllModals: () => void;
    isModalOpen: (modalId: string) => boolean;
    getModalProps: (modalId: string) => any;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
    children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const [modals, setModals] = useState<ModalState>({});

    const openModal = useCallback((modalId: string, props?: any) => {
        setModals((prev) => ({
            ...prev,
            [modalId]: {
                isOpen: true,
                props,
            },
        }));
    }, []);

    const closeModal = useCallback((modalId: string) => {
        setModals((prev) => ({
            ...prev,
            [modalId]: {
                ...prev[modalId],
                isOpen: false,
            },
        }));
    }, []);

    const closeAllModals = useCallback(() => {
        setModals((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((key) => {
                updated[key] = { ...updated[key], isOpen: false };
            });
            return updated;
        });
    }, []);

    const isModalOpen = useCallback(
        (modalId: string) => {
            return modals[modalId]?.isOpen ?? false;
        },
        [modals]
    );

    const getModalProps = useCallback(
        (modalId: string) => {
            return modals[modalId]?.props ?? {};
        },
        [modals]
    );

    return (
        <ModalContext.Provider
            value={{
                modals,
                openModal,
                closeModal,
                closeAllModals,
                isModalOpen,
                getModalProps,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};

/**
 * Hook to access modal context
 * @returns Modal context with controls for managing modals
 */
export const useModal = (): ModalContextType => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
