import React, { useState, useEffect } from 'react';
import { Autocomplete, AutocompleteItem } from "@heroui/react";

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
            window.location.href = url.toString();
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
            >
                {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
            </Autocomplete>
        </div>
    );
}
