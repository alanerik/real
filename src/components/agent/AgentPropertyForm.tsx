import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Input,
    Button,
    Form,
    Select,
    SelectItem,
    Textarea,
    Checkbox,
    Divider,
    Alert,
} from "@heroui/react";
import { HeroUIProvider } from "@heroui/react";
import { supabase } from "../../lib/supabase";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { useAgentAuth } from "../../hooks/useAgentAuth";
import { showToast } from "../ToastManager";
import { logger } from "../../lib/logger";
import { AgentLayout } from './AgentLayout';
import { AgentDashboardHeader } from './AgentDashboardHeader';

interface AgentPropertyFormProps {
    propertyId?: string;
}

function AgentPropertyFormContent({ propertyId }: AgentPropertyFormProps) {
    const { currentAgent, isCheckingAuth, handleLogout } = useAgentAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
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

    ndleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {

        ding(true);
        arget.files || e.target.files.length === 0) {



            les = Array.from(e.target.files);
            loadedUrls: string[] = [];

            st file of files) {
                leExt = file.name.split(".").pop();
                leName = `${Math.random()}.${fileExt}`;
                lePath = `${fileName}`;

                error: uploadError
            } = await supabase.storage
            roperty - images")
            filePath, file);

                adError) throw uploadError;

            data
        } = supabase.storage
        roperty - images")
        icUrl(filePath);

        Urls.push(data.publicUrl);


        ata((prev) => {
                llery) {
                     ...prev, gallery_images: [...prev.gallery_images, ...uploadedUrls]
        };
                
                     ...prev, image_url: uploadedUrls[0]
    };


    (error) {
        t({
            Error al subir imagen",
                ion: error instanceof Error ? error.message : 'Error desconocido',
            danger"
            
        y {
            ding(false);
        
    

    moveGalleryImage = (index: number) => {
                ata(prev => ({

                    images: prev.gallery_images.filter((_, i) => i !== index)
        
    

    moveMainImage = () => {
                        ata(prev => ({ ...prev, image_url: "" }));


                        ndleSubmit = async (e: React.FormEvent) => {
                            tDefault();

        rentAgent) {
                    t({
                        Error",
                ion: "Debes estar autenticado como agente",
                        danger"
            
            
        

        ng(true);

                aturesArray = formData.features
                    , ")
             => f.trim())
            (f) => f);

        taToSave = {
            ata,
            umber(formData.price) || 0,
            : Number(formData.bedrooms) || 0,
            s: Number(formData.bathrooms) || 0,
                s: Number(formData.ambientes) || 0,
                    ea: Number(formData.total_area) || 0,
                        area: Number(formData.covered_area) || 0,
                            ered_area: Number(formData.semi_covered_area) || 0,
                                a: Number(formData.land_area) || 0,
                                    y: Number(formData.antiquity) || 0,
            : Number(formData.expenses) || 0,
            formData.latitud ? Number(formData.latitud) : null,
            : formData.longitud ? Number(formData.longitud) : null,
            : featuresArray,
            : currentAgent.id,
            _status: 'pending', // Always pending for new agent properties


                r;
        ertyId) {
            pdates, don't change approval_status
            approval_status, ...updateData
        } = dataToSave;
        error: updateError
    } = await supabase
                roperties")
                updateData)
                , propertyId)
                nt_id", currentAgent.id); // Only update own properties
    updateError;

    error: insertError
} = await supabase
                roperties")
[dataToSave]);
insertError;
        

        r) {
    t({
        Error al guardar",
                ion: error.message || 'Error desconocido',
        danger"
            
        
            t({
            ropertyId? "Propiedad actualizada": "Propiedad enviada",
            ion: propertyId
                    ambios se guardaron exitosamente"
                    opiedad fue enviada para aprobación del administrador",
                success"
            
            ut(() => {
                ocation.href = "/agent/properties";
                ;

                ng(false);
    

    eckingAuth) {

            ssName="min-h-screen flex items-center justify-center" >
            ssName="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>





        yout currentAgent = { currentAgent } handleLogout = { handleLogout } >
        enProfile, onOpenSettings }) => (

            shboardHeader
                        gent = { currentAgent }
    ofile = { onOpenProfile }
    ttings = { onOpenSettings }
    ropertyId ? "Editar Propiedad" : "Nueva Propiedad"
}
                        ={ !propertyId ? "La propiedad será enviada para aprobación del administrador" : undefined }


ssName = "flex-1 max-w-4xl mx-auto" >
    ssName="flex justify-end mb-4" >


        gent / properties"
                                efault"
"light"
tent = {< svg className = "w-4 h-4" fill = "none" viewBox = "0 0 24 24" stroke = "currentColor" > <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg >}
                            
                                 la lista
    >


    tyId && (

        arning"
"faded"
e = "mb-6"
                                roceso de Aprobación"
ion = "Una vez que envíes la propiedad, el administrador la revisará. Recibirás una notificación cuando sea aprobada y aparecerá en el sitio público."




y >

    e="flex flex-col gap-6"
onBehavior = "native"
    = { handleSubmit }
                                
                                    rmación Básica */}
ssName = "grid grid-cols-1 md:grid-cols-2 gap-4 w-full" >

    ed
                                            ítulo"
                                            tle"
der = "Ej: Casa moderna en el centro"
ormData.title}
                                            ={ handleChange }
e = "md:col-span-2"



ed
lug(URL)"
                                            ug"
der = "casa-moderna-centro"
ormData.slug}
                                            ={ handleChange }
e = "md:col-span-2"
ion = "Se genera automáticamente del título"


a
                                            escripción"
                                            scription"
der = "Descripción detallada de la propiedad..."
ormData.description}
                                            ={ handleChange }
e = "md:col-span-2"
{ 3 }
                                        
                                    

                                     />
sName = "text-lg font-semibold" > Precio y Ubicación</h3 >

    ssName="grid grid-cols-1 md:grid-cols-3 gap-4 w-full" >

        oneda"
Keys = { [formData.currency]}
    = {(e) => handleSelectChange("currency", e.target.value)}
                                        
                                            tem key = "USD" > Dólares(USD)</SelectItem >
    tem key = "ARS" > Pesos(ARS)</SelectItem >
                                        >


        ed
                                            mber"
                                            recio"
                                            ice"
ormData.price}
                                            ={ handleChange }
                                        

                                        
                                            mber"
                                            xpensas"
                                            penses"
der = "0"
ormData.expenses}
                                            ={ handleChange }



ed
iudad / Barrio"
                                            ty"
ormData.city}
                                            ={ handleChange }
e = "md:col-span-3"



    />
    sName="text-lg font-semibold" > Características</h3 >

        ssName="grid grid-cols-1 md:grid-cols-3 gap-4 w-full" >

            peración"
Keys = { [formData.operation]}
    = {(e) => handleSelectChange("operation", e.target.value)}
                                        
                                            tem key = "venta" > Venta</SelectItem >
    tem key = "alquiler" > Alquiler</SelectItem >
        tem key = "alquiler_temporal" > Alquiler Temporal</SelectItem >
                                        >


            ipo de Propiedad"
Keys = { [formData.property_type]}
    = {(e) => handleSelectChange("property_type", e.target.value)}
                                        
                                            tem key = "casa" > Casa</SelectItem >
    tem key = "departamento" > Departamento</SelectItem >
        tem key = "ph" > PH</SelectItem >
            tem key = "terreno" > Terreno</SelectItem >
                tem key = "local" > Local</SelectItem >
                    tem key = "oficina" > Oficina</SelectItem >
                        tem key = "otro" > Otro</SelectItem >
                                        >


                            stado"
Keys = { [formData.status]}
    = {(e) => handleSelectChange("status", e.target.value)}
                                        
                                            tem key = "available" > Disponible</SelectItem >
    tem key = "reserved" > Reservado</SelectItem >
                                        >


        ssName="grid grid-cols-2 md:grid-cols-4 gap-4 w-full" >

            mber"
                                            mbientes"
                                            bientes"
ormData.ambientes}
                                            ={ handleChange }
                                        
                                        
                                            mber"
                                            ormitorios"
                                            drooms"
ormData.bedrooms}
                                            ={ handleChange }
                                        
                                        
                                            mber"
                                            años"
                                            throoms"
ormData.bathrooms}
                                            ={ handleChange }
                                        
                                        
                                            mber"
