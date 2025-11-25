import React from 'react';
import { Select, SelectItem, Button, Card, CardBody } from "@heroui/react";

export default function CalendarFilters({
    properties = [],
    selectedProperty,
    selectedStatuses,
    selectedTypes,
    onPropertyChange,
    onStatusChange,
    onTypeChange,
    onClearFilters
}) {
    const statuses = [
        { key: 'pending', label: 'Pendiente' },
        { key: 'active', label: 'Activo' },
        { key: 'near_expiration', label: 'Próximo a Vencer' },
        { key: 'expired', label: 'Vencido' },
        { key: 'terminated', label: 'Terminado' },
        { key: 'cancelled', label: 'Cancelado' }
    ];

    const types = [
        { key: 'long_term', label: 'Anual' },
        { key: 'temporary', label: 'Temporal' },
        { key: 'vacation', label: 'Vacacional' }
    ];

    return (
        <Card className="mb-4">
            <CardBody>
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold">Filtros</h3>
                        <Button
                            size="sm"
                            variant="light"
                            onPress={onClearFilters}
                        >
                            Limpiar filtros
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Filtro por Propiedad */}
                        <Select
                            label="Propiedad"
                            placeholder="Todas las propiedades"
                            selectedKeys={selectedProperty ? [selectedProperty] : ['all']}
                            onChange={(e) => onPropertyChange(e.target.value)}
                            size="sm"
                        >
                            <SelectItem key="all" value="all">Todas</SelectItem>
                            {properties.map((prop) => (
                                <SelectItem key={prop.id} value={prop.id}>
                                    {prop.data?.title || prop.title}
                                </SelectItem>
                            ))}
                        </Select>

                        {/* Filtro por Estado */}
                        <Select
                            label="Estado"
                            placeholder="Todos los estados"
                            selectionMode="multiple"
                            selectedKeys={selectedStatuses}
                            onSelectionChange={onStatusChange}
                            size="sm"
                        >
                            {statuses.map((status) => (
                                <SelectItem key={status.key} value={status.key}>
                                    {status.label}
                                </SelectItem>
                            ))}
                        </Select>

                        {/* Filtro por Tipo */}
                        <Select
                            label="Tipo de Alquiler"
                            placeholder="Todos los tipos"
                            selectionMode="multiple"
                            selectedKeys={selectedTypes}
                            onSelectionChange={onTypeChange}
                            size="sm"
                        >
                            {types.map((type) => (
                                <SelectItem key={type.key} value={type.key}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
