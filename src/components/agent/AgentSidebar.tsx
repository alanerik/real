import React from "react";
import { Button, Tooltip } from "@heroui/react";
import AgentNavigationItems from "./AgentNavigationItems";

interface AgentSidebarProps {
    isExpanded: boolean;
    onToggle: () => void;
    handleLogout: () => Promise<void>;
}

const AgentSidebar: React.FC<AgentSidebarProps> = ({ isExpanded, onToggle, handleLogout }) => {
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
                    <span className="font-bold text-xl text-default-700">Agente</span>
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

            <div className={`flex flex-col gap-2 flex-1 ${isExpanded ? "w-full" : "items-center"}`}>
                <AgentNavigationItems isExpanded={isExpanded} handleLogout={handleLogout} />
            </div>
        </div>
    );
};

// Icons
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

export default AgentSidebar;
