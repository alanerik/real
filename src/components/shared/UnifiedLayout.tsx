import React, { useState } from "react";
import UnifiedSidebar, { type NavItem } from "./UnifiedSidebar";
import { Button, Navbar, NavbarContent, NavbarItem } from "@heroui/react";

interface UnifiedLayoutProps {
    children: React.ReactNode;
    sidebarItems: NavItem[];
    roleTitle: string;
    handleLogout: () => Promise<void>;
    isMobile?: boolean; // Can be detected but prop override is nice
    headerContent?: React.ReactNode; // For user menu, page title, filters
    hideSidebar?: boolean;
    hideMobileNav?: boolean;
}

export default function UnifiedLayout({
    children,
    sidebarItems,
    roleTitle,
    handleLogout,
    headerContent,
    hideSidebar = false,
    hideMobileNav = false
}: UnifiedLayoutProps) {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Mobile Bottom Navigation
    const renderMobileNav = () => (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-default-200 z-50 px-6 py-3 flex justify-between items-center rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            {sidebarItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive = item.isActive !== undefined
                    ? item.isActive
                    : (item.href ? (typeof window !== 'undefined' && (window.location.pathname === item.href || window.location.pathname.startsWith(item.href + '/'))) : false);

                return (
                    <Button
                        key={item.key}
                        isIconOnly
                        variant={isActive ? "flat" : "light"}
                        as={item.href ? "a" : "button"}
                        href={item.href}
                        onPress={item.onClick}
                        className={isActive ? "bg-primary-50 text-primary" : "text-default-500"}
                        aria-label={item.label}
                    >
                        <Icon className="w-6 h-6" />
                    </Button>
                );
            })}
            <Button
                isIconOnly
                variant="light"
                onPress={() => handleLogout()}
                className="text-danger"
                aria-label="Salir"
            >
                <LogOutIcon className="w-6 h-6" />
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-0 flex transition-colors duration-200">
            {/* Desktop Sidebar */}
            {!hideSidebar && (
                <UnifiedSidebar
                    items={sidebarItems}
                    roleTitle={roleTitle}
                    isExpanded={isSidebarExpanded}
                    onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    handleLogout={handleLogout}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="w-full p-4 sm:p-6 flex flex-col gap-6">
                    {/* Header Area */}
                    {headerContent && (
                        <div className="w-full mb-4">
                            {headerContent}
                        </div>
                    )}

                    {/* Content */}
                    <main className="w-full">
                        {children}
                    </main>
                </div>
            </div>

            {/* Mobile Nav */}
            {!hideMobileNav && renderMobileNav()}
        </div>
    );
}

const LogOutIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);
