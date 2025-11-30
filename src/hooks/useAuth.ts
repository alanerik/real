import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { showToast } from "../components/ToastManager";
import type { User } from "../types/dashboard";

interface UseAuthReturn {
    currentUser: User | null;
    isCheckingAuth: boolean;
    handleLogout: () => Promise<void>;
}

/**
 * Custom hook for handling user authentication
 * @returns Auth state and handlers
 */
export function useAuth(): UseAuthReturn {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const checkUser = useCallback(async (): Promise<void> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!isMounted.current) return;

            if (!user) {
                window.location.href = "/admin/login";
                return;
            }

            setCurrentUser(user);
        } catch (error) {
            console.error("Error checking user:", error);
            if (isMounted.current) {
                showToast({
                    title: "Error al verificar autenticación",
                    color: "danger"
                });
            }
        } finally {
            if (isMounted.current) {
                setIsCheckingAuth(false);
            }
        }
    }, []);

    const handleLogout = useCallback(async (): Promise<void> => {
        await supabase.auth.signOut();
        window.location.href = "/admin/login";
    }, []);

    useEffect(() => {
        checkUser();
    }, [checkUser]);

    return {
        currentUser,
        isCheckingAuth,
        handleLogout,
    };
}
