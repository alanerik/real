import React, { useState, useEffect } from 'react';
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { navigate } from "astro:transitions/client";

/**
 * Opciones de ordenamiento disponibles
 * Exportado para reutilización en otros componentes
 */
export const ORDEN_OPTIONS = [
    { key: 'title_asc', label: 'Por defecto' },
    { key: 'price_asc', label: 'Precio: Menor a Mayor' },
    { key: 'price_desc', label: 'Precio: Mayor a Menor' },
    { key: 'date_desc', label: 'Fecha: Más recientes' },
    { key: 'date_asc', label: 'Fecha: Más antiguos' },
];

/**
 * Componente para ordenar listados de propiedades
 * Sincroniza el ordenamiento con los parámetros de URL
 * 
 * @param {Object} props
 * @param {Array} props.options - Opciones de ordenamiento personalizadas
 * @param {string} props.className - Clases CSS adicionales para el contenedor
 * @param {string} props.color - Color del Autocomplete (default: 'success')
 * @param {('sm'|'md'|'lg')} props.size - Tamaño del componente (default: 'lg')
 * @param {string} props.label - Etiqueta del campo (default: 'Ordenar por')
 * @param {Function} props.onOrderChange - Callback al cambiar el orden
 * 
 * @example
 * <FiltroOrden onOrderChange={(key) => console.log('Nuevo orden:', key)} />
 */
export default function FiltroOrden({ 
    options = ORDEN_OPTIONS,
    className = "flex justify-end",
    color = "success",
    size = "lg",
    label = "Ordenar por",
    onOrderChange
}) {
    const [selectedSort, setSelectedSort] = useState('');

    // Sincronizar con URL al montar el componente
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sortParam = urlParams.get('sort');
        if (sortParam) {
            setSelectedSort(sortParam);
        }
    }, []);

    /**
     * Maneja el cambio de ordenamiento
     * Actualiza la URL y resetea la paginación
     */
    const handleSortChange = (key) => {
        if (!key) return;

        setSelectedSort(key);
        
        // Construir nueva URL
        const url = new URL(window.location.href);
        
        // Si es el orden por defecto, eliminar el parámetro
        if (key === 'title_asc') {
            url.searchParams.delete('sort');
        } else {
            url.searchParams.set('sort', key);
        }
        
        // Resetear a la primera página al cambiar el filtro
        url.searchParams.set('page', '1');
        
        // Callback opcional
        if (onOrderChange) {
            onOrderChange(key);
        }
        
        // Navegar usando SPA
        navigate(url.pathname + url.search);
    };

    return (
        <div className={className}>
            <Autocomplete
                label={label}
                defaultItems={options}
                selectedKey={selectedSort}
                onSelectionChange={handleSortChange}
                className="max-w-xs"
                color={color}
                size={size}
                aria-label={label}
            >
                {(item) => (
                    <AutocompleteItem key={item.key}>
                        {item.label}
                    </AutocompleteItem>
                )}
            </Autocomplete>
        </div>
    );
}

/**
 * Hook personalizado para gestionar el ordenamiento
 * Útil para usar la lógica de ordenamiento fuera del componente
 * 
 * @returns {Object} - { currentSort, setSort, resetSort }
 * @example
 * const { currentSort, setSort } = useOrdenamiento();
 */
export function useOrdenamiento() {
    const [currentSort, setCurrentSort] = useState('');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sortParam = urlParams.get('sort') || 'title_asc';
        setCurrentSort(sortParam);
    }, []);

    const setSort = (sortKey) => {
        const url = new URL(window.location.href);
        
        if (sortKey === 'title_asc') {
            url.searchParams.delete('sort');
        } else {
            url.searchParams.set('sort', sortKey);
        }
        
        url.searchParams.set('page', '1');
        navigate(url.pathname + url.search);
    };

    const resetSort = () => {
        setSort('title_asc');
    };

    return {
        currentSort,
        setSort,
        resetSort,
        options: ORDEN_OPTIONS
    };
}

/**
 * Variante compacta del filtro de orden
 * Para espacios reducidos o móviles
 */
export function FiltroOrdenCompacto({ className = "flex justify-end" }) {
    return (
        <FiltroOrden 
            size="md"
            className={className}
        />
    );
}

/**
 * Filtro de orden para propiedades en venta
 * Opciones específicas para ventas (sin fecha)
 */
export function FiltroOrdenVentas({ className = "flex justify-end" }) {
    const ventasOptions = [
        { key: 'title_asc', label: 'Por defecto' },
        { key: 'price_asc', label: 'Precio: Menor a Mayor' },
        { key: 'price_desc', label: 'Precio: Mayor a Menor' },
    ];

    return (
        <FiltroOrden 
            options={ventasOptions}
            className={className}
        />
    );
}