import React from 'react';
import { useModal } from '../contexts/ModalContext';
import ProfileModal from './admin/ProfileModal';
import SettingsModal from './admin/SettingsModal';
import QuickCreateRentalModal from './admin/QuickCreateRentalModal';
import PaymentManager from './admin/PaymentManager';
import RenewalRequestModal from './tenant/RenewalRequestModal';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from "@heroui/react";

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

            {/* Quick Create Rental Modal */}
            <QuickCreateRentalModal
                isOpen={modals.quickCreateRental?.isOpen ?? false}
                onClose={() => closeModal('quickCreateRental')}
                initialDate={getModalProps('quickCreateRental').initialDate}
                properties={getModalProps('quickCreateRental').properties}
                rentals={getModalProps('quickCreateRental').rentals}
                onSuccess={getModalProps('quickCreateRental').onSuccess}
            />

            {/* Payment Manager Modal */}
            <PaymentManager
                isOpen={modals.paymentManager?.isOpen ?? false}
                onClose={() => closeModal('paymentManager')}
                rental={getModalProps('paymentManager').rental}
            />

            {/* Renewal Request Modal */}
            <RenewalRequestModal
                isOpen={modals.renewalRequest?.isOpen ?? false}
                onClose={() => closeModal('renewalRequest')}
                rental={getModalProps('renewalRequest').rental}
            />

            {/* Assign Provider Modal (Maintenance) */}
            <Modal
                isOpen={modals.assignProvider?.isOpen ?? false}
                onClose={() => closeModal('assignProvider')}
                scrollBehavior="inside"
                size="2xl"
            >
                <ModalContent>
                    {(onClose) => {
                        const props = getModalProps('assignProvider');
                        return (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    Asignar Proveedor
                                </ModalHeader>
                                <ModalBody>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Selecciona un proveedor para asignar a este ticket:
                                    </p>

                                    <div className="space-y-2">
                                        <div
                                            className={`p-3 border rounded-lg cursor-pointer transition-all ${props.selectedProvider === null
                                                ? 'border-primary bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => props.onProviderSelect?.(null)}
                                        >
                                            <p className="text-sm font-medium">Sin asignar</p>
                                            <p className="text-xs text-gray-500">Quitar asignación actual</p>
                                        </div>

                                        {(props.providers || []).map((provider: any) => (
                                            <div
                                                key={provider.id}
                                                className={`p-3 border rounded-lg cursor-pointer transition-all ${props.selectedProvider === provider.id
                                                    ? 'border-primary bg-primary-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => props.onProviderSelect?.(provider.id)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-medium">{provider.name}</p>
                                                        <p className="text-xs text-gray-500 capitalize">
                                                            {provider.trade.replace('_', ' ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="default" variant="light" onPress={onClose}>
                                        Cancelar
                                    </Button>
                                    <Button color="primary" onPress={() => {
                                        props.onAssign?.();
                                        onClose();
                                    }}>
                                        Asignar
                                    </Button>
                                </ModalFooter>
                            </>
                        );
                    }}
                </ModalContent>
            </Modal>
        </>
    );
};
