import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Input,
    Button,
    Form,
    Select,
    SelectItem,
    Textarea,
    Checkbox,
    Divider,
    Chip,
    Alert,
} from "@heroui/react";
import { HeroUIProvider } from "@heroui/react";
import { supabase } from "../../lib/supabase";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { useAgentAuth } from "../../hooks/useAgentAuth";
import { showToast } from "../ToastManager";
import { logger } from "../../lib/logger";
import AgentSidebar from "./AgentSidebar";

interface AgentPropertyFormProps {
    propertyId?: string;
}

function AgentPropertyFormContent({ propertyId }: AgentPropertyFormProps) {
    const { currentAgent, isCheckingAuth, handleLogout } = useAgentAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        currency: "USD",
        city: "",
        operation: "venta",
        property_type: "casa",
        bedrooms: "",
        bathrooms: "",
        ambientes: "",
        total_area: "",
        covered_area: "",
        semi_covered_area: "",
        land_area: "",
        status: "available",
        garage: false,
        antiquity: "",
        expenses: "",
        image_url: "",
        gallery_images: [] as string[],
        is_brand_new: false,
        is_featured: false,
        features: "",
        slug: "",
        latitud: "",
        longitud: "",
    });

    useEffect(() => {
        if (propertyId && currentAgent) {
            loadProperty();
        }
    }, [propertyId, currentAgent]);

    async function loadProperty() {
        setLoading(true);
        const { data, error } = await supabase
            .from("properties")
            .select("*")
            .eq("id", propertyId)
            .single();

        if (error) {
            logger.error("Error loading property", error);
            showToast({
                title: "Error",
                description: "No se pudo cargar la propiedad",
                color: "danger"
            });
        } else {
            setFormData({
                ...data,
                features: data.features ? data.features.join(", ") : "",
                price: data.price?.toString() || "",
                bedrooms: data.bedrooms?.toString() || "",
                bathrooms: data.bathrooms?.toString() || "",
                ambientes: data.ambientes?.toString() || "",
                total_area: data.total_area?.toString() || "",
                covered_area: data.covered_area?.toString() || "",
                semi_covered_area: data.semi_covered_area?.toString() || "",
                land_area: data.land_area?.toString() || "",
                antiquity: data.antiquity?.toString() || "",
                expenses: data.expenses?.toString() || "",
                gallery_images: data.gallery_images || [],
                is_brand_new: data.is_brand_new || false,
                is_featured: data.is_featured || false,
                latitud: data.latitud?.toString() || "",
                longitud: data.longitud?.toString() || "",
            });
        }
        setLoading(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev, [name]: value };
            if (name === "title" && !propertyId) {
                newData.slug = value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "");
            }
            return newData;
        });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, isSelected: boolean) => {
        setFormData((prev) => {
            const newData = { ...prev, [name]: isSelected };
            if (name === "is_brand_new" && isSelected) {
                newData.antiquity = "0";
            }
            return newData;
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) {
                return;
            }

            const files = Array.from(e.target.files);
            const uploadedUrls: string[] = [];

            for (const file of files) {
                const fileExt = file.name.split(".").pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("property-images")
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from("property-images")
                    .getPublicUrl(filePath);

                uploadedUrls.push(data.publicUrl);
            }

            setFormData((prev) => {
                if (isGallery) {
                    return { ...prev, gallery_images: [...prev.gallery_images, ...uploadedUrls] };
                } else {
                    return { ...prev, image_url: uploadedUrls[0] };
                }
            });
        } catch (error) {
            showToast({
                title: "Error al subir imagen",
                description: error instanceof Error ? error.message : 'Error desconocido',
                color: "danger"
            });
        } finally {
            setUploading(false);
        }
    };

    const removeGalleryImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            gallery_images: prev.gallery_images.filter((_, i) => i !== index)
        }));
    };

    const removeMainImage = () => {
        setFormData(prev => ({ ...prev, image_url: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentAgent) {
            showToast({
                title: "Error",
                description: "Debes estar autenticado como agente",
                color: "danger"
            });
            return;
        }

        setLoading(true);

        const featuresArray = formData.features
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f);

        const dataToSave = {
            ...formData,
            price: Number(formData.price) || 0,
            bedrooms: Number(formData.bedrooms) || 0,
            bathrooms: Number(formData.bathrooms) || 0,
            ambientes: Number(formData.ambientes) || 0,
            total_area: Number(formData.total_area) || 0,
            covered_area: Number(formData.covered_area) || 0,
            semi_covered_area: Number(formData.semi_covered_area) || 0,
            land_area: Number(formData.land_area) || 0,
            antiquity: Number(formData.antiquity) || 0,
            expenses: Number(formData.expenses) || 0,
            latitud: formData.latitud ? Number(formData.latitud) : null,
            longitud: formData.longitud ? Number(formData.longitud) : null,
            features: featuresArray,
            agent_id: currentAgent.id,
            approval_status: 'pending', // Always pending for new agent properties
        };

        let error;
        if (propertyId) {
            // For updates, don't change approval_status
            const { approval_status, ...updateData } = dataToSave;
            const { error: updateError } = await supabase
                .from("properties")
                .update(updateData)
                .eq("id", propertyId)
                .eq("agent_id", currentAgent.id); // Only update own properties
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from("properties")
                .insert([dataToSave]);
            error = insertError;
        }

        if (error) {
            showToast({
                title: "Error al guardar",
                description: error.message || 'Error desconocido',
                color: "danger"
            });
        } else {
            showToast({
                title: propertyId ? "Propiedad actualizada" : "Propiedad enviada",
                description: propertyId
                    ? "Los cambios se guardaron exitosamente"
                    : "Tu propiedad fue enviada para aprobación del administrador",
                color: "success"
            });
            setTimeout(() => {
                window.location.href = "/agent/properties";
            }, 1500);
        }
        setLoading(false);
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 p-4 gap-4">
            <AgentSidebar
                isExpanded={isSidebarExpanded}
                onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
                handleLogout={handleLogout}
            />

            <div className="flex-1 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            {propertyId ? "Editar Propiedad" : "Nueva Propiedad"}
                        </h1>
                        {!propertyId && (
                            <p className="text-default-500 text-sm mt-1">
                                La propiedad será enviada para aprobación del administrador
                            </p>
                        )}
                    </div>
                    <Button
                        as="a"
                        href="/agent/properties"
                        color="default"
                        variant="light"
                    >
                        Volver
                    </Button>
                </div>

                {!propertyId && (
                    <Alert
                        color="warning"
                        variant="faded"
                        className="mb-6"
                        title="Proceso de Aprobación"
                        description="Una vez que envíes la propiedad, el administrador la revisará. Recibirás una notificación cuando sea aprobada y aparecerá en el sitio público."
                    />
                )}

                <Card>
                    <CardBody>
                        <Form
                            className="flex flex-col gap-6"
                            validationBehavior="native"
                            onSubmit={handleSubmit}
                        >
                            {/* Información Básica */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <Input
                                    isRequired
                                    label="Título"
                                    name="title"
                                    placeholder="Ej: Casa moderna en el centro"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="md:col-span-2"
                                />

                                <Input
                                    isRequired
                                    label="Slug (URL)"
                                    name="slug"
                                    placeholder="casa-moderna-centro"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="md:col-span-2"
                                    description="Se genera automáticamente del título"
                                />

                                <Textarea
                                    label="Descripción"
                                    name="description"
                                    placeholder="Descripción detallada de la propiedad..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="md:col-span-2"
                                    minRows={3}
                                />
                            </div>

                            <Divider />
                            <h3 className="text-lg font-semibold">Precio y Ubicación</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                <Select
                                    label="Moneda"
                                    selectedKeys={[formData.currency]}
                                    onChange={(e) => handleSelectChange("currency", e.target.value)}
                                >
                                    <SelectItem key="USD">Dólares (USD)</SelectItem>
                                    <SelectItem key="ARS">Pesos (ARS)</SelectItem>
                                </Select>

                                <Input
                                    isRequired
                                    type="number"
                                    label="Precio"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                />

                                <Input
                                    type="number"
                                    label="Expensas"
                                    name="expenses"
                                    placeholder="0"
                                    value={formData.expenses}
                                    onChange={handleChange}
                                />

                                <Input
                                    isRequired
                                    label="Ciudad / Barrio"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="md:col-span-3"
                                />
                            </div>

                            <Divider />
                            <h3 className="text-lg font-semibold">Características</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                <Select
                                    label="Operación"
                                    selectedKeys={[formData.operation]}
                                    onChange={(e) => handleSelectChange("operation", e.target.value)}
                                >
                                    <SelectItem key="venta">Venta</SelectItem>
                                    <SelectItem key="alquiler">Alquiler</SelectItem>
                                    <SelectItem key="alquiler_temporal">Alquiler Temporal</SelectItem>
                                </Select>

                                <Select
                                    label="Tipo de Propiedad"
                                    selectedKeys={[formData.property_type]}
                                    onChange={(e) => handleSelectChange("property_type", e.target.value)}
                                >
                                    <SelectItem key="casa">Casa</SelectItem>
                                    <SelectItem key="departamento">Departamento</SelectItem>
                                    <SelectItem key="ph">PH</SelectItem>
                                    <SelectItem key="terreno">Terreno</SelectItem>
                                    <SelectItem key="local">Local</SelectItem>
                                    <SelectItem key="oficina">Oficina</SelectItem>
                                    <SelectItem key="otro">Otro</SelectItem>
                                </Select>

                                <Select
                                    label="Estado"
                                    selectedKeys={[formData.status]}
                                    onChange={(e) => handleSelectChange("status", e.target.value)}
                                >
                                    <SelectItem key="available">Disponible</SelectItem>
                                    <SelectItem key="reserved">Reservado</SelectItem>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                <Input
                                    type="number"
                                    label="Ambientes"
                                    name="ambientes"
                                    value={formData.ambientes}
                                    onChange={handleChange}
                                />
                                <Input
                                    type="number"
                                    label="Dormitorios"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleChange}
                                />
                                <Input
                                    type="number"
                                    label="Baños"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleChange}
                                />
                                <Input
                                    type="number"
                                    label="Antigüedad (años)"
                                    name="antiquity"
                                    value={formData.antiquity}
                                    onChange={handleChange}
                                    isDisabled={formData.is_brand_new}
                                />
                            </div>

                            <div className="flex gap-4 items-center flex-wrap">
                                <Checkbox
                                    isSelected={formData.garage}
                                    onValueChange={(isSelected) => handleCheckboxChange("garage", isSelected)}
                                >
                                    Tiene Cochera
                                </Checkbox>
                                <Checkbox
                                    isSelected={formData.is_brand_new}
                                    onValueChange={(isSelected) => handleCheckboxChange("is_brand_new", isSelected)}
                                >
                                    A Estrenar
                                </Checkbox>
                            </div>

                            <Divider />
                            <h3 className="text-lg font-semibold">Superficies (m²)</h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                <Input
                                    type="number"
                                    label="Total"
                                    name="total_area"
                                    value={formData.total_area}
                                    onChange={handleChange}
                                />
                                <Input
                                    type="number"
                                    label="Cubierta"
                                    name="covered_area"
                                    value={formData.covered_area}
                                    onChange={handleChange}
                                />
                                <Input
                                    type="number"
                                    label="Semicubierta"
                                    name="semi_covered_area"
                                    value={formData.semi_covered_area}
                                    onChange={handleChange}
                                />
                                <Input
                                    type="number"
                                    label="Terreno"
                                    name="land_area"
                                    value={formData.land_area}
                                    onChange={handleChange}
                                />
                            </div>

                            <Divider />
                            <h3 className="text-lg font-semibold">Multimedia y Extras</h3>

                            <Input
                                label="Características (separadas por coma)"
                                name="features"
                                placeholder="Piscina, Quincho, Seguridad..."
                                value={formData.features}
                                onChange={handleChange}
                            />

                            <div className="flex flex-col gap-4">
                                {/* Imagen Principal */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-small text-default-500">Imagen Principal</span>
                                    <div className="flex items-center gap-4">
                                        {formData.image_url && (
                                            <div className="relative">
                                                <img src={formData.image_url} alt="Preview" className="h-20 w-20 object-cover rounded-md border" />
                                                <button
                                                    type="button"
                                                    onClick={removeMainImage}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, false)}
                                            disabled={uploading}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                        />
                                    </div>
                                </div>

                                {/* Galería */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-small text-default-500">Galería de Imágenes</span>
                                    <div className="flex flex-wrap gap-4 mb-2">
                                        {formData.gallery_images.map((img, index) => (
                                            <div key={index} className="relative">
                                                <img src={img} alt={`Gallery ${index}`} className="h-20 w-20 object-cover rounded-md border" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => handleImageUpload(e, true)}
                                        disabled={uploading}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                    />
                                </div>

                                {uploading && <p className="text-xs text-emerald-600">Subiendo imágenes...</p>}
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button as="a" href="/agent/properties" variant="flat" color="danger">
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    color="success"
                                    className="bg-emerald-600"
                                    isLoading={loading}
                                >
                                    {loading ? "Guardando..." : (propertyId ? "Actualizar" : "Enviar para Aprobación")}
                                </Button>
                            </div>
                        </Form>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

export default function AgentPropertyForm(props: AgentPropertyFormProps) {
    return (
        <ThemeProvider>
            <HeroUIProvider>
                <AgentPropertyFormContent {...props} />
            </HeroUIProvider>
        </ThemeProvider>
    );
}
