/**
 * Generate Rental Contract PDF using native browser Print API
 * Creates a formatted HTML document and triggers the print dialog
 * 
 * SECURITY: All user inputs are sanitized to prevent XSS attacks
 */

import { escapeHtml, formatDateSafe, formatCurrencySafe } from './sanitize.ts';

export const generateContractPDF = (rental, property, type = 'annual') => {
    if (!rental || !property) {
        throw new Error('Faltan datos del alquiler o propiedad para generar el contrato');
    }

    // Sanitize all user-provided data to prevent XSS
    const safeTenantName = escapeHtml(rental.tenant_name);
    const safePropertyAddress = escapeHtml(property.address || property.title);
    const safePropertyTitle = escapeHtml(property.title);
    const safeStartDate = formatDateSafe(rental.start_date);
    const safeEndDate = formatDateSafe(rental.end_date);
    const safeAmount = formatCurrencySafe(rental.total_amount);

    const getAnnualContractHTML = () => `
    <div class="header">
        CONTRATO DE LOCACIÓN DE VIVIENDA (ANUAL)
    </div>
    
    <div class="section">
        En la ciudad de ____________________, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleDateString('es-AR', { month: 'long' })} de ${new Date().getFullYear()}, entre las partes:
    </div>
    
    <div class="section">
        <span class="highlight">EL LOCADOR:</span> __________________________________________________, DNI N° ____________________, con domicilio en __________________________________________________.
    </div>
    
    <div class="section">
        <span class="highlight">EL LOCATARIO:</span> <span class="highlight">${safeTenantName}</span>, DNI N° ____________________, con domicilio en __________________________________________________.
    </div>
    
    <div class="section">
        Se conviene celebrar el presente Contrato de Locación de Vivienda Permanente, sujeto a las siguientes cláusulas:
    </div>
    
    <div class="section">
        <div class="section-title">PRIMERA: OBJETO</div>
        EL LOCADOR cede en locación a EL LOCATARIO, y este acepta, el inmueble sito en <span class="highlight">${safePropertyAddress}</span>, que será destinado exclusivamente a vivienda familiar permanente.
    </div>
    
    <div class="section">
        <div class="section-title">SEGUNDA: PLAZO</div>
        El plazo de la locación se estipula en <span class="highlight">36 (treinta y seis) meses</span>, comenzando el día <span class="highlight">${safeStartDate}</span> y finalizando el día <span class="highlight">${safeEndDate}</span>.
    </div>
    
    <div class="section">
        <div class="section-title">TERCERA: PRECIO Y AJUSTE</div>
        El precio inicial de la locación se fija en la suma de <span class="highlight">${safeAmount}</span> mensuales. Este monto se ajustará anualmente según el Índice de Contratos de Locación (ICL) publicado por el BCRA.
    </div>
    
    <div class="section">
        <div class="section-title">CUARTA: GARANTÍA</div>
        En garantía del fiel cumplimiento de las obligaciones, EL LOCATARIO presenta: ________________________________________________________________.
    </div>
    
    <div class="section">
        <div class="section-title">QUINTA: OBLIGACIONES Y SERVICIOS</div>
        EL LOCATARIO asume el pago de:
        <ul>
            <li>Servicios de luz, gas, agua y desagües cloacales.</li>
            <li>Expensas ordinarias.</li>
            <li>Tasas e impuestos municipales.</li>
        </ul>
    </div>
    
    <div class="section">
        <div class="section-title">SEXTA: RESCISIÓN ANTICIPADA</div>
        EL LOCATARIO podrá rescindir el contrato transcurridos los seis primeros meses, notificando con un mes de antelación. Si la rescisión es en el primer año, abonará una indemnización de un mes y medio de alquiler; si es después, de un mes.
    </div>
    `;

    const getVacationContractHTML = () => `
    <div class="header">
        CONTRATO DE ALQUILER TEMPORARIO / VACACIONAL
    </div>
    
    <div class="section">
        En la ciudad de ____________________, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleDateString('es-AR', { month: 'long' })} de ${new Date().getFullYear()}, entre las partes:
    </div>
    
    <div class="section">
        <span class="highlight">EL LOCADOR:</span> __________________________________________________, DNI N° ____________________.
    </div>
    
    <div class="section">
        <span class="highlight">EL HUÉSPED:</span> <span class="highlight">${safeTenantName}</span>, DNI N° ____________________, con domicilio en __________________________________________________.
    </div>
    
    <div class="section">
        Se conviene celebrar el presente Contrato de Alquiler Temporario con fines turísticos, sujeto a las siguientes cláusulas:
    </div>
    
    <div class="section">
        <div class="section-title">PRIMERA: OBJETO</div>
        EL LOCADOR cede el uso y goce temporal del inmueble sito en <span class="highlight">${safePropertyAddress}</span>, amueblado y equipado según inventario anexo.
    </div>
    
    <div class="section">
        <div class="section-title">SEGUNDA: PLAZO IMPRORROGABLE</div>
        El plazo es improrrogable, desde el día <span class="highlight">${safeStartDate}</span> a las ____ hs, hasta el día <span class="highlight">${safeEndDate}</span> a las ____ hs. La permanencia indebida devengará una multa diaria de USD 100.
    </div>
    
    <div class="section">
        <div class="section-title">TERCERA: PRECIO TOTAL</div>
        El precio total y único por todo el período se fija en <span class="highlight">${safeAmount}</span>, que se abona en su totalidad antes del ingreso.
    </div>
    
    <div class="section">
        <div class="section-title">CUARTA: DEPÓSITO DE GARANTÍA</div>
        EL HUÉSPED entrega en este acto la suma de ____________________ en concepto de depósito de garantía, que será devuelto al finalizar la locación previa verificación del estado del inmueble e inventario.
    </div>
    
    <div class="section">
        <div class="section-title">QUINTA: SERVICIOS E INVENTARIO</div>
        El precio incluye los servicios de luz, gas, agua, TV por cable e Internet. EL HUÉSPED declara recibir el inmueble y los muebles en perfecto estado de conservación y funcionamiento.
    </div>
    
    <div class="section">
        <div class="section-title">SEXTA: PROHIBICIONES</div>
        Queda prohibido:
        <ul>
            <li>Alojar a más personas que las pactadas (Máximo: ____ personas).</li>
            <li>Cambiar el destino de vivienda turística.</li>
            <li>Realizar fiestas o ruidos molestos.</li>
            <li>Subarrendar la propiedad.</li>
        </ul>
    </div>
    `;

    const contentHTML = type === 'vacation' ? getVacationContractHTML() : getAnnualContractHTML();

    // Contract HTML Template
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Contrato - ${safePropertyTitle}</title>
    <style>
        @media print {
            @page {
                margin: 2.5cm;
                size: A4;
            }
            body {
                -webkit-print-color-adjust: exact;
            }
        }
        
        body {
            font-family: "Times New Roman", Times, serif;
            line-height: 1.6;
            color: #000;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 18px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
        }
        
        .section {
            margin-bottom: 20px;
            text-align: justify;
        }
        
        .section-title {
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        
        .highlight {
            font-weight: bold;
        }
        
        .signatures {
            margin-top: 80px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }
        
        .signature-box {
            width: 45%;
            border-top: 1px solid #000;
            padding-top: 10px;
            text-align: center;
        }
        
        ul {
            list-style-type: none;
            padding-left: 20px;
        }
        
        li {
            margin-bottom: 5px;
        }
        
        li:before {
            content: "• ";
            font-weight: bold;
        }
    </style>
</head>
<body>
    ${contentHTML}
    
    <div class="section">
        <div class="section-title">JURISDICCIÓN</div>
        Para todos los efectos legales, las partes se someten a la jurisdicción de los Tribunales Ordinarios de ____________________.
    </div>
    
    <div class="section">
        En prueba de conformidad, se firman dos ejemplares de un mismo tenor y a un solo efecto.
    </div>
    
    <div class="signatures">
        <div class="signature-box">
            <br><br>
            __________________________<br>
            EL LOCADOR
        </div>
        <div class="signature-box">
            <br><br>
            __________________________<br>
            ${type === 'vacation' ? 'EL HUÉSPED' : 'EL LOCATARIO'}<br>
            ${safeTenantName}
        </div>
    </div>
    
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
                // Optional: Close window after print
                // window.onafterprint = function() { window.close(); };
            }, 500);
        };
    </script>
</body>
</html>
    `;

    // Open new window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        throw new Error('No se pudo abrir la ventana. Por favor habilita los pop-ups.');
    }

    printWindow.document.write(html);
    printWindow.document.close();
};
