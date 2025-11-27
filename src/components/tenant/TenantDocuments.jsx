import { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Divider,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Link,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Select,
    SelectItem,
    Textarea,
    useDisclosure
} from "@heroui/react";
import { getAttachments, uploadAttachment, deleteAttachment, getAttachmentUrl } from '../../lib/rentals';
import { showToast } from '../ToastManager';

// Categories specific to tenant uploads
const TENANT_CATEGORIES = [
    { key: 'payment_receipt', label: 'Comprobante de Pago' },
    { key: 'personal_document', label: 'Documentación Personal' },
    { key: 'maintenance_photo', label: 'Foto de Problema/Mantenimiento' },
    { key: 'other', label: 'Otro' }
];

export default function TenantDocuments({ rental }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadForm, setUploadForm] = useState({
        category: 'payment_receipt',
        description: ''
    });

    useEffect(() => {
        if (rental?.id) {
            loadDocuments();
        }
    }, [rental]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const data = await getAttachments(rental.id);
            setDocuments(data || []);
        } catch (error) {
            showToast({
                title: 'Error al cargar documentos',
                description: error.message,
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                showToast({
                    title: 'Archivo muy grande',
                    description: 'El archivo excede el tamaño máximo de 10MB',
                    color: 'danger'
                });
                return;
            }
            setSelectedFile(file);
            onOpen();
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            await uploadAttachment(selectedFile, rental.id, {
                category: uploadForm.category,
                description: uploadForm.description,
                visibleToTenant: true,
                uploadedByTenant: true // This marks it as uploaded by tenant
            });

            showToast({
                title: 'Documento subido',
                description: 'Tu documento ha sido enviado exitosamente',
                color: 'success'
            });

            loadDocuments();
            onClose();
            setSelectedFile(null);
            setUploadForm({
                category: 'payment_receipt',
                description: ''
            });
        } catch (error) {
            showToast({
                title: 'Error al subir documento',
                description: error.message || 'Intenta nuevamente',
                color: 'danger'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, filePath) => {
        if (confirm('¿Estás seguro de eliminar este documento?')) {
            try {
                await deleteAttachment(id, filePath);
                showToast({
                    title: 'Documento eliminado',
                    description: 'El documento ha sido eliminado correctamente',
                    color: 'success'
                });
                loadDocuments();
            } catch (error) {
                showToast({
                    title: 'Error al eliminar',
                    description: error.message,
                    color: 'danger'
                });
            }
        }
    };

    const getCategoryLabel = (key) => {
        return TENANT_CATEGORIES.find(c => c.key === key)?.label || key;
    };

    // Separate documents into tenant-uploaded and admin-shared
    const myDocuments = documents.filter(doc => doc.uploaded_by_tenant);
    const sharedDocuments = documents.filter(doc => !doc.uploaded_by_tenant && doc.visible_to_tenant);

    const columns = [
        { name: "DOCUMENTO", uid: "name" },
        { name: "CATEGORÍA", uid: "category" },
        { name: "FECHA", uid: "date" },
        { name: "ACCIONES", uid: "actions" }
    ];

    const renderCell = (doc, columnKey, canDelete = false) => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex flex-col">
                        <Link
                            isExternal
                            href={getAttachmentUrl(doc.file_path)}
                            className="text-sm font-medium"
                        >
                            {doc.file_name}
                        </Link>
                        {doc.description && (
                            <span className="text-xs text-gray-500">{doc.description}</span>
                        )}
                    </div>
                );
            case "category":
                return (
                    <Chip size="sm" variant="flat" color="primary">
                        {getCategoryLabel(doc.category)}
                    </Chip>
                );
            case "date":
                return <span className="text-sm">{new Date(doc.created_at).toLocaleDateString('es-AR')}</span>;
            case "actions":
                return canDelete ? (
                    <span
                        className="text-lg text-danger cursor-pointer active:opacity-50"
                        onClick={() => handleDelete(doc.id, doc.file_path)}
                    >
                        <DeleteIcon />
                    </span>
                ) : (
                    <span className="text-sm text-gray-400">-</span>
                );
            default:
                return doc[columnKey];
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando documentos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <Card>
                <CardHeader className="flex gap-3">
                    <div className="flex flex-col flex-1">
                        <p className="text-md font-semibold">Subir Documento</p>
                        <p className="text-sm text-gray-500">Comprobantes de pago, documentación personal, fotos de problemas</p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody>
                    <input
                        type="file"
                        id="tenant-file-upload"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <Button
                        color="primary"
                        onPress={() => document.getElementById('tenant-file-upload').click()}
                        startContent={<UploadIcon className="text-lg" />}
                        className="w-full sm:w-auto"
                    >
                        Seleccionar Archivo
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                        Formatos aceptados: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                    </p>
                </CardBody>
            </Card>

            {/* My Documents Section */}
            <Card>
                <CardHeader>
                    <p className="text-md font-semibold">Mis Documentos ({myDocuments.length})</p>
                </CardHeader>
                <Divider />
                <CardBody>
                    {myDocuments.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No has subido documentos aún</p>
                    ) : (
                        <Table aria-label="Mis documentos">
                            <TableHeader columns={columns}>
                                {(column) => (
                                    <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                                        {column.name}
                                    </TableColumn>
                                )}
                            </TableHeader>
                            <TableBody items={myDocuments}>
                                {(item) => (
                                    <TableRow key={item.id}>
                                        {(columnKey) => <TableCell>{renderCell(item, columnKey, true)}</TableCell>}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardBody>
            </Card>

            {/* Shared Documents from Admin */}
            {sharedDocuments.length > 0 && (
                <Card>
                    <CardHeader>
                        <p className="text-md font-semibold">Documentos Compartidos por Administrador ({sharedDocuments.length})</p>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <Table aria-label="Documentos compartidos">
                            <TableHeader columns={columns}>
                                {(column) => (
                                    <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                                        {column.name}
                                    </TableColumn>
                                )}
                            </TableHeader>
                            <TableBody items={sharedDocuments}>
                                {(item) => (
                                    <TableRow key={item.id}>
                                        {(columnKey) => <TableCell>{renderCell(item, columnKey, false)}</TableCell>}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            )}

            {/* Upload Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Subir Documento</ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div className="text-sm text-gray-600">
                                        Archivo seleccionado: <strong>{selectedFile?.name}</strong>
                                    </div>

                                    <Select
                                        label="Categoría"
                                        placeholder="Selecciona una categoría"
                                        selectedKeys={[uploadForm.category]}
                                        onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                                    >
                                        {TENANT_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.key} value={cat.key}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Textarea
                                        label="Descripción (Opcional)"
                                        placeholder="Agrega detalles sobre este documento..."
                                        value={uploadForm.description}
                                        onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                        minRows={2}
                                    />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={handleUpload} isLoading={uploading}>
                                    Subir
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}

const DeleteIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M7.08331 4.14169L7.26665 3.05002C7.4 2.24169 7.5 1.64169 8.94165 1.64169H11.0583C12.5 1.64169 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M15.7084 9.16669L15.1667 17.5667C15.0834 18.875 15 19.1667 12.675 19.1667H7.32502C5.00002 19.1667 4.91669 18.875 4.83335 17.5667L4.29169 9.16669" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M8.60834 13.75H11.3833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M7.91669 10.4167H12.0834" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);

const UploadIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" fill="currentColor" />
    </svg>
);
