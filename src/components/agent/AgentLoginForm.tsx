import React from "react";
import UnifiedLoginForm from "../shared/UnifiedLoginForm";
import { supabase } from "../../lib/supabase";
import { getAgentByUserId } from "../../lib/agents";
import { showToast } from "../ToastManager";

export default function AgentLoginForm() {
    const handleLogin = async (email: string, password: string, _rememberMe: boolean) => {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) throw authError;

        // First try to find agent by user_id
        let agent = await getAgentByUserId(data.user.id);

        // If not found by user_id, try to find by email and link
        if (!agent) {
            const { data: agentByEmail, error: emailError } = await supabase
                .from('agents')
                .select('*')
                .eq('email', email)
                .eq('status', 'active')
                .single();

            if (agentByEmail && !emailError) {
                // Link the user_id to this agent
                const { error: updateError } = await supabase
                    .from('agents')
                    .update({ user_id: data.user.id })
                    .eq('id', agentByEmail.id);

                if (!updateError) {
                    agent = { ...agentByEmail, user_id: data.user.id };
                }
            }
        }

        if (!agent) {
            await supabase.auth.signOut();
            throw new Error("No tienes permisos de agente. Contacta al administrador.");
        }

        if (agent.status !== 'active') {
            await supabase.auth.signOut();
            throw new Error("Tu cuenta de agente está desactivada.");
        }

        showToast({
            title: `¡Bienvenido, ${agent.name}!`,
            description: "Accediendo a tu panel...",
            color: "success"
        });

        setTimeout(() => {
            window.location.href = "/agent/dashboard";
        }, 1000);
    };

    return (
        <UnifiedLoginForm
            title="Portal de Agentes"
            subtitle="Accede a tu panel de gestión"
            emoji="💼"
            onSubmit={handleLogin}
            showForgotPassword={false}
            showRememberMe={true}
        />
    );
}