ntigüedad(años)"
                                            tiquity"
ormData.antiquity}
                                            ={ handleChange }
ed = { formData.is_brand_new }



ssName = "flex gap-4 items-center flex-wrap" >
    x
ed = { formData.garage }
hange = {(isSelected) => handleCheckboxChange("garage", isSelected)}

chera
ox >
    x
ed = { formData.is_brand_new }
hange = {(isSelected) => handleCheckboxChange("is_brand_new", isSelected)}

ar
ox >
                                    

                                     />
sName = "text-lg font-semibold" > Superficies(m²)</h3 >

    ssName="grid grid-cols-2 md:grid-cols-4 gap-4 w-full" >

        mber"
                                            otal"
                                            tal_area"
ormData.total_area}
                                            ={ handleChange }
                                        
                                        
                                            mber"
                                            ubierta"
                                            vered_area"
ormData.covered_area}
                                            ={ handleChange }
                                        
                                        
                                            mber"
                                            emicubierta"
                                            mi_covered_area"
ormData.semi_covered_area}
                                            ={ handleChange }
                                        
                                        
                                            mber"
                                            erreno"
                                            nd_area"
ormData.land_area}
                                            ={ handleChange }
                                        
                                    

                                     />
sName = "text-lg font-semibold" > Multimedia y Extras</h3 >


    aracterísticas(separadas por coma)"
                                        atures"
