import React from "react";
import UnifiedLoginForm from "../shared/UnifiedLoginForm";
import { supabase } from "../../lib/supabase";
import { showToast } from "../ToastManager";

export default function LoginForm() {
    const handleLogin = async (email: string, password: string, _rememberMe: boolean) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        showToast({
            title: "¡Bienvenido!",
            description: "Inicio de sesión exitoso",
            color: "success"
        });

        setTimeout(() => {
            window.location.href = "/admin/dashboard";
        }, 1000);
    };

    return (
        <UnifiedLoginForm
            title="Acceso Administrativo"
            subtitle="Inicia sesión para gestionar propiedades"
            emoji="🔐"
            onSubmit={handleLogin}
            showForgotPassword={false}
            showRememberMe={true}
        />
    );
}
