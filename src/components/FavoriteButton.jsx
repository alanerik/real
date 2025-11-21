import React, { useState, useEffect } from 'react';
import { showToast } from "./ToastManager";

const FavoriteButton = ({ slug, title }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Check if property is in favorites on mount
        const favorites = JSON.parse(localStorage.getItem('realstate_favorites') || '[]');
        setIsFavorite(favorites.includes(slug));
        setIsLoaded(true);
    }, [slug]);

    const toggleFavorite = (e) => {
        e.preventDefault(); // Prevent card click
        e.stopPropagation();

        const favorites = JSON.parse(localStorage.getItem('realstate_favorites') || '[]');
        let newFavorites;
        let message = "";

        if (favorites.includes(slug)) {
            newFavorites = favorites.filter(s => s !== slug);
            message = "Propiedad eliminada de favoritos";
        } else {
            newFavorites = [...favorites, slug];
            message = "Si estás interesado en esta propiedad llamanos para obtener más detalles";
        }

        localStorage.setItem('realstate_favorites', JSON.stringify(newFavorites));
        setIsFavorite(!isFavorite);

        // Trigger HeroUI toast via custom event
        showToast({
            title: !isFavorite ? "¡Guardado en Favoritos!" : "Eliminado",
            description: message,
            color: !isFavorite ? "success" : "default",
            timeout: 5000,
        });
    };

    if (!isLoaded) return null; // Avoid hydration mismatch

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={toggleFavorite}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    toggleFavorite(e);
                }
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white text-red-500 shadow-sm z-50 relative transition-all active:scale-95"
            aria-label={isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
        >
            {isFavorite ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
            )}
        </div>
    );
};

export default FavoriteButton;
