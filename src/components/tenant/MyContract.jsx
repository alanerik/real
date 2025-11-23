import { Card, CardBody, CardHeader, Chip, Divider, Button, Progress } from "@heroui/react";
import {
    getRemainingDays,
    getRentalProgress,
    getServiceIcon,
    getServiceLabel,
    formatRentalType,
    getRentalTypeColor
} from '../../lib/rental-utils';

export default function MyContract({ rental }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'completed': return 'default';
            case 'cancelled': return 'danger';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active': return 'Activo';
            case 'pending': return 'Pendiente';
            case 'completed': return 'Finalizado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const remainingDays = getRemainingDays(rental.end_date);
    const progress = getRentalProgress(rental.start_date, rental.end_date);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contract Progress */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <p className="text-md font-semibold">Progreso del Contrato</p>
                </CardHeader>
                <Divider />
                <CardBody className="gap-3">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <p className="text-sm text-gray-600">Días restantes</p>
                            <p className="text-2xl font-bold text-primary">{remainingDays}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Duración total</p>
                            <p className="text-lg font-semibold">{rental.duration_months || '-'} meses</p>
                        </div>
                    </div>
                    <Progress
                        value={progress}
                        color={progress > 80 ? "warning" : "primary"}
                        className="h-3"
                        showValueLabel
                    />
                    {remainingDays > 0 && remainingDays <= 30 && (
                        <Chip color="warning" variant="flat" size="sm">
                            Contrato próximo a vencer
                        </Chip>
                    )}
                </CardBody>
            </Card>

            {/* Property Information */}
            <Card>
                <CardHeader className="flex gap-3">
                    <div className="flex flex-col">
                        <p className="text-md font-semibold">Información de la Propiedad</p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="gap-4">
                    {rental.properties?.image_url && (
                        <img
                            src={rental.properties.image_url}
                            alt={rental.properties.title}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    )}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {rental.properties?.title}
                        </h3>
                        <p className="text-gray-600 mt-1">
                            {rental.properties?.city}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Dormitorios</p>
                            <p className="font-semibold">{rental.properties?.bedrooms || '-'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Baños</p>
                            <p className="font-semibold">{rental.properties?.bathrooms || '-'}</p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Rental Details */}
            <Card>
                <CardHeader className="flex gap-3">
                    <div className="flex flex-col">
                        <p className="text-md font-semibold">Detalles del Contrato</p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tipo</span>
                        <Chip color={getRentalTypeColor(rental.rental_type || 'long_term')} variant="flat">
                            {formatRentalType(rental.rental_type || 'long_term')}
                        </Chip>
                    </div>

                    <Divider />

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Estado</span>
                        <Chip color={getStatusColor(rental.status)} variant="flat">
                            {getStatusLabel(rental.status)}
                        </Chip>
                    </div>

                    <Divider />

                    <div>
                        <p className="text-gray-600 text-sm">Fecha de Inicio</p>
                        <p className="font-semibold text-lg">{formatDate(rental.start_date)}</p>
                    </div>

                    <div>
                        <p className="text-gray-600 text-sm">Fecha de Finalización</p>
                        <p className="font-semibold text-lg">{formatDate(rental.end_date)}</p>
                    </div>

                    <Divider />

                    <div>
                        <p className="text-gray-600 text-sm">Renta Mensual</p>
                        <p className="font-bold text-2xl text-primary">
                            ${rental.monthly_rent?.toLocaleString()}
                        </p>
                    </div>

                    {rental.deposit_amount && (
                        <div>
                            <p className="text-gray-600 text-sm">Depósito</p>
                            <p className="font-semibold text-lg">
                                ${rental.deposit_amount.toLocaleString()}
                            </p>
                        </div>
                    )}

                    {rental.contract_pdf_url && (
                        <>
                            <Divider />
                            <Button
                                as="a"
                                href={rental.contract_pdf_url}
                                target="_blank"
                                color="primary"
                                variant="flat"
                                className="w-full"
                            >
                                Descargar Contrato (PDF)
                            </Button>
                        </>
                    )}
                </CardBody>
            </Card>

            {/* Services Included */}
            {rental.services_included && rental.services_included.length > 0 && (
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <p className="text-md font-semibold">Servicios Incluidos</p>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <div className="flex flex-wrap gap-2">
                            {rental.services_included.map(service => (
                                <Chip key={service} color="success" variant="flat">
                                    {getServiceLabel(service)}
                                </Chip>
                            ))}
                        </div>
                        {rental.utilities_included_in_rent !== undefined && (
                            <p className={`text-sm mt-3 ${rental.utilities_included_in_rent ? 'text-success' : 'text-warning'}`}>
                                {rental.utilities_included_in_rent
                                    ? "Incluidos en la renta mensual"
                                    : "Se pagan por separado"}
                            </p>
                        )}
                    </CardBody>
                </Card>
            )}

            {/* Conditions and Restrictions */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <p className="text-md font-semibold">Condiciones del Alquiler</p>
                </CardHeader>
                <Divider />
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Pets */}
                        <div>
                            <p className="text-sm text-gray-600 mb-2">Mascotas</p>
                            {rental.pets_allowed ? (
                                <Chip color="success" size="sm">
                                    Permitidas (máx. {rental.max_pets || 0})
                                </Chip>
                            ) : (
                                <Chip color="danger" size="sm">
                                    No permitidas
                                </Chip>
                            )}
                        </div>

                        {/* Smoking */}
                        <div>
                            <p className="text-sm text-gray-600 mb-2">Fumar</p>
                            {rental.smoking_allowed ? (
                                <Chip color="warning" size="sm">
                                    Permitido
                                </Chip>
                            ) : (
                                <Chip color="success" size="sm">
                                    No permitido
                                </Chip>
                            )}
                        </div>

                        {/* Max Occupants */}
                        <div>
                            <p className="text-sm text-gray-600 mb-2">Ocupantes</p>
                            <Chip color="primary" size="sm">
                                Máx. {rental.max_occupants || 2}
                            </Chip>
                        </div>
                    </div>

                    {rental.special_conditions && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Condiciones Especiales:</p>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{rental.special_conditions}</p>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Contact Information */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <p className="text-md font-semibold">Información de Contacto</p>
                </CardHeader>
                <Divider />
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600 text-sm">Inquilino</p>
                            <p className="font-semibold">{rental.tenant_name}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Contacto</p>
                            <p className="font-semibold">{rental.tenant_contact}</p>
                        </div>
                    </div>
                    {rental.notes && (
                        <div className="mt-4">
                            <p className="text-gray-600 text-sm">Notas</p>
                            <p className="text-gray-700">{rental.notes}</p>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
