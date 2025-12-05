import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getAgentByUserId, type Agent } from '../lib/agents';
import { showToast } from '../components/ToastManager';

interface UseAgentAuthReturn {
    currentAgent: Agent | null;
    isCheckingAuth: boolean;
    isAuthenticated: boolean;
    handleLogout: () => Promise<void>;
    refreshAgent: () => Promise<void>;
}

/**
 * Custom hook for handling agent authentication
 * @returns Agent auth state and handlers
 */
export function useAgentAuth(): UseAgentAuthReturn {
    const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const checkAgent = useCallback(async (): Promise<void> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                if (isMounted.current) {
                    setCurrentAgent(null);
                }
                return;
            }

            // Check if user is an active agent
            const agent = await getAgentByUserId(user.id);

            if (isMounted.current) {
                setCurrentAgent(agent);
            }
        } catch (error) {
            console.error('Error checking agent auth:', error);
            if (isMounted.current) {
                setCurrentAgent(null);
                showToast({
                    title: "Error de autenticación",
                    description: "No se pudo verificar tu sesión",
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
        window.location.href = "/agent/login";
    }, []);

    const refreshAgent = useCallback(async (): Promise<void> => {
        await checkAgent();
    }, [checkAgent]);

    useEffect(() => {
        checkAgent();
    }, [checkAgent]);

    return {
        currentAgent,
        isCheckingAuth,
        isAuthenticated: !!currentAgent,
        handleLogout,
        refreshAgent
    };
}
