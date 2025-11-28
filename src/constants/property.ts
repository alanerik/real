// Constants for property status management

export const STATUS_COLOR_MAP: Record<string, any> = {
    available: "success",
    reserved: "warning",
    sold: "danger",
} as const;

export const STATUS_OPTIONS = [
    { name: "Disponible", uid: "available" },
    { name: "Reservado", uid: "reserved" },
    { name: "Vendido", uid: "sold" },
] as const;

export const COLUMNS = [
    { name: "PROPIEDAD", uid: "title" },
    { name: "PRECIO", uid: "price" },
    { name: "ESTADO", uid: "status" },
    { name: "ACCIONES", uid: "actions" },
] as const;

// Color class lookup to avoid dynamic Tailwind class names
export const TEXT_COLOR_CLASSES: Record<string, string> = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    default: "text-default",
} as const;
