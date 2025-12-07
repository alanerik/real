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
    Input,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Textarea,
    Select,
    SelectItem,
    Spinner,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    useDisclosure
} from "@heroui/react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useAgentAuth } from '../../hooks/useAgentAuth';
import {
    getAgentLeads,
    updateLeadStatus,
    updateLeadNotes,
    deleteLead,
    createLead,
    LEAD_STATUS_OPTIONS,
    LEAD_SOURCE_OPTIONS,
    type Lead
} from '../../lib/leads';
import { AgentLayout } from './AgentLayout';
import { AgentDashboardHeader } from './AgentDashboardHeader';
import { showToast } from '../ToastManager';

function AgentLeadsManagerContent() {
    const { currentAgent, isCheckingAuth, handleLogout } = useAgentAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterValue, setFilterValue] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isNewOpen, onOpen: onNewOpen, onClose: onNewClose } = useDisclosure();
    const [newLead, setNewLead] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
        source: 'website'
    });

    useEffect(() => {
        if (currentAgent) {
            loadLeads();
        }
    }, [currentAgent]);

    const loadLeads = async () => {
        if (!currentAgent) return;
        setLoading(true);
        try {
            const data = await getAgentLeads(currentAgent.id);
            setLeads(data);
        } catch (error) {
            console.error('Error loading leads:', error);
            showToast({
                title: 'Error',
                description: 'No se pudieron cargar los leads',
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
        const success = await updateLeadStatus(leadId, newStatus);
        if (success) {
            setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
            showToast({
                title: 'Estado actualizado',
                description: `Lead marcado como ${LEAD_STATUS_OPTIONS.find(s => s.uid === newStatus)?.name}`,
                color: 'success'
            });
        }
    };

    const handleDeleteLead = async (leadId: string) => {
        if (!confirm('¿Estás seguro de eliminar este lead?')) return;

        const success = await deleteLead(leadId);
        if (success) {
            setLeads(leads.filter(l => l.id !== leadId));
            showToast({
                title: 'Lead eliminado',
                color: 'success'
            });
        }
    };

    const handleCreateLead = async () => {
        if (!currentAgent || !newLead.name) return;

        const lead = await createLead({
            ...newLead,
            agent_id: currentAgent.id
        });

        if (lead) {
            setLeads([lead, ...leads]);
            setNewLead({ name: '', email: '', phone: '', message: '', source: 'website' });
            onNewClose();
            showToast({
                title: 'Lead creado',
                color: 'success'
            });
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(filterValue.toLowerCase()) ||
            (lead.email?.toLowerCase().includes(filterValue.toLowerCase()) || false) ||
            (lead.phone?.includes(filterValue) || false);
        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" color="success" />
            </div>
        );
    }

    return (
        <AgentLayout currentAgent={currentAgent} handleLogout={handleLogout}>
            {({ onOpenProfile, onOpenSettings }) => (
                <>
                    <AgentDashboardHeader
                        currentAgent={currentAgent}
                        onOpenProfile={onOpenProfile}
                        onOpenSettings={onOpenSettings}
                        title="Mis Leads"
                        subtitle="Gestiona tus contactos y oportunidades"
                    />

                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="w-full sm:w-auto flex-1">
                                {/* Spacer or Search could go here */}
                            </div>
                            <Button
                                color="success"
                                className="bg-emerald-600"
                                onPress={onNewOpen}
                                startContent={<PlusIcon className="w-4 h-4" />}
                            >
                                Nuevo Lead
                            </Button>
                        </CardHeader>
                        <CardBody>
                            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                <Input
                                    placeholder="Buscar por nombre, email o teléfono..."
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                    className="max-w-md"
                                    startContent={<SearchIcon className="w-4 h-4 text-default-400" />}
                                />
                                <Select
                                    label="Estado"
                                    selectedKeys={[statusFilter]}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="max-w-[200px]"
                                >
                                    <SelectItem key="all">Todos</SelectItem>
                                    {LEAD_STATUS_OPTIONS.map(status => (
                                        <SelectItem key={status.uid}>{status.name}</SelectItem>
                                    ))}
                                </Select>
                            </div>

                            <Table aria-label="Tabla de leads">
                                <TableHeader>
                                    <TableColumn>CONTACTO</TableColumn>
                                    <TableColumn>PROPIEDAD</TableColumn>
                                    <TableColumn>FUENTE</TableColumn>
                                    <TableColumn>ESTADO</TableColumn>
                                    <TableColumn>FECHA</TableColumn>
                                    <TableColumn>ACCIONES</TableColumn>
                                </TableHeader>
                                <TableBody
                                    isLoading={loading}
                                    loadingContent={<Spinner />}
                                    emptyContent="No hay leads"
                                >
                                    {filteredLeads.map((lead) => (
                                        <TableRow key={lead.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-default-800">{lead.name}</p>
                                                    {lead.email && <p className="text-sm text-default-500">{lead.email}</p>}
                                                    {lead.phone && <p className="text-sm text-default-500">{lead.phone}</p>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {lead.properties ? (
                                                    <div>
                                                        <p className="text-sm">{lead.properties.title}</p>
                                                        <p className="text-xs text-default-400">{lead.properties.city}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-default-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="sm" variant="flat">
                                                    {LEAD_SOURCE_OPTIONS.find(s => s.uid === lead.source)?.name || lead.source}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <Dropdown>
                                                    <DropdownTrigger>
                                                        <Chip
                                                            size="sm"
                                                            color={LEAD_STATUS_OPTIONS.find(s => s.uid === lead.status)?.color as any || 'default'}
                                                            variant="flat"
                                                            className="cursor-pointer"
                                                        >
                                                            {LEAD_STATUS_OPTIONS.find(s => s.uid === lead.status)?.name || lead.status}
                                                        </Chip>
                                                    </DropdownTrigger>
                                                    <DropdownMenu
                                                        aria-label="Cambiar estado"
                                                        onAction={(key) => handleStatusChange(lead.id, key as Lead['status'])}
                                                    >
                                                        {LEAD_STATUS_OPTIONS.map(status => (
                                                            <DropdownItem key={status.uid}>{status.name}</DropdownItem>
                                                        ))}
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-default-500">
                                                    {formatDate(lead.created_at)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        onPress={() => {
                                                            setSelectedLead(lead);
                                                            onOpen();
                                                        }}
                                                    >
                                                        Ver
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        color="danger"
                                                        onPress={() => handleDeleteLead(lead.id)}
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardBody>
                    </Card>

                    {/* Lead Detail Modal */}
                    <Modal isOpen={isOpen} onClose={onClose} size="lg">
                        <ModalContent>
                            <ModalHeader>Detalle del Lead</ModalHeader>
                            <ModalBody>
                                {selectedLead && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-default-500">Nombre</label>
                                            <p className="font-medium">{selectedLead.name}</p>
                                        </div>
                                        {selectedLead.email && (
                                            <div>
                                                <label className="text-sm text-default-500">Email</label>
                                                <p>{selectedLead.email}</p>
                                            </div>
                                        )}
                                        {selectedLead.phone && (
                                            <div>
                                                <label className="text-sm text-default-500">Teléfono</label>
                                                <p>{selectedLead.phone}</p>
                                            </div>
                                        )}
                                        {selectedLead.message && (
                                            <div>
                                                <label className="text-sm text-default-500">Mensaje</label>
                                                <p className="whitespace-pre-wrap">{selectedLead.message}</p>
                                            </div>
                                        )}
                                        {selectedLead.notes && (
                                            <div>
                                                <label className="text-sm text-default-500">Notas</label>
                                                <p className="whitespace-pre-wrap">{selectedLead.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>Cerrar</Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    {/* New Lead Modal */}
                    <Modal isOpen={isNewOpen} onClose={onNewClose} size="lg">
                        <ModalContent>
                            <ModalHeader>Nuevo Lead</ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <Input
                                        label="Nombre"
                                        value={newLead.name}
                                        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                        isRequired
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={newLead.email}
                                        onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                                    />
                                    <Input
                                        label="Teléfono"
                                        value={newLead.phone}
                                        onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                                    />
                                    <Select
                                        label="Fuente"
                                        selectedKeys={[newLead.source]}
                                        onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                                    >
                                        {LEAD_SOURCE_OPTIONS.map(source => (
                                            <SelectItem key={source.uid}>{source.name}</SelectItem>
                                        ))}
                                    </Select>
                                    <Textarea
                                        label="Mensaje / Notas"
                                        value={newLead.message}
                                        onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onNewClose}>Cancelar</Button>
                                <Button
                                    color="success"
                                    className="bg-emerald-600"
                                    onPress={handleCreateLead}
                                    isDisabled={!newLead.name}
                                >
                                    Crear Lead
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </>
            )}
        </AgentLayout>
    );
}

// Icons
const PlusIcon = (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

const SearchIcon = (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

export default function AgentLeadsManager() {
    return (
        <ThemeProvider>
            <HeroUIProvider>
                <AgentLeadsManagerContent />
            </HeroUIProvider>
        </ThemeProvider>
    );
}
