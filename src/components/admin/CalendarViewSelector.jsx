import React from 'react';
import { Tabs, Tab } from "@heroui/react";

export default function CalendarViewSelector({ view, onViewChange }) {
    return (
        <Tabs
            selectedKey={view}
            onSelectionChange={onViewChange}
            aria-label="Vistas del calendario"
            color="primary"
            variant="underlined"
        >
            <Tab key="month" title="Mes" />
            <Tab key="week" title="Semana" />
            <Tab key="day" title="Día" />
        </Tabs>
    );
}
