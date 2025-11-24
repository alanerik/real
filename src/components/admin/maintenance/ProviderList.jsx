import { useState, useEffect } from 'react';
import { getProviders, deleteProvider } from '../../../lib/providers';
import { showToast } from '../../ToastManager';
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Tooltip,
    User,
    Chip
} from "@heroui/react";

const columns = [
    { name: "PROVEEDOR", uid: "name" },
    { name: "OFICIO", uid: "trade" },
    { name: "CONTACTO", uid: "contact" },
    { name: "NOTAS", uid: "notes" },
    { name: "ACCIONES", uid: "actions" },
];

const tradeColorMap = {
    plomero: "primary",
    electricista: "warning",
    gasista: "danger",
    pintor: "secondary",
    default: "default"
};

export default function ProviderList({ refreshTrigger, onEdit }) {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProviders();
    }, [refreshTrigger]);

    const loadProviders = async () => {
        try {
            const data = await getProviders();
            setProviders(data || []);
        } catch (error) {
            console.error('Error loading providers:', error);
            showToast({
                title: 'Error al cargar proveedores',
                description: error.message,
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;

        try {
            await deleteProvider(id);
            showToast({
                title: 'Proveedor eliminado',
                color: 'success'
            });
            loadProviders();
        } catch (error) {
            console.error('Error deleting provider:', error);
            showToast({
                title: 'Error al eliminar',
                description: error.message,
                color: 'danger'
            });
        }
    };

    const getWhatsAppLink = (phone) => {
        // Remove non-numeric characters
        const cleanPhone = phone.replace(/\D/g, '');
        return `https://wa.me/${cleanPhone}`;
    };

    const renderCell = (provider, columnKey) => {
        switch (columnKey) {
            case "name":
                return (
                    <User
                        name={provider.name}
                        description={provider.email}
                        avatarProps={{
                            radius: "lg",
                            name: provider.name.charAt(0).toUpperCase()
                        }}
                    />
                );
            case "trade":
                return (
                    <Chip
                        className="capitalize"
                        color={tradeColorMap[provider.trade] || tradeColorMap.default}
                        size="sm"
                        variant="flat"
                    >
                        {provider.trade.replace('_', ' ')}
                    </Chip>
                );
            case "contact":
                return (
                    <div className="flex gap-2">
                        <Button
                            as="a"
                            href={`tel:${provider.phone}`}
                            size="sm"
                            color="primary"
                            variant="flat"
                            isIconOnly
                            title="Llamar"
                        >
                            <PhoneIcon />
                        </Button>
                        <Button
                            as="a"
                            href={getWhatsAppLink(provider.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="sm"
                            color="success"
                            variant="flat"
                            isIconOnly
                            title="WhatsApp"
                        >
                            <WhatsAppIcon />
                        </Button>
                        <span className="text-small text-default-500 self-center ml-1">
                            {provider.phone}
                        </span>
                    </div>
                );
            case "notes":
                return (
                    <p className="text-small text-default-400 max-w-xs truncate">
                        {provider.notes || '-'}
                    </p>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Editar">
                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => onEdit && onEdit(provider)}>
                                <EditIcon />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Eliminar">
                            <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(provider.id)}>
                                <DeleteIcon />
                            </span>
                        </Tooltip>
                    </div>
                );
            default:
                return provider[columnKey];
        }
    };

    if (loading) return <div className="text-center py-4">Cargando proveedores...</div>;

    return (
        <Table aria-label="Tabla de proveedores">
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody items={providers} emptyContent={"No hay proveedores registrados."}>
                {(item) => (
                    <TableRow key={item.id}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

const PhoneIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const WhatsAppIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

const EditIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
        <path d="M2.5 18.3333H17.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" />
    </svg>
);

const DeleteIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 20 20" width="1em" {...props}>
        <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M7.08331 4.14169L7.26665 3.05002C7.4 2.24169 7.5 1.64169 8.94165 1.64169H11.0583C12.5 1.64169 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M15.7084 9.16669L15.1667 17.5667C15.0834 18.875 15 19.1667 12.675 19.1667H7.32502C5.00002 19.1667 4.91669 18.875 4.83335 17.5667L4.29169 9.16669" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M8.60834 13.75H11.3833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M7.91669 10.4167H12.0834" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
);