der = "Piscina, Quincho, Seguridad..."
ormData.features}
                                        ={ handleChange }


ssName = "flex flex-col gap-4" >
    en Principal */}
ssName = "flex flex-col gap-2" >
    assName="text-small text-default-500" > Imagen Principal</span >
        ssName="flex items-center gap-4" >
            a.image_url && (
                ssName = "relative" >
                                                        ={ formData.image_url } alt = "Preview" className = "h-20 w-20 object-cover rounded-md border" />

    tton"
{ removeMainImage }
e = "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"

ssName = "w-3 h-3" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24" >
    rokeLinecap="round" strokeLinejoin = "round" strokeWidth = "2" d = "M6 18L18 6M6 6l12 12" ></path >
                                                            
                                                        >



        le"
image/*"
                                                    ={(e) => handleImageUpload(e, false)}
                                                    ={uploading}
                                                    e="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                                
                                            
                                        

                                        ría */}
ssName = "flex flex-col gap-2" >
    assName="text-small text-default-500" > Galería de Imágenes</span >
        ssName="flex flex-wrap gap-4 mb-2" >
            a.gallery_images.map((img, index) => (
                                                    = { index } className = "relative" >
                                                        ={ img } alt = {`Gallery ${index}`} className = "h-20 w-20 object-cover rounded-md border" />

            tton"
                                                            {() => removeGalleryImage(index)}
                e = "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                        
                                                            ssName = "w-3 h-3" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24" >
            rokeLinecap="round" strokeLinejoin = "round" strokeWidth = "2" d = "M6 18L18 6M6 6l12 12" ></path >
                                                            
                                                        >




            le"
                                                image/*"
                                                
                                                ={(e) => handleImageUpload(e, true)}
                                                ={uploading}
                                                e="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                            
                                        

                                        ng && <p className="text-xs text-emerald-600">Subiendo imágenes...</p>}
                                    

                                    ssName="flex justify-end gap-2 mt-4">
                                        as="a" href="/agent/properties" variant="flat" color="danger">
                                            
                                        >
                                        
                                            bmit"
                                            uccess"
                                            e="bg-emerald-600"
                                            g={loading}
                                        
                                             ? "Guardando..." : (propertyId ? "Actualizar" : "Enviar para Aprobación")}
                                        >
                                    
                                
                            dy>
                        
                    
                
            
        ayout>
    


efault function AgentPropertyForm(props: AgentPropertyFormProps) {
    
        ovider>
            rovider>
                opertyFormContent {...props} />
            Provider>
        rovider>
    

