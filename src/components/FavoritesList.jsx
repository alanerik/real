import React, { useState, useEffect } from 'react';
import TarjetaPropiedad from '@/components/Tarjetas/TarjetasPropiedades.jsx';
import { getPropertiesBySlugs } from '../lib/properties';
import { Button, Spinner } from "@heroui/react";

const FavoritesList = () => {
    const [favorites, setFavorites] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();

        // Listen for storage events to update if changed in another tab
        window.addEventListener('storage', loadFavorites);
        return () => window.removeEventListener('storage', loadFavorites);
    }, []);

    const loadFavorites = async () => {
        setLoading(true);
        const storedFavorites = JSON.parse(localStorage.getItem('realstate_favorites') || '[]');
        setFavorites(storedFavorites);

        if (storedFavorites.length > 0) {
            try {
                const props = await getPropertiesBySlugs(storedFavorites);
                setProperties(props);
            } catch (error) {
                console.error("Error loading favorite properties:", error);
            }
        } else {
            setProperties([]);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner size="lg" label="Cargando favoritos..." />
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No tenés favoritos guardados</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Guardá las propiedades que más te gusten haciendo click en el corazón para verlas acá.
                </p>
                <Button
                    as="a"
                    href="/"
                    color="primary"
                    variant="shadow"
                    size="lg"
                >
                    Explorar Propiedades
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
                <div key={property.slug} className="h-full">
                    <TarjetaPropiedad
                        image={property.data?.image || '/images/placeholder-property.webp'}
                        title={property.data?.title || 'Título no disponible'}
                        description={property.data?.description || 'Descripción no disponible'}
                        price={property.data?.currency + ' ' + Number(property.data?.price).toLocaleString()}
                        slug={property.slug}
                        imageAlt={`Imagen de ${property.data?.title}`}
                    />
                </div>
            ))}
        </div>
    );
};

export default FavoritesList;
