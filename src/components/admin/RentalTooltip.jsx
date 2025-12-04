import React from 'react';
import { Tooltip } from "@heroui/react";

export default function RentalTooltip({ rental, children }) {
    // Calculate remaining days
    const today = new Date();
    const endDate = new Date(rental.end_date);
    const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    // Payment status text and color
    const getPaymentStatusInfo = (status) => {
        const statusInfo = {
            ok: { text: 'Pagos al día', color: 'text-green-600' },
            upcoming: { text: 'Pago próximo (7 días)', color: 'text-yellow-600' },
            overdue: { text: 'Pago atrasado', color: 'text-red-600' },
            unknown: { text: 'Sin información de pagos', color: 'text-gray-500' }
        };
        return statusInfo[status] || statusInfo.unknown;
    };

    const paymentInfo = getPaymentStatusInfo(rental.paymentStatus);

    // Get upcoming pending payments
    const pendingPayments = rental.payments?.filter(p => p.status === 'pending').slice(0, 3) || [];

    const tooltipContent = (
        <div className="px-2 py-1 max-w-xs">
            <div className="text-sm font-bold mb-2">{rental.properties?.title}</div>
            <div className="text-xs space-y-1">
                <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Inquilino:</span>
                    <span>{rental.tenant_name}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Monto:</span>
                    <span>${rental.total_amount || 0}/mes</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Vencimiento:</span>
                    <span>
                        {remainingDays > 0
                            ? `${remainingDays} día${remainingDays !== 1 ? 's' : ''} restante${remainingDays !== 1 ? 's' : ''}`
                            : `Vencido hace ${Math.abs(remainingDays)} día${Math.abs(remainingDays) !== 1 ? 's' : ''}`
                        }
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Estado:</span>
                    <span className={paymentInfo.color}>{paymentInfo.text}</span>
                </div>

                {/* Show pending payments if any */}
                {pendingPayments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="font-semibold mb-1">Próximos pagos:</div>
                        {pendingPayments.map(payment => (
                            <div key={payment.id} className="text-xs text-gray-600">
                                ${payment.amount} - Vence: {payment.due_date}
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-gray-500 mt-2 pt-2 border-t border-gray-200">
                    {rental.start_date} → {rental.end_date}
                </div>
            </div>
        </div>
    );

    return (
        <Tooltip
            content={tooltipContent}
            placement="top"
            delay={300}
            closeDelay={100}
        >
            {children}
        </Tooltip>
    );
}
