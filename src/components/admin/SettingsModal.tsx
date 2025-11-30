import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Switch,
    Select,
    SelectItem,
} from "@heroui/react";
import { showToast } from "../ToastManager";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Settings {
    darkMode: boolean;
    currency: string;
    dateFormat: string;
    emailNotifications: boolean;
    timezone: string;
    interfaceDensity: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [settings, setSettings] = useState<Settings>({
        darkMode: false,
        currency: "USD",
        dateFormat: "DD/MM/YYYY",
        emailNotifications: true,
        timezone: "America/Argentina/Buenos_Aires",
        interfaceDensity: "comfortable",
    });

    useEffect(() => {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem("userSettings");
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleSave = () => {
        // Save to localStorage
        localStorage.setItem("userSettings", JSON.stringify(settings));

        // Apply dark mode immediately
        if (settings.darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        showToast({
            title: "Configuración guardada",
            description: "Tus preferencias se han actualizado correctamente. Recargando...",
            color: "success"
        });

        onClose();

        // Reload to apply all changes universally
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    Configuraciones
                </ModalHeader>
                <ModalBody>
                    <div className="flex flex-col gap-6">
                        {/* Dark Mode */}
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Modo oscuro</p>
                                <p className="text-sm text-default-500">Cambiar entre tema claro y oscuro</p>
                            </div>
                            <Switch
                                isSelected={settings.darkMode}
                                onValueChange={(value) => setSettings({ ...settings, darkMode: value })}
                            />
                        </div>

                        {/* Currency */}
                        <Select
                            label="Moneda predeterminada"
                            placeholder="Selecciona una moneda"
                            selectedKeys={[settings.currency]}
                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                            variant="bordered"
                        >
                            <SelectItem key="USD">USD - Dólar estadounidense</SelectItem>
                            <SelectItem key="ARS">ARS - Peso argentino</SelectItem>
                            <SelectItem key="EUR">EUR - Euro</SelectItem>
                        </Select>

                        {/* Date Format */}
                        <Select
                            label="Formato de fecha"
                            placeholder="Selecciona un formato"
                            selectedKeys={[settings.dateFormat]}
                            onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                            variant="bordered"
                        >
                            <SelectItem key="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem key="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem key="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </Select>

                        {/* Email Notifications */}
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Notificaciones por email</p>
                                <p className="text-sm text-default-500">Recibir alertas importantes por correo</p>
                            </div>
                            <Switch
                                isSelected={settings.emailNotifications}
                                onValueChange={(value) => setSettings({ ...settings, emailNotifications: value })}
                            />
                        </div>

                        {/* Timezone */}
                        <Select
                            label="Zona horaria"
                            placeholder="Selecciona tu zona horaria"
                            selectedKeys={[settings.timezone]}
                            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                            variant="bordered"
                        >
                            <SelectItem key="America/Argentina/Buenos_Aires">
                                Buenos Aires (GMT-3)
                            </SelectItem>
                            <SelectItem key="America/New_York">
                                Nueva York (GMT-5)
                            </SelectItem>
                            <SelectItem key="Europe/Madrid">
                                Madrid (GMT+1)
                            </SelectItem>
                            <SelectItem key="America/Mexico_City">
                                Ciudad de México (GMT-6)
                            </SelectItem>
                        </Select>

                        {/* Interface Density */}
                        <Select
                            label="Densidad de interfaz"
                            placeholder="Selecciona la densidad"
                            selectedKeys={[settings.interfaceDensity]}
                            onChange={(e) => setSettings({ ...settings, interfaceDensity: e.target.value })}
                            variant="bordered"
                        >
                            <SelectItem key="compact">Compacta</SelectItem>
                            <SelectItem key="comfortable">Cómoda</SelectItem>
                        </Select>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                        Cancelar
                    </Button>
                    <Button color="primary" onPress={handleSave}>
                        Guardar Configuración
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default SettingsModal;
