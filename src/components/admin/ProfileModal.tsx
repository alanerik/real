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
import { supabase } from "../../lib/supabase";
import { showToast } from "../ToastManager";
import type { User as UserType } from "../../types/dashboard";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: UserType | null;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, currentUser }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(currentUser?.user_metadata?.name || "");
    const [email, setEmail] = useState(currentUser?.email || "");
    const [phone, setPhone] = useState(currentUser?.user_metadata?.phone || "");
    const [bio, setBio] = useState(currentUser?.user_metadata?.bio || "");
    const [avatarUrl, setAvatarUrl] = useState(currentUser?.user_metadata?.avatar_url || "");

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.user_metadata?.name || "");
            setEmail(currentUser.email || "");
            setPhone(currentUser.user_metadata?.phone || "");
            setBio(currentUser.user_metadata?.bio || "");
            setAvatarUrl(currentUser.user_metadata?.avatar_url || "");
        }
    }, [currentUser]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    name,
                    phone,
                    bio,
                    avatar_url: avatarUrl,
                }
            });

            if (error) throw error;

            showToast({
                title: "Perfil actualizado",
                description: "Tus cambios se han guardado correctamente",
                color: "success"
            });

            onClose();
            // Reload to reflect changes
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
                    Mi Perfil
                </ModalHeader>
                <ModalBody>
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-center">
                            <Avatar
                                src={avatarUrl}
                                name={name}
                                className="w-24 h-24 text-large"
                                isBordered
                                color="primary"
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
                            label="Teléfono"
                            placeholder="+54 11 1234-5678"
                            value={phone}
                            onValueChange={setPhone}
                            variant="bordered"
                        />

                        <Textarea
                            label="Bio"
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
                    <Button color="primary" onPress={handleSave} isLoading={loading}>
                        Guardar Cambios
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ProfileModal;
