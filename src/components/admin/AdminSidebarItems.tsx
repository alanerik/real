import {
    ChartIcon,
    PlusIcon,
    KeyIcon,
    WrenchIcon,
    AgentsIcon,
    PendingIcon
} from "./icons/SidebarIcons";

export const adminSidebarItems = [
    { key: 'daily-summary', label: 'Resumen Diario', icon: ChartIcon, href: '/admin/daily-summary' },
    { key: 'new-property', label: 'Nueva Propiedad', icon: PlusIcon, href: '/admin/properties/new', color: 'primary' as const },
    { key: 'properties', label: 'Gestionar Alquileres', icon: KeyIcon, href: '/admin/rentals', color: 'secondary' as const },
    { key: 'maintenance', label: 'Mantenimiento', icon: WrenchIcon, href: '/admin/maintenance', color: 'warning' as const },
    { key: 'agents', label: 'Gestionar Agentes', icon: AgentsIcon, href: '/admin/agents', color: 'success' as const },
    { key: 'pending', label: 'Propiedades Pendientes', icon: PendingIcon, href: '/admin/pending-properties', color: 'warning' as const },
];
