import React, { useState, useEffect } from 'react';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Input,
    Link,
    Select,
    SelectItem,
    Textarea,
    Checkbox,
    Chip,
    Tooltip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    RadioGroup,
    Radio
} from "@heroui/react";
import { getAttachments, uploadAttachment, deleteAttachment, getAttachmentUrl, getRentalById } from '../../lib/rentals';
import { generateContractPDF } from '../../utils/generateContractPDF';

const CATEGORIES = [
    { key: 'contract', label: 'Contrato Firmado' },
    { key: 'identification', label: 'DNI / Identificación' },
    { key: 'income_proof', label: 'Comprobante de Ingresos' },
    { key: 'guarantee', label: 'Garantía' },
    { key: 'inventory', label: 'Inventario' },
    { key: 'other', label: 'Otro' }
];

export default function DocumentManager({ rentalId }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [rentalData, setRentalData] = useState(null);
    const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
    const { isOpen: isContractOpen, onOpen: onContractOpen, onClose: onContractClose } = useDisclosure();
    const [contractType, setContractType] = useState('annual');

    // Upload Form State
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadForm, setUploadForm] = useState({
        category: 'other',
        description: '',
        visibleToTenant: true
    });

    useEffect(() => {
        if (rentalId) {
            loadDocuments();
            loadRentalData();
        }
    }, [rentalId]);

    const loadRentalData = async () => {
        const data = await getRentalById(rentalId);
        setRentalData(data);
    };

    const loadDocuments = async () => {
        setLoading(true);
        const data = await getAttachments(rentalId);
        setDocuments(data);
        setLoading(false);
    };

    const handleGenerateContract = () => {
        if (!rentalData) return;
        onContractOpen();
    };

    const confirmGenerateContract = () => {
        try {
            generateContractPDF(rentalData, rentalData.properties, contractType);
            onContractClose();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('El archivo excede el tamaño máximo de 10MB');
                return;
            }
            setSelectedFile(file);
            setSelectedFile(file);
            onUploadOpen();
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            await uploadAttachment(selectedFile, rentalId, {
                category: uploadForm.category,
                description: uploadForm.description,
                visibleToTenant: uploadForm.visibleToTenant
            });

            loadDocuments();
            onUploadClose();
            setSelectedFile(null);
            setUploadForm({
                category: 'other',
                description: '',
                visibleToTenant: true
            });
        } catch (error) {
            console.error("Error uploading document:", error);
            alert(error.message || "Error al subir el documento");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, filePath) => {
        if (confirm('¿Estás seguro de eliminar este documento?')) {
            try {
                await deleteAttachment(id, filePath);
                loadDocuments();
            } catch (error) {
                console.error("Error deleting document:", error);
                alert("Error al eliminar el documento");
            }
        }
    };

    const getCategoryLabel = (key) => {
        return CATEGORIES.find(c => c.key === key)?.label || key;
    };

    const columns = [
        { name: "DOCUMENTO", uid: "name" },
        { name: "CATEGORÍA", uid: "category" },
        { name: "ORIGEN", uid: "origin" },
        { name: "VISIBILIDAD", uid: "visibility" },
        { name: "FECHA", uid: "date" },
        { name: "ACCIONES", uid: "actions" },
    ];

    const renderCell = (doc, columnKey) => {
        switch (columnKey) {
            case "name":
                return (
                    <div className="flex flex-col gap-1">
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
                        {doc.payment_id && (
                            <Chip size="sm" color="success" variant="dot">
                                Comprobante de pago
                            </Chip>
                        )}
                    </div>
                );
            case "category":
                return (
                    <Chip size="sm" variant="flat" color="primary">
                        {getCategoryLabel(doc.category)}
                    </Chip>
                );
            case "origin":
                return doc.uploaded_by_tenant ? (
                    <Chip size="sm" color="secondary" variant="flat" startContent={<span>📤</span>}>
                        Inquilino
                    </Chip>
                ) : (
                    <Chip size="sm" color="default" variant="flat" startContent={<span>👤</span>}>
                        Admin
                    </Chip>
                );
            case "visibility":
                return (
                    <Tooltip content={doc.visible_to_tenant ? "Visible para inquilino" : "Solo administradores"}>
                        <span className="text-lg cursor-default text-default-400">
                            {doc.visible_to_tenant ? <EyeIcon /> : <LockIcon />}
                        </span>
                    </Tooltip>
                );
            case "date":
                return <span className="text-sm">{new Date(doc.created_at).toLocaleDateString()}</span>;
            case "actions":
                return (
                    <span
                        className="text-lg text-danger cursor-pointer active:opacity-50"
                        onClick={() => handleDelete(doc.id, doc.file_path)}
                    >
                        <DeleteIcon />
                    </span>
                );
            default:
                return doc[columnKey];
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-semibold">Documentos Adjuntos</h3>
                    <p className="text-sm text-gray-500">Gestiona contratos y documentación del alquiler.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                        color="secondary"
                        variant="flat"
                        onPress={handleGenerateContract}
                        startContent={<FileIcon className="text-lg" />}
                        className="w-full sm:w-auto"
                    >
                        Generar Contrato PDF
                    </Button>

                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <Button
                        color="primary"
                        onPress={() => document.getElementById('file-upload').click()}
                        startContent={<UploadIcon className="text-lg" />}
                        className="w-full sm:w-auto"
                    >
                        Subir Documento
                    </Button>
                </div>
            </div>

            <Table aria-label="Tabla de documentos">
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={documents} emptyContent={"No hay documentos adjuntos."}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Upload Modal */}
            <Modal isOpen={isUploadOpen} onClose={onUploadClose}>
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
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.key} value={cat.key}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </Select>

                                    <Textarea
                                        label="Descripción (Opcional)"
                                        placeholder="Detalles adicionales..."
                                        value={uploadForm.description}
                                        onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                    />

                                    <Checkbox
                                        isSelected={uploadForm.visibleToTenant}
                                        onValueChange={(val) => setUploadForm({ ...uploadForm, visibleToTenant: val })}
                                    >
                                        Visible para el inquilino
                                    </Checkbox>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={handleUpload} isLoading={uploading}>
                                    Guardar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Contract Type Modal */}
            <Modal isOpen={isContractOpen} onClose={onContractClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Generar Contrato PDF</ModalHeader>
                            <ModalBody>
                                <p className="text-sm text-gray-600 mb-4">
                                    Selecciona el tipo de contrato que deseas generar para <strong>{rentalData?.tenant_name}</strong>.
                                </p>
                                <RadioGroup
                                    label="Tipo de Contrato"
                                    value={contractType}
                                    onValueChange={setContractType}
                                >
                                    <Radio value="annual" description="Contrato de vivienda permanente por 3 años (Ley de Alquileres)">
                                        Vivienda Permanente
                                    </Radio>
                                    <Radio value="vacation" description="Alquiler temporario con fines turísticos (Máx 3 meses)">
                                        Alquiler Temporario / Vacacional
                                    </Radio>
                                </RadioGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button color="primary" onPress={confirmGenerateContract} startContent={<FileIcon />}>
                                    Generar PDF
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

const EyeIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
    </svg>
);

const LockIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor" />
    </svg>
);

const FileIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
    </svg>
);

const UploadIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" fill="currentColor" />
    </svg>
);
