/**
 * Export payment data using native browser APIs
 * No external dependencies required
 */

/**
 * Format date to DD/MM/YYYY
 */
const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Format currency
 */
const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return `$${Number(amount).toLocaleString('es-AR')}`;
};

/**
 * Translate payment status to Spanish
 */
const translateStatus = (status) => {
    const statusMap = {
        'paid': 'Pagado',
        'pending': 'Pendiente',
        'overdue': 'Vencido'
    };
    return statusMap[status] || status;
};

/**
 * Translate payment method to Spanish
 */
const translateMethod = (method) => {
    const methodMap = {
        'cash': 'Efectivo',
        'transfer': 'Transferencia',
        'mercadopago': 'Mercado Pago',
        'other': 'Otro'
    };
    return methodMap[method] || method || '-';
};

/**
 * Calculate payment totals
 */
const calculateTotals = (payments) => {
    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paid = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
    const pending = total - paid;

    return { total, paid, pending };
};

/**
 * Export payments to CSV file
 * Downloads a .csv file that can be opened in Excel or Google Sheets
 */
export const exportToCSV = (payments, rentalInfo) => {
    if (!payments || payments.length === 0) {
        throw new Error('No hay pagos para exportar');
    }

    const today = formatDate(new Date().toISOString());
    const totals = calculateTotals(payments);

    // Build CSV content
    let csv = '';

    // Header section
    csv += 'Historial de Pagos\n';
    csv += `Inquilino,${rentalInfo.tenant_name || 'N/A'}\n`;
    csv += `Propiedad,${rentalInfo.properties?.title || 'N/A'}\n`;
    csv += `Fecha de Exportación,${today}\n`;
    csv += '\n';

    // Column headers
    csv += 'Vencimiento,Monto,Estado,Fecha de Pago,Método,Notas\n';

    // Payment rows
    payments.forEach(payment => {
        const row = [
            formatDate(payment.due_date),
            formatCurrency(payment.amount),
            translateStatus(payment.status),
            formatDate(payment.payment_date),
            translateMethod(payment.payment_method),
            (payment.notes || '').replace(/,/g, ';') // Replace commas in notes
        ];
        csv += row.join(',') + '\n';
    });

    // Totals section
    csv += '\n';
    csv += `Total,${formatCurrency(totals.total)}\n`;
    csv += `Pagado,${formatCurrency(totals.paid)}\n`;
    csv += `Pendiente,${formatCurrency(totals.pending)}\n`;

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `pagos_${rentalInfo.tenant_name?.replace(/\s+/g, '_')}_${today.replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

/**
 * Export payments to PDF via browser print dialog
 * Opens a new window with formatted content and triggers print dialog
 */
export const exportToPDF = (payments, rentalInfo) => {
    if (!payments || payments.length === 0) {
        throw new Error('No hay pagos para exportar');
    }

    const today = formatDate(new Date().toISOString());
    const totals = calculateTotals(payments);

    // Build HTML content
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Historial de Pagos - ${rentalInfo.tenant_name}</title>
    <style>
        @media print {
            @page {
                margin: 2cm;
            }
        }
        
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
            color: #1a1a1a;
        }
        
        .info {
            margin: 20px 0;
            font-size: 14px;
        }
        
        .info-row {
            margin: 5px 0;
        }
        
        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 150px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 12px;
        }
        
        th {
            background-color: #f0f0f0;
            padding: 12px 8px;
            text-align: left;
            border: 1px solid #ddd;
            font-weight: bold;
        }
        
        td {
            padding: 10px 8px;
            border: 1px solid #ddd;
        }
        
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .status-paid {
            color: #059669;
            font-weight: bold;
        }
        
        .status-pending {
            color: #d97706;
            font-weight: bold;
        }
        
        .status-overdue {
            color: #dc2626;
            font-weight: bold;
        }
        
        .totals {
            margin-top: 30px;
            padding: 20px;
            background-color: #f0f0f0;
            border-radius: 5px;
        }
        
        .totals-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 14px;
        }
        
        .totals-row.total {
            font-weight: bold;
            font-size: 16px;
            border-top: 2px solid #333;
            padding-top: 10px;
            margin-top: 10px;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Historial de Pagos</h1>
    </div>
    
    <div class="info">
        <div class="info-row">
            <span class="info-label">Inquilino:</span>
            <span>${rentalInfo.tenant_name || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Propiedad:</span>
            <span>${rentalInfo.properties?.title || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Fecha de Exportación:</span>
            <span>${today}</span>
        </div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Vencimiento</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha de Pago</th>
                <th>Método</th>
                <th>Notas</th>
            </tr>
        </thead>
        <tbody>
            ${payments.map(payment => `
                <tr>
                    <td>${formatDate(payment.due_date)}</td>
                    <td>${formatCurrency(payment.amount)}</td>
                    <td class="status-${payment.status}">${translateStatus(payment.status)}</td>
                    <td>${formatDate(payment.payment_date)}</td>
                    <td>${translateMethod(payment.payment_method)}</td>
                    <td>${payment.notes || '-'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="totals">
        <div class="totals-row">
            <span>Total:</span>
            <span>${formatCurrency(totals.total)}</span>
        </div>
        <div class="totals-row">
            <span>Pagado:</span>
            <span>${formatCurrency(totals.paid)}</span>
        </div>
        <div class="totals-row total">
            <span>Pendiente:</span>
            <span>${formatCurrency(totals.pending)}</span>
        </div>
    </div>
    
    <div class="footer">
        <p>Documento generado automáticamente - ${today}</p>
    </div>
    
    <script>
        // Auto-trigger print dialog when page loads
        window.onload = function() {
            window.print();
            // Close window after printing or canceling
            window.onafterprint = function() {
                window.close();
            };
        };
    </script>
</body>
</html>
    `;

    // Open new window with the HTML content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        throw new Error('No se pudo abrir la ventana de impresión. Verifica que los pop-ups estén habilitados.');
    }

    printWindow.document.write(html);
    printWindow.document.close();
};
