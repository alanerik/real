import { Card, CardBody, CardHeader, Chip, Divider, Button } from "@heroui/react";

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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
