import React, { useCallback } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    User,
    Chip,
    Tooltip,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Pagination,
} from "@heroui/react";
import { STATUS_COLOR_MAP, STATUS_OPTIONS, COLUMNS } from "../../../constants/property";
import { EditIcon, DeleteIcon } from "../icons/Icons";
import type { Property } from "../../../types/dashboard";

interface PropertyTableProps {
    items: Property[];
    loading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onStatusChange: (id: number, newStatus: string) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

/**
 * PropertyTable component
 * Displays properties in a table with pagination
 */
export const PropertyTable: React.FC<PropertyTableProps> = ({
    items,
    loading,
    page,
    totalPages,
    onPageChange,
    onStatusChange,
    onDelete,
}) => {
    const renderCell = useCallback((property: Property, columnKey: string): React.ReactNode => {
        const cellValue = property[columnKey as keyof Property];

        switch (columnKey) {
            case "title":
                return (
                    <User
                        avatarProps={{ radius: "lg", src: property.image_url || "/images/placeholder-property.webp" }}
                        description={property.city}
                        name={property.title}
                    >
                        {property.city}
                    </User>
                );
            case "price":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm capitalize text-default-900">
                            {property.currency} {property.price?.toLocaleString()}
                        </p>
                        <p className="text-bold text-xs capitalize text-default-400">{property.operation}</p>
                    </div>
                );
            case "status":
                return (
                    <Dropdown>
                        <DropdownTrigger>
                            <Chip
                                className="capitalize cursor-pointer transition-transform hover:scale-105"
                                color={STATUS_COLOR_MAP[property.status] || "default"}
                                size="sm"
                                variant="flat"
                            >
                                {STATUS_OPTIONS.find(o => o.uid === property.status)?.name || property.status}
                            </Chip>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="Cambiar estado"
                            onAction={(key) => onStatusChange(property.id, key as string)}
                        >
                            {STATUS_OPTIONS.map((status) => (
                                <DropdownItem key={status.uid} color={STATUS_COLOR_MAP[status.uid]}>
                                    {status.name}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Editar">
                            <a
                                href={`/admin/properties/${property.id}`}
                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                aria-label={`Editar propiedad ${property.title}`}
                            >
                                <EditIcon />
                            </a>
                        </Tooltip>
                        <Tooltip content="Eliminar">
                            <span
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                onClick={() => onDelete(property.id)}
                                role="button"
                                tabIndex={0}
                                aria-label={`Eliminar propiedad ${property.title}`}
                                onKeyDown={(e) => e.key === 'Enter' && onDelete(property.id)}
                            >
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return cellValue as React.ReactNode;
        }
    }, [onStatusChange, onDelete]);

    return (
        <>
            <Table
                aria-label="Tabla de propiedades"
                classNames={{
                    wrapper: "min-h-[222px]",
                }}
            >
                <TableHeader columns={COLUMNS}>
                    {(column) => (
                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={items} emptyContent={"No se encontraron propiedades"} isLoading={loading}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination - Outside table to prevent horizontal scroll */}
            <div className="flex w-full justify-center mt-4">
                <Pagination
                    isCompact
                    showControls
                    variant="flat"
                    page={page}
                    total={totalPages}
                    onChange={onPageChange}
                />
            </div>
        </>
    );
};
