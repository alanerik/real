import React, { useState, useEffect } from 'react';
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { navigate } from "astro:transitions/client";

const sortOptions = [
    { key: 'title_asc', label: 'Por defecto' },
    { key: 'price_asc', label: 'Precio: Menor a Mayor' },
    { key: 'price_desc', label: 'Precio: Mayor a Menor' },
    { key: 'date_desc', label: 'Fecha: Más recientes' },
    { key: 'date_asc', label: 'Fecha: Más antiguos' },
];

export default function FiltroPropiedades() {
    const [selectedSort, setSelectedSort] = useState('title_asc');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sortParam = urlParams.get('sort');
        if (sortParam) {
            setSelectedSort(sortParam);
        }
    }, []);

    const handleSortChange = (key) => {
        if (key) {
            setSelectedSort(key);
            const url = new URL(window.location.href);
            url.searchParams.set('sort', key);
            
            // Resetear a la primera página cuando se cambia el filtro
            url.searchParams.set('page', '1');
            
            // Usar navigate() para navegación SPA
            navigate(url.pathname + url.search);
        }
    };

    return (
        <div className="flex justify-end">
            <Autocomplete
                label="Ordenar por"
                placeholder="Seleccionar orden"
                defaultItems={sortOptions}
                selectedKey={selectedSort}
                onSelectionChange={handleSortChange}
                className="max-w-xs"
                color='success'
            >
                {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
            </Autocomplete>
        </div>
    );
}