import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
    Avatar,
} from "@heroui/react";
import { updateAgent, type Agent } from "../../lib/agents";
import { showToast } from "../ToastManager";

interface AgentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAgent: Agent | null;
}

const AgentProfileModal: React.FC<AgentProfileModalProps> = ({ isOpen, onClose, currentAgent }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(currentAgent?.name || "");
    const [email, setEmail] = useState(currentAgent?.email || "");
    const [phone, setPhone] = useState(currentAgent?.phone || "");
    const [bio, setBio] = useState(currentAgent?.bio || "");
    const [avatarUrl, setAvatarUrl] = useState(currentAgent?.avatar_url || "");
    const [licenseNumber, setLicenseNumber] = useState(currentAgent?.license_number || "");

    useEffect(() => {
        if (currentAgent) {
            setName(currentAgent.name || "");
            setEmail(currentAgent.email || "");
            setPhone(currentAgent.phone || "");
            setBio(currentAgent.bio || "");
            setAvatarUrl(currentAgent.avatar_url || "");
            setLicenseNumber(currentAgent.license_number || "");
        }
    }, [currentAgent]);

    const handleSave = async () => {
        if (!currentAgent) return;
        setLoading(true);
        try {
            const updatedAgent = await updateAgent(currentAgent.id, {
                name,
                phone,
                bio,
                avatar_url: avatarUrl,
            });

            if (!updatedAgent) throw new Error("Error al actualizar el perfil");

            showToast({
                title: "Perfil actualizado",
                description: "Tus cambios se han guardado correctamente",
                color: "success"
            });

            onClose();
            // Reload to reflect changes since we don't have a global state manager for agent data yet
            window.location.reload();
        } catch (error: any) {
            showToast({
                title: "Error al actualizar perfil",
                description: error.message,
                color: "danger"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    Mi Perfil de Agente
                </ModalHeader>
                <ModalBody>
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-center">
                            <Avatar
                                src={avatarUrl}
                                name={name}
                                className="w-24 h-24 text-large"
                                isBordered
                                color="success"
                            />
                        </div>

                        <Input
                            label="URL de foto de perfil"
                            placeholder="https://ejemplo.com/avatar.jpg"
                            value={avatarUrl}
                            onValueChange={setAvatarUrl}
                            variant="bordered"
                        />

                        <Input
                            label="Nombre completo"
                            placeholder="Ingresa tu nombre"
                            value={name}
                            onValueChange={setName}
                            variant="bordered"
                            isRequired
                        />

                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            variant="bordered"
                            isReadOnly
                            description="El email no se puede modificar"
                        />

                        <Input
                            label="Matrícula / Licencia"
                            value={licenseNumber}
                            variant="bordered"
                            isReadOnly
                            description="Contacta al administrador para modificar tu matrícula"
                        />

                        <Input
                            label="Teléfono"
                            placeholder="+54 11 1234-5678"
                            value={phone}
                            onValueChange={setPhone}
                            variant="bordered"
                        />

                        <Textarea
                            label="Bio / Presentación"
                            placeholder="Cuéntanos algo sobre ti..."
                            value={bio}
                            onValueChange={setBio}
                            variant="bordered"
                            minRows={3}
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                        Cancelar
                    </Button>
                    <Button color="success" className="bg-emerald-600 text-white" onPress={handleSave} isLoading={loading}>
                        Guardar Cambios
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AgentProfileModal;
