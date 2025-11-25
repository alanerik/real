import React from 'react';
import { Tooltip } from "@heroui/react";

export default function RentalTooltip({ rental, children }) {
    // Calculate remaining days
    const today = new Date();
    const endDate = new Date(rental.end_date);
    const remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    // Determine payment status (simplified - would need actual payment data)
    const paymentStatus = rental.payment_status || '✅ Al día';

    const tooltipContent = (
        <div className="px-2 py-1 max-w-xs">
            <div className="text-sm font-bold mb-2">{rental.properties?.title}</div>
            <div className="text-xs space-y-1">
                <div className="flex items-center gap-1">
                    <span>👤</span>
                    <span>{rental.tenant_name}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span>💰</span>
                    <span>${rental.total_amount || 0}/mes</span>
                </div>
                <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>
                        {remainingDays > 0
                            ? `${remainingDays} día${remainingDays !== 1 ? 's' : ''} restante${remainingDays !== 1 ? 's' : ''}`
                            : `Vencido hace ${Math.abs(remainingDays)} día${Math.abs(remainingDays) !== 1 ? 's' : ''}`
                        }
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <span>💳</span>
                    <span>{paymentStatus}</span>
                </div>
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
