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
    Spinner,
    Avatar,
    useDisclosure
} from "@heroui/react";
import { HeroUIProvider } from "@heroui/react";
import { supabase } from '../../../lib/supabase';
import { getAllAgents, createAgent, updateAgent, type Agent, type CreateAgentData } from '../../../lib/agents';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { showToast } from '../../ToastManager';
import { AdminLayout } from '../AdminLayout';

function AgentManagerContent() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [formData, setFormData] = useState<CreateAgentData>({
        user_id: '',
        name: '',
        email: '',
        phone: '',
        license_number: '',
        bio: ''
    });
    const [newUserPassword, setNewUserPassword] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        setLoading(true);
        try {
            // Get all agents (including inactive for admin view)
            const { data, error } = await supabase
                .from('agents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAgents(data || []);
        } catch (error) {
            console.error('Error loading agents:', error);
            showToast({
                title: 'Error',
                description: 'No se pudieron cargar los agentes',
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAgent = async () => {
        if (!formData.name || !formData.email || !newUserPassword) {
            showToast({
                title: 'Error',
                description: 'Nombre, email y contraseña son requeridos',
                color: 'danger'
            });
            return;
        }

        setCreating(true);
        try {
            // Create the auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: newUserPassword,
                options: {
                    data: {
                        name: formData.name,
                        role: 'agent'
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('No se pudo crear el usuario');

            // Create the agent record
            const { data: agent, error: agentError } = await supabase
                .from('agents')
                .insert({
                    user_id: authData.user.id,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || null,
                    license_number: formData.license_number || null,
                    bio: formData.bio || null,
                    status: 'active'
                })
                .select()
                .single();

            if (agentError) throw agentError;
            if (!agent) throw new Error('No se pudo crear el agente');

            setAgents([agent, ...agents]);
            onClose();
            setFormData({
                user_id: '',
                name: '',
                email: '',
                phone: '',
                license_number: '',
                bio: ''
            });
            setNewUserPassword('');

            showToast({
                title: 'Agente creado',
                description: `${formData.name} fue agregado como agente.`,
                color: 'success'
            });
        } catch (error: any) {
            console.error('Error creating agent:', error);
            showToast({
                title: 'Error al crear agente',
                description: error.message || 'Error desconocido',
                color: 'danger'
            });
        } finally {
            setCreating(false);
        }
    };

    const handleToggleStatus = async (agent: Agent) => {
        const newStatus = agent.status === 'active' ? 'inactive' : 'active';

        const { error } = await supabase
            .from('agents')
            .update({ status: newStatus })
            .eq('id', agent.id);

        if (error) {
            showToast({
                title: 'Error',
                description: 'No se pudo actualizar el estado',
                color: 'danger'
            });
            return;
        }

        setAgents(agents.map(a => a.id === agent.id ? { ...a, status: newStatus } : a));
        showToast({
            title: 'Estado actualizado',
            description: `Agente ${newStatus === 'active' ? 'activado' : 'desactivado'}`,
            color: 'success'
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <AdminLayout title="Gestión de Agentes">
            <div className="space-y-6">
                <div className="flex justify-end">
                    <Button
                        color="primary"
                        onPress={onOpen}
                        startContent={<PlusIcon className="w-4 h-4" />}
                        className="w-full sm:w-auto"
                    >
                        Nuevo Agente
                    </Button>
                </div>

                <Card>
                    <CardBody>
                        <Table aria-label="Tabla de agentes">
                            <TableHeader>
                                <TableColumn>AGENTE</TableColumn>
                                <TableColumn>CONTACTO</TableColumn>
                                <TableColumn>MATRÍCULA</TableColumn>
                                <TableColumn>ESTADO</TableColumn>
                                <TableColumn>FECHA ALTA</TableColumn>
                                <TableColumn>ACCIONES</TableColumn>
                            </TableHeader>
                            <TableBody
                                isLoading={loading}
                                loadingContent={<Spinner />}
                                emptyContent="No hay agentes registrados"
                            >
                                {agents.map((agent) => (
                                    <TableRow key={agent.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    src={agent.avatar_url || undefined}
                                                    name={agent.name}
                                                    size="sm"
                                                />
                                                <div>
                                                    <p className="font-medium">{agent.name}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm">{agent.email}</p>
                                                {agent.phone && (
                                                    <p className="text-xs text-default-400">{agent.phone}</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {agent.license_number || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                color={agent.status === 'active' ? 'success' : 'danger'}
                                                variant="flat"
                                            >
                                                {agent.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(agent.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                color={agent.status === 'active' ? 'danger' : 'success'}
                                                onPress={() => handleToggleStatus(agent)}
                                            >
                                                {agent.status === 'active' ? 'Desactivar' : 'Activar'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>

                {/* New Agent Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="lg">
                    <ModalContent>
                        <ModalHeader>Nuevo Agente</ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <Input
                                    label="Nombre completo"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    isRequired
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    isRequired
                                    description="Se usará para el login del agente"
                                />
                                <Input
                                    label="Contraseña temporal"
                                    type="password"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    isRequired
                                    description="Mínimo 6 caracteres. El agente podrá cambiarla después"
                                />
                                <Input
                                    label="Teléfono"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                <Input
                                    label="Número de matrícula"
                                    value={formData.license_number || ''}
                                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>Cancelar</Button>
                            <Button
                                color="primary"
                                onPress={handleCreateAgent}
                                isLoading={creating}
                                isDisabled={!formData.name || !formData.email || !newUserPassword}
                            >
                                Crear Agente
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </AdminLayout>
    );
}

// Icons
const PlusIcon = (props: any) => (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

export default function AgentManager() {
    return (
        <ThemeProvider>
            <HeroUIProvider>
                <AgentManagerContent />
            </HeroUIProvider>
        </ThemeProvider>
    );
}
