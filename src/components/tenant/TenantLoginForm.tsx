import React from "react";
import UnifiedLoginForm from "../shared/UnifiedLoginForm";
import { supabase } from "../../lib/supabase";
import { showToast } from "../ToastManager";

export default function TenantLoginForm() {
    const handleLogin = async (email: string, password: string, _rememberMe: boolean) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Check if user is actually a tenant
        const { data: rental } = await supabase
            .from('rentals')
            .select('id')
            .eq('tenant_user_id', data.user.id)
            .single();

        if (!rental) {
            await supabase.auth.signOut();
            throw new Error('No tienes un alquiler activo asociado a esta cuenta');
        }

        showToast({
            title: '¡Bienvenido!',
            description: 'Accediendo a tu portal...',
            color: 'success'
        });

        window.location.href = '/tenant/dashboard';
    };

    return (
        <UnifiedLoginForm
            title="Portal de Inquilinos"
            subtitle="Accede a tu información de alquiler"
            emoji="🏠"
            onSubmit={handleLogin}
            forgotPasswordUrl="/tenant/forgot-password"
            showForgotPassword={true}
            showRememberMe={true}
        />
    );
}
