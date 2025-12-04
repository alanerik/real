"use client";

import type { CardProps } from "@heroui/react";

import React, { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";
import {
    Card,
    Button,
    Select,
    SelectItem,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    cn,
} from "@heroui/react";

type ChartData = {
    name: string;
    [key: string]: string | number;
};

type CircleChartProps = {
    title: string;
    data: ChartData[];
    dataKey?: string;
    colors?: string[];
    showDropdown?: boolean;
    showOptions?: boolean;
    className?: string;
};

const formatTotal = (total: number) => {
    return total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total;
};

const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
};

const MenuDotsIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M12 12.5C11.7239 12.5 11.5 12.2761 11.5 12C11.5 11.7239 11.7239 11.5 12 11.5C12.2761 11.5 12.5 11.7239 12.5 12C12.5 12.2761 12.2761 12.5 12 12.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M5 12.5C4.72386 12.5 4.5 12.2761 4.5 12C4.5 11.7239 4.72386 11.5 5 11.5C5.27614 11.5 5.5 11.7239 5.5 12C5.5 12.2761 5.27614 12.5 5 12.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M19 12.5C18.7239 12.5 18.5 12.2761 18.5 12C18.5 11.7239 18.7239 11.5 19 11.5C19.2761 11.5 19.5 11.7239 19.5 12C19.5 12.2761 19.2761 12.5 19 12.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default function CircleChart({
    title,
    data,
    dataKey = "value",
    colors = ['#3b82f6', '#10b981', '#f59e0b'],
    showDropdown = true,
    showOptions = true,
    className,
}: CircleChartProps) {
    const categories = data.map(item => item.name);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

    const totalValue = data.reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0);

    const handleMenuAction = (key: string) => {
        switch (key) {
            case 'view-details':
                setIsDetailsModalOpen(true);
                break;
            case 'export-data':
                exportToCSV();
                break;
            case 'set-alert':
                setIsAlertModalOpen(true);
                break;
        }
    };

    const exportToCSV = () => {
        const headers = ['Categoría', 'Valor', 'Porcentaje'];
        const rows = data.map(item => {
            const value = Number(item[dataKey]) || 0;
            const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : '0';
            return [
                item.name,
                value.toString(),
                `${percentage}%`
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const tableRows = data.map((item, index) => {
        const value = Number(item[dataKey]) || 0;
        const count = Number(item.count) || 0;
        const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : '0';

        return (
            <TableRow key={index}>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        {item.name}
                    </div>
                </TableCell>
                <TableCell>{count > 0 ? count : '-'}</TableCell>
                <TableCell className="font-mono">{formatCurrency(value)}</TableCell>
                <TableCell>{percentage}%</TableCell>
            </TableRow>
        );
    });

    return (
        <>
            <Card
                className={cn("dark:border-default-100 min-h-[240px] border border-transparent bg-white dark:bg-gray-800", className)}
            >
                <div className="flex flex-col gap-y-2 p-4 pb-0">
                    <div className="flex items-center justify-between gap-x-2">
                        <dt>
                            <h3 className="text-small text-default-500 font-medium">{title}</h3>
                        </dt>
                        {(showDropdown || showOptions) && (
                            <div className="flex items-center justify-end gap-x-2">
                                {showDropdown && (
                                    <Select
                                        aria-label="Time Range"
                                        classNames={{
                                            trigger: "min-w-[100px] min-h-7 h-7",
                                            value: "text-tiny text-default-500!",
                                            selectorIcon: "text-default-500",
                                            popoverContent: "min-w-[120px]",
                                        }}
                                        defaultSelectedKeys={["per-day"]}
                                        listboxProps={{
                                            itemClasses: {
                                                title: "text-tiny",
                                            },
                                        }}
                                        placeholder="Per Day"
                                        size="sm"
                                    >
                                        <SelectItem key="per-day">Per Day</SelectItem>
                                        <SelectItem key="per-week">Per Week</SelectItem>
                                        <SelectItem key="per-month">Per Month</SelectItem>
                                    </Select>
                                )}
                                {showOptions && (
                                    <Dropdown
                                        classNames={{
                                            content: "min-w-[120px]",
                                        }}
                                        placement="bottom-end"
                                    >
                                        <DropdownTrigger>
                                            <Button isIconOnly radius="full" size="sm" variant="light">
                                                <MenuDotsIcon />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu
                                            itemClasses={{
                                                title: "text-tiny",
                                            }}
                                            variant="flat"
                                            onAction={(key) => handleMenuAction(key as string)}
                                        >
                                            <DropdownItem key="view-details">Ver Detalles</DropdownItem>
                                            <DropdownItem key="export-data">Exportar Datos</DropdownItem>
                                            <DropdownItem key="set-alert">Configurar Alerta</DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex h-full flex-wrap items-center justify-center gap-x-2 lg:flex-nowrap">
                    <ResponsiveContainer
                        className="[&_.recharts-surface]:outline-hidden"
                        height={200}
                        width="100%"
                    >
                        <PieChart accessibilityLayer margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <Tooltip
                                content={({ label, payload }) => (
                                    <div className="rounded-medium bg-background text-tiny shadow-small flex h-8 min-w-[120px] items-center gap-x-2 px-1">
                                        <span className="text-foreground font-medium">{label}</span>
                                        {payload?.map((p, index) => {
                                            const name = p.name;
                                            const value = p.value;

                                            return (
                                                <div key={`${index}-${name}`} className="flex w-full items-center gap-x-2">
                                                    <div
                                                        className="h-2 w-2 flex-none rounded-full"
                                                        style={{
                                                            backgroundColor: colors[index % colors.length],
                                                        }}
                                                    />
                                                    <div className="text-default-700 flex w-full items-center justify-between gap-x-2 pr-1 text-xs">
                                                        <span className="text-default-500">{name}</span>
                                                        <span className="text-default-700 font-mono font-medium">
                                                            {formatTotal(value as number)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                cursor={false}
                            />
                            <Pie
                                animationDuration={1000}
                                animationEasing="ease"
                                data={data}
                                dataKey={dataKey}
                                innerRadius="68%"
                                nameKey="name"
                                paddingAngle={-20}
                                strokeWidth={0}
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={colors[index % colors.length]}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="text-tiny text-default-500 flex w-full flex-col justify-center gap-4 p-4 lg:p-0">
                        {categories.map((category, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                        backgroundColor: colors[index % colors.length],
                                    }}
                                />
                                <span className="capitalize">{category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                size="lg"
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <h3 className="text-lg font-semibold">{title} - Detalles</h3>
                    </ModalHeader>
                    <ModalBody>
                        <Table aria-label="Tabla de detalles">
                            <TableHeader>
                                <TableColumn>CATEGORÍA</TableColumn>
                                <TableColumn>CANTIDAD</TableColumn>
                                <TableColumn>VALOR</TableColumn>
                                <TableColumn>PORCENTAJE</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="No hay datos disponibles">
                                {tableRows}
                            </TableBody>
                        </Table>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onPress={() => setIsDetailsModalOpen(false)}>
                            Cerrar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Alert Modal */}
            <Modal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
            >
                <ModalContent>
                    <ModalHeader>Configurar Alerta</ModalHeader>
                    <ModalBody>
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-default-600">
                                La funcionalidad de alertas estará disponible próximamente.
                            </p>
                            <p className="text-sm text-default-500">
                                Podrás configurar notificaciones automáticas cuando los valores excedan ciertos umbrales.
                            </p>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="default" variant="light" onPress={() => setIsAlertModalOpen(false)}>
                            Cerrar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
