import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Link } from "@heroui/react";
import { getAttachments, uploadAttachment, deleteAttachment, getAttachmentUrl } from '../../lib/rentals';

export default function DocumentManager({ rentalId }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (rentalId) {
            loadDocuments();
        }
    }, [rentalId]);

    const loadDocuments = async () => {
        setLoading(true);
        const data = await getAttachments(rentalId);
        setDocuments(data);
        setLoading(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            await uploadAttachment(file, rentalId);
            loadDocuments();
        } catch (error) {
            console.error("Error uploading document:", error);
            alert("Error al subir el documento");
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

    const columns = [
        { name: "NOMBRE", uid: "name" },
        { name: "TIPO", uid: "type" },
        { name: "FECHA", uid: "date" },
        { name: "ACCIONES", uid: "actions" },
    ];

    const renderCell = (doc, columnKey) => {
        switch (columnKey) {
            case "name":
                return (
                    <Link
                        isExternal
                        href={getAttachmentUrl(doc.file_path)}
                        className="text-sm font-medium"
                    >
                        {doc.file_name}
                    </Link>
                );
            case "type":
                return <span className="text-xs text-gray-500">{doc.file_type}</span>;
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
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Documentos Adjuntos</h3>
                    <p className="text-sm text-gray-500">Sube contratos, identificaciones o comprobantes.</p>
                </div>
                <div>
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <Button
                        color="primary"
                        isLoading={uploading}
                        onPress={() => document.getElementById('file-upload').click()}
                    >
                        {uploading ? 'Subiendo...' : 'Subir Documento'}
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
