/**
 * Generate Rental Contract PDF using native browser Print API
 * Creates a formatted HTML document and triggers the print dialog
 */

const formatDate = (dateString) => {
    if (!dateString) return '_______________';
    return new Date(dateString).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const formatCurrency = (amount) => {
    if (!amount) return '_______________';
    return `$${Number(amount).toLocaleString('es-AR')}`;
};

export const generateContractPDF = (rental, property) => {
    if (!rental || !property) {
        throw new Error('Faltan datos del alquiler o propiedad para generar el contrato');
    }

    const today = new Date().toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Contract HTML Template
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Contrato de Alquiler - ${property.title}</title>
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
        
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
            page-break-before: always;
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
    <div class="header">
        CONTRATO DE LOCACIÓN DE INMUEBLE
    </div>
    
    <div class="section">
        En la ciudad de ____________________, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleDateString('es-AR', { month: 'long' })} de ${new Date().getFullYear()}, entre las partes:
    </div>
    
    <div class="section">
        <span class="highlight">EL LOCADOR:</span> __________________________________________________, DNI N° ____________________, con domicilio en __________________________________________________.
    </div>
    
    <div class="section">
        <span class="highlight">EL LOCATARIO:</span> <span class="highlight">${rental.tenant_name}</span>, DNI N° ____________________, con domicilio en __________________________________________________.
    </div>
    
    <div class="section">
        Se conviene celebrar el presente Contrato de Locación, sujeto a las siguientes cláusulas y condiciones:
    </div>
    
    <div class="section">
        <div class="section-title">PRIMERA: OBJETO</div>
        EL LOCADOR cede en locación a EL LOCATARIO, y este acepta, el inmueble sito en <span class="highlight">${property.address || property.title}</span>, que será destinado exclusivamente a vivienda familiar.
    </div>
    
    <div class="section">
        <div class="section-title">SEGUNDA: PLAZO</div>
        El plazo de la locación se estipula en ____________________ meses, comenzando el día <span class="highlight">${formatDate(rental.start_date)}</span> y finalizando el día <span class="highlight">${formatDate(rental.end_date)}</span>.
    </div>
    
    <div class="section">
        <div class="section-title">TERCERA: PRECIO</div>
        El precio de la locación se fija en la suma de <span class="highlight">${formatCurrency(rental.total_amount)}</span> mensuales, pagaderos por mes adelantado del 1 al 10 de cada mes.
    </div>
    
    <div class="section">
        <div class="section-title">CUARTA: GARANTÍA</div>
        En garantía del fiel cumplimiento de las obligaciones contraídas en el presente contrato, EL LOCATARIO entrega en este acto:
        <br><br>
        _________________________________________________________________________________
    </div>
    
    <div class="section">
        <div class="section-title">QUINTA: OBLIGACIONES</div>
        EL LOCATARIO se obliga a:
        <ul>
            <li>Pagar puntualmente el alquiler y los servicios.</li>
            <li>Mantener el inmueble en buen estado de conservación.</li>
            <li>No realizar reformas sin autorización expresa del LOCADOR.</li>
            <li>Respetar el reglamento de copropiedad si lo hubiere.</li>
        </ul>
    </div>
    
    <div class="section">
        <div class="section-title">SEXTA: RESCISIÓN</div>
        EL LOCATARIO podrá rescindir el contrato transcurridos los seis primeros meses de vigencia, debiendo notificar al LOCADOR con una antelación mínima de un mes.
    </div>
    
    <div class="section">
        <div class="section-title">SÉPTIMA: JURISDICCIÓN</div>
        Para todos los efectos legales derivados de este contrato, las partes se someten a la jurisdicción de los Tribunales Ordinarios de ____________________, renunciando a cualquier otro fuero o jurisdicción.
    </div>
    
    <div class="section">
        En prueba de conformidad, se firman dos ejemplares de un mismo tenor y a un solo efecto, en el lugar y fecha indicados en el encabezamiento.
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
            EL LOCATARIO<br>
            ${rental.tenant_name}
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
