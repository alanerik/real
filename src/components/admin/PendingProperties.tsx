import { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Textarea,
    Spinner,
    Avatar,
    useDisclosure,
    Image
} from "@heroui/react";
import { HeroUIProvider } from "@heroui/react";
import { supabase } from '../../lib/supabase';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { showToast } from '../ToastManager';

interface PendingProperty {
    id: string;
    title: string;
    city: string;
    price: number;
    currency: string;
    operation: string;
    property_type: string;
    approval_status: string;
    image_url?: string;
    created_at: string;
    agent_id: string;
    agents?: {
        id: string;
        name: string;
        email: string;
    };
}

function PendingPropertiesContent() {
    const [properties, setProperties] = useState<PendingProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState<PendingProperty | null>(null);
    const [rejectionNote, setRejectionNote] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('properties')
                .select(`
                    *,
                    agents (
                        id,
                        name,
                        email
                    )
                `)
                .eq('approval_status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProperties(data || []);
        } catch (error) {
            console.error('Error loading properties:', error);
            showToast({
                title: 'Error',
                description: 'No se pudieron cargar las propiedades',
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (property: PendingProperty) => {
        setProcessing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('properties')
                .update({
                    approval_status: 'approved',
                    approved_at: new Date().toISOString(),
                    approved_by: user?.id
                })
                .eq('id', property.id);

            if (error) throw error;

            setProperties(properties.filter(p => p.id !== property.id));
            showToast({
                title: 'Propiedad aprobada',
                description: `"${property.title}" ahora está visible en el sitio`,
                color: 'success'
            });
        } catch (error) {
            console.error('Error approving property:', error);
            showToast({
                title: 'Error',
                description: 'No se pudo aprobar la propiedad',
                color: 'danger'
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedProperty) return;

        setProcessing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('properties')
                .update({
                    approval_status: 'rejected',
                    approval_notes: rejectionNote,
                    approved_at: new Date().toISOString(),
                    approved_by: user?.id
                })
                .eq('id', selectedProperty.id);

            if (error) throw error;

            setProperties(properties.filter(p => p.id !== selectedProperty.id));
            onRejectClose();
            setRejectionNote('');
            setSelectedProperty(null);

            showToast({
                title: 'Propiedad rechazada',
                description: 'Se notificará al agente',
                color: 'warning'
            });
        } catch (error) {
            console.error('Error rejecting property:', error);
            showToast({
                title: 'Error',
                description: 'No se pudo rechazar la propiedad',
                color: 'danger'
            });
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency || 'USD',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Propiedades Pendientes</h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button
                        color="default"
                        variant="light"
                        onPress={() => window.location.href = '/admin/dashboard'}
                        className="w-full sm:w-auto"
                    >
                        <span className="hidden sm:inline">Volver al Dashboard</span>
                        <span className="sm:hidden">Dashboard</span>
                    </Button>
                    <Chip color="warning" variant="flat" size="lg">
                        {properties.length} pendientes
                    </Chip>
                </div>
            </div>

            <Card>
                <CardBody>
                    <Table aria-label="Tabla de propiedades pendientes">
                        <TableHeader>
                            <TableColumn>PROPIEDAD</TableColumn>
                            <TableColumn>AGENTE</TableColumn>
                            <TableColumn>PRECIO</TableColumn>
                            <TableColumn>TIPO</TableColumn>
                            <TableColumn>FECHA ENVÍO</TableColumn>
                            <TableColumn>ACCIONES</TableColumn>
                        </TableHeader>
                        <TableBody
                            isLoading={loading}
                            loadingContent={<Spinner />}
                            emptyContent="No hay propiedades pendientes de aprobación 🎉"
                        >
                            {properties.map((property) => (
                                <TableRow key={property.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                src={property.image_url || undefined}
                                                name={property.title[0]}
                                                size="lg"
                                                radius="md"
                                            />
                                            <div>
                                                <p className="font-medium">{property.title}</p>
                                                <p className="text-sm text-default-400">{property.city}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{property.agents?.name || 'Sin agente'}</p>
                                            <p className="text-xs text-default-400">{property.agents?.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold">
                                            {formatPrice(property.price, property.currency)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Chip size="sm" variant="flat">
                                                {property.operation === 'venta' ? 'Venta' : 'Alquiler'}
                                            </Chip>
                                            <span className="text-xs text-default-400 capitalize">
                                                {property.property_type}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-default-500">
                                            {formatDate(property.created_at)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="light"
                                                onPress={() => {
                                                    setSelectedProperty(property);
                                                    onOpen();
                                                }}
                                            >
                                                Ver
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="success"
                                                variant="flat"
                                                onPress={() => handleApprove(property)}
                                                isLoading={processing}
                                            >
                                                Aprobar
                                            </Button>
                                            <Button
                                                size="sm"
                                                color="danger"
                                                variant="flat"
                                                onPress={() => {
                                                    setSelectedProperty(property);
                                                    onRejectOpen();
                                                }}
                                            >
                                                Rechazar
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* Property Detail Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalContent>
                    <ModalHeader>Detalle de Propiedad</ModalHeader>
                    <ModalBody>
                        {selectedProperty && (
                            <div className="space-y-4">
                                {selectedProperty.image_url && (
                                    <Image
                                        src={selectedProperty.image_url}
                                        alt={selectedProperty.title}
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-default-500">Título</label>
                                        <p className="font-medium">{selectedProperty.title}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-default-500">Ubicación</label>
                                        <p>{selectedProperty.city}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-default-500">Precio</label>
                                        <p className="font-semibold">
                                            {formatPrice(selectedProperty.price, selectedProperty.currency)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-default-500">Operación</label>
                                        <p className="capitalize">{selectedProperty.operation}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-default-500">Tipo</label>
                                        <p className="capitalize">{selectedProperty.property_type}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-default-500">Agente</label>
                                        <p>{selectedProperty.agents?.name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>Cerrar</Button>
                        <Button
                            color="success"
                            onPress={() => {
                                if (selectedProperty) {
                                    handleApprove(selectedProperty);
                                    onClose();
                                }
                            }}
                        >
                            Aprobar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Reject Modal */}
            <Modal isOpen={isRejectOpen} onClose={onRejectClose}>
                <ModalContent>
                    <ModalHeader>Rechazar Propiedad</ModalHeader>
                    <ModalBody>
                        <p className="text-default-500 mb-4">
                            Indica el motivo del rechazo para que el agente pueda corregirlo:
                        </p>
                        <Textarea
                            label="Motivo del rechazo"
                            placeholder="Ej: Faltan fotos de la cocina, el precio parece incorrecto..."
                            value={rejectionNote}
                            onChange={(e) => setRejectionNote(e.target.value)}
                            minRows={3}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onRejectClose}>Cancelar</Button>
                        <Button
                            color="danger"
                            onPress={handleReject}
                            isLoading={processing}
                        >
                            Rechazar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}

const BackIcon = (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

export default function PendingProperties() {
    return (
        <ThemeProvider>
            <HeroUIProvider>
                <PendingPropertiesContent />
            </HeroUIProvider>
        </ThemeProvider>
    );
}
