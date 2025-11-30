import React from "react";
import { Button, Tooltip } from "@heroui/react";
import NavigationItems from "./NavigationItems";

interface SidebarProps {
    isExpanded: boolean;
    onToggle: () => void;
    handleLogout: () => Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle, handleLogout }) => {
    return (
        <div
            className={`
                hidden sm:flex flex-col py-6 px-3 
                bg-white/80 dark:bg-black/20 backdrop-blur-md shadow-lg 
                h-[calc(100vh-2rem)] sticky top-4 
                transition-all duration-300 ease-in-out z-40
                ${isExpanded ? "w-64" : "w-20 items-center"}
                rounded-2xl ml-4
            `}
        >
            <div className={`flex items-center ${isExpanded ? "justify-between w-full px-2" : "justify-center"} mb-6`}>
                {isExpanded && (
                    <span className="font-bold text-xl text-default-700">Admin</span>
                )}
                <Button
                    isIconOnly
                    variant="light"
                    onPress={onToggle}
                    className="text-default-500"
                    aria-label={isExpanded ? "Colapsar menú" : "Expandir menú"}
                >
                    {isExpanded ? (
                        <ChevronLeftIcon className="w-5 h-5" />
                    ) : (
                        <MenuIcon className="w-5 h-5" />
                    )}
                </Button>
            </div>

            <div className={`flex flex-col gap-4 flex-1 ${isExpanded ? "w-full" : "items-center"}`}>
                {/* Daily Summary - First */}
                <div className="w-full">
                    {isExpanded ? (
                        <a href="/admin/daily-summary" className="block">
                            <Button
                                isIconOnly={false}
                                variant="light"
                                className="w-full justify-start px-4 text-default-500 hover:text-success"
                                aria-label="Resumen Diario"
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <ChartIcon className="w-6 h-6" />
                                    <span className="font-medium text-sm">Resumen Diario</span>
                                </div>
                            </Button>
                        </a>
                    ) : (
                        <Tooltip content="Resumen Diario" placement="right">
                            <a href="/admin/daily-summary" className="block">
                                <Button
                                    isIconOnly
                                    variant="light"
                                    className="text-default-500 hover:text-success"
                                    aria-label="Resumen Diario"
                                >
                                    <ChartIcon className="w-6 h-6" />
                                </Button>
                            </a>
                        </Tooltip>
                    )}
                </div>

                <NavigationItems isExpanded={isExpanded} handleLogout={handleLogout} />
            </div>
        </div>
    );
};

// Icons
const ChartIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M4 20h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const ChevronLeftIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const MenuIcon = (props: any) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M3 12h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M3 6h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M3 18h18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

export default Sidebar;
