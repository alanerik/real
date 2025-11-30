import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { showToast } from "../components/ToastManager";
import type { RentalAlert } from "../types/dashboard";

interface UseRentalAlertsReturn {
    alerts: RentalAlert[];
    isLoading: boolean;
    loadAlerts: () => Promise<void>;
}

/**
 * Custom hook for managing rental alerts
 * @returns Rental alerts state and handlers
 */
export function useRentalAlerts(): UseRentalAlertsReturn {
    const [alerts, setAlerts] = useState<RentalAlert[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const loadAlerts = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('rentals')
                .select('*, properties(title)')
                .in('status', ['near_expiration', 'expired'])
                .order('end_date', { ascending: true });

            if (!isMounted.current) return;

            if (error) {
                console.error('Error loading rental alerts:', error);
                showToast({
                    title: "Error al cargar alertas",
                    color: "danger"
                });
                setAlerts([]);
            } else {
                setAlerts(data || []);
            }
        } catch (error) {
            console.error('Unexpected error loading alerts:', error);
            if (isMounted.current) {
                setAlerts([]);
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadAlerts();
    }, [loadAlerts]);

    return {
        alerts,
        isLoading,
        loadAlerts,
    };
}
