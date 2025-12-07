import { Card, CardBody, CardHeader, Divider, Button, Chip, Progress } from "@heroui/react";
import { getRemainingDays, getRentalProgress } from '../../lib/rental-utils';

// Next Payment Widget
export function NextPaymentWidget({ payment, hasReceipt, onUploadReceipt }) {
    if (!payment) {
        return (
            <Card className="h-full">
                <CardBody className="flex flex-col justify-center items-center py-8">
                    <p className="text-sm text-gray-500">No hay pagos pendientes</p>
                </CardBody>
            </Card>
        );
    }

    const dueDate = new Date(payment.due_date);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    const isOverdue = daysUntilDue < 0;
    const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7;

    const getStatusColor = () => {
        if (isOverdue) return 'danger';
        if (isDueSoon) return 'warning';
        return 'success';
    };

    const getStatusText = () => {
        if (isOverdue) return `Vencido hace ${Math.abs(daysUntilDue)} días`;
        if (daysUntilDue === 0) return 'Vence hoy';
        if (daysUntilDue === 1) return 'Vence mañana';
        return `Vence en ${daysUntilDue} días`;
    };

    return (
        <Card className={`h-full ${isOverdue ? 'border-2 border-danger' : ''}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">💳</span>
                    <p className="text-sm font-semibold text-gray-600">Próximo Pago</p>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-2">
                <div className="flex justify-between items-center">
                    <p className="text-3xl font-bold text-gray-900">
                        ${payment.amount?.toLocaleString()}
                    </p>
                </div>
                <Chip
                    color={getStatusColor()}
                    variant="flat"
                    size="sm"
                    className="mt-1"
                >
                    {getStatusText()}
                </Chip>
                <p className="text-xs text-gray-500 mt-2">
                    Vencimiento: {dueDate.toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'long'
                    })}
                </p>

                {!hasReceipt && onUploadReceipt && (
                    <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => onUploadReceipt(payment.id)}
                        className="mt-2"
                        startContent={<UploadIcon />}
                    >
                        Subir Comprobante
                    </Button>
                )}

                {hasReceipt && (
                    <Chip color="success" variant="flat" size="sm" className="mt-2">
                        ✓ Comprobante adjunto
                    </Chip>
                )}
            </CardBody>
        </Card>
    );
}

// Maintenance Status Widget
export function MaintenanceStatusWidget({ tickets, onReportClick }) {
    const openTickets = tickets?.filter(t => t.status !== 'completed' && t.status !== 'cancelled') || [];
    const urgentTickets = openTickets.filter(t => t.priority === 'high' || t.priority === 'urgent');

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🔧</span>
                    <p className="text-sm font-semibold text-gray-600">Mantenimiento</p>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-3">
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-secondary-600">
                        {openTickets.length}
                    </p>
                    <p className="text-sm text-gray-500">ticket{openTickets.length !== 1 ? 's' : ''} abierto{openTickets.length !== 1 ? 's' : ''}</p>
                </div>

                {urgentTickets.length > 0 && (
                    <Chip color="danger" variant="flat" size="sm">
                        {urgentTickets.length} urgente{urgentTickets.length !== 1 ? 's' : ''}
                    </Chip>
                )}

                <Button
                    size="sm"
                    color="secondary"
                    variant="flat"
                    onPress={onReportClick}
                    className="mt-2"
                >
                    Reportar Problema
                </Button>
            </CardBody>
        </Card>
    );
}

// Contract Progress Widget
export function ContractProgressWidget({ rental }) {
    if (!rental) return null;

    const remainingDays = getRemainingDays(rental.end_date);
    const progress = getRentalProgress(rental.start_date, rental.end_date);
    const isNearExpiration = remainingDays > 0 && remainingDays <= 30;

    return (
        <Card className={`h-full ${isNearExpiration ? 'border-2 border-warning' : ''}`}>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">📅</span>
                    <p className="text-sm font-semibold text-gray-600">Contrato</p>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-3">
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-primary">
                        {remainingDays}
                    </p>
                    <p className="text-sm text-gray-500">días restantes</p>
                </div>

                <Progress
                    value={progress}
                    color={progress > 80 ? "warning" : "primary"}
                    className="h-2"
                    aria-label="Progreso del contrato"
                />

                {isNearExpiration && (
                    <Chip color="warning" variant="flat" size="sm" className="mt-1">
                        Próximo a vencer
                    </Chip>
                )}

                <p className="text-xs text-gray-500">
                    {progress.toFixed(0)}% completado
                </p>
            </CardBody>
        </Card>
    );
}

// Quick Actions Widget
export function QuickActionsWidget({ onAction }) {
    const actions = [
        {
            key: 'payments',
            label: 'Pagos',
            icon: '💳',
            color: 'primary'
        },
        {
            key: 'documents',
            label: 'Documentos',
            icon: '📄',
            color: 'secondary'
        },
        {
            key: 'report',
            label: 'Reportar',
            icon: '🔧',
            color: 'warning'
        },
        {
            key: 'contract',
            label: 'Contrato',
            icon: '📋',
            color: 'success'
        }
    ];

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <p className="text-sm font-semibold text-gray-600">Accesos Rápidos</p>
                </div>
            </CardHeader>
            <Divider />
            <CardBody>
                <div className="grid grid-cols-2 gap-2">
                    {actions.map(action => (
                        <Button
                            key={action.key}
                            size="sm"
                            color={action.color}
                            variant="flat"
                            onPress={() => onAction(action.key)}
                            className="h-14 flex flex-col items-center justify-center"
                        >
                            <span className="text-xl mb-1">{action.icon}</span>
                            <span className="text-xs">{action.label}</span>
                        </Button>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}

const UploadIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);
