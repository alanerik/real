import React from "react";
import { Button, Avatar } from "@heroui/react";
import NavigationItems from "./NavigationItems";
import type { User } from "../../types/dashboard";

interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User | null;
    handleLogout: () => Promise<void>;
    onOpenProfile: () => void;
    onOpenSettings: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
    isOpen,
    onClose,
    currentUser,
    handleLogout,
    onOpenProfile,
    onOpenSettings,
}) => {
    const userName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || "Usuario";
    const userEmail = currentUser?.email || "";
    const userAvatar = currentUser?.user_metadata?.avatar_url || "";

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 sm:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed top-0 left-0 h-full w-64 
                    bg-white/95 dark:bg-black/40 backdrop-blur-md shadow-lg 
                    z-50 sm:hidden
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="flex flex-col h-full py-6 px-4">
                    {/* Header with Close Button */}
                    <div className="flex items-center justify-between mb-6">
                        <span className="font-bold text-xl text-default-700">Admin</span>
                        <Button
                            isIconOnly
                            variant="light"
                            onPress={onClose}
                            className="text-default-500"
                            aria-label="Cerrar menú"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* User Info */}
                    <div className="flex flex-col items-center mb-6 p-4 bg-default-100 dark:bg-default-50/10 rounded-lg">
                        <Avatar
                            isBordered
                            className="mb-3"
                            color="primary"
                            name={userName}
                            size="lg"
                            src={userAvatar}
                        />
                        <p className="font-semibold text-default-700 text-center">{userName}</p>
                        <p className="text-xs text-default-500 text-center truncate w-full">{userEmail}</p>

                        {/* Profile and Settings Buttons */}
                        <div className="flex gap-2 mt-3 w-full">
                            <Button
                                variant="flat"
                                className="flex-1"
                                startContent={<UserIcon className="w-4 h-4" />}
                                onPress={() => {
                                    onOpenProfile();
                                    onClose();
                                }}
                            >
                                Perfil
                            </Button>
                            <Button
                                variant="flat"
                                className="flex-1"
                                startContent={<SettingsIcon className="w-4 h-4" />}
                                onPress={() => {
                                    onOpenSettings();
                                    onClose();
                                }}
                            >
                                Config
                            </Button>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex flex-col gap-2 flex-1">
                        {/* Daily Summary */}
                        <a href="/admin/daily-summary" className="block w-full mb-2">
                            <Button
                                isIconOnly={false}
                                variant="light"
                                className="w-full justify-start px-4 text-default-500 hover:text-success"
                                aria-label="Resumen Diario"
                                onPress={onClose}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <ChartIcon className="w-6 h-6" />
                                    <span className="font-medium text-sm">Resumen Diario</span>
                                </div>
                            </Button>
                        </a>

                        <NavigationItems
                            isExpanded={true}
                            handleLogout={async () => {
                                await handleLogout();
                                onClose();
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

// Icons
const CloseIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

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

const ChartIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M4 20h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

export default MobileSidebar;
