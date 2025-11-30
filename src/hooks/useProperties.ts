import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { showToast } from "../components/ToastManager";
import type { Property } from "../types/dashboard";

interface UsePropertiesReturn {
    properties: Property[];
    loading: boolean;
    handleStatusChange: (id: number, newStatus: string) => Promise<void>;
    handleDelete: (id: number) => Promise<void>;
    loadProperties: () => Promise<void>;
}

/**
 * Custom hook for managing properties
 * @returns Properties state and handlers
 */
export function useProperties(): UsePropertiesReturn {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const loadProperties = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("properties")
                .select("*")
                .order("created_at", { ascending: false });

            if (!isMounted.current) return;

            if (error) {
                console.error("Error loading properties:", error);
                showToast({
                    title: "Error al cargar propiedades",
                    color: "danger"
                });
                setProperties([]);
            } else {
                setProperties(data || []);
            }
        } catch (error) {
            console.error("Unexpected error loading properties:", error);
            if (isMounted.current) {
                showToast({
                    title: "Error inesperado al cargar propiedades",
                    color: "danger"
                });
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, []);

    const handleStatusChange = useCallback(async (id: number, newStatus: string): Promise<void> => {
        // Store old state for rollback
        const previousProperties = [...properties];

        // Optimistic update
        setProperties((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: newStatus as any } : p))
        );

        try {
            const { error } = await supabase
                .from("properties")
                .update({ status: newStatus })
                .eq("id", id);

            if (error) throw error;

            if (isMounted.current) {
                showToast({
                    title: "Estado actualizado correctamente",
                    color: "success"
                });
            }
        } catch (error) {
            console.error("Error updating status:", error);

            if (isMounted.current) {
                // Rollback to previous state
                setProperties(previousProperties);
                showToast({
                    title: "Error al actualizar el estado",
                    color: "danger"
                });
            }
        }
    }, [properties]);

    const handleDelete = useCallback(async (id: number): Promise<void> => {
        if (!confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) return;

        try {
            const { error } = await supabase.from("properties").delete().eq("id", id);

            if (error) throw error;

            if (isMounted.current) {
                setProperties((prev) => prev.filter((p) => p.id !== id));
                showToast({
                    title: "Propiedad eliminada correctamente",
                    color: "success"
                });
            }
        } catch (error: any) {
            console.error("Error deleting property:", error);
            if (isMounted.current) {
                showToast({
                    title: "Error al eliminar",
                    description: error.message || 'Error desconocido',
                    color: "danger"
                });
            }
        }
    }, []);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    return {
        properties,
        loading,
        handleStatusChange,
        handleDelete,
        loadProperties,
    };
}
