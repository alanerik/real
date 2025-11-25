import React from 'react';
import { Card, CardBody, Chip } from "@heroui/react";

export default function CalendarLegend() {
    return (
        <Card className="mb-4">
            <CardBody>
                <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-sm font-semibold">Leyenda:</span>
                    <Chip size="sm" color="primary" variant="flat">Pendiente</Chip>
                    <Chip size="sm" color="success" variant="flat">Activo</Chip>
                    <Chip size="sm" color="warning" variant="flat">Próximo a Vencer</Chip>
                    <Chip size="sm" color="danger" variant="flat">Vencido</Chip>
                    <Chip size="sm" color="default" variant="flat">Terminado/Cancelado</Chip>
                </div>
            </CardBody>
        </Card>
    );
}
