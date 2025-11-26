import React from 'react';

export default function PaymentIndicator({ status }) {
    const indicators = {
        ok: { icon: '✅', tooltip: 'Pagos al día' },
        upcoming: { icon: '⚠️', tooltip: 'Pago próximo (7 días)' },
        overdue: { icon: '❌', tooltip: 'Pago atrasado' },
        unknown: { icon: '', tooltip: '' }
    };

    const indicator = indicators[status] || indicators.unknown;

    if (!indicator.icon) return null;

    return (
        <span
            className="ml-1"
            title={indicator.tooltip}
        >
            {indicator.icon}
        </span>
    );
}
