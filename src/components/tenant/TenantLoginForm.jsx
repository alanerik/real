import { useState } from 'react';
import { Form, Input, Button } from "@heroui/react";
import { supabase } from '../../lib/supabase';
import { showToast } from '../ToastManager';

export default function TenantLoginForm() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
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

            // Redirect to tenant dashboard
            window.location.href = '/tenant/dashboard';
        } catch (error) {
            console.error('Login error:', error);
            showToast({
                title: 'Error al iniciar sesión',
                description: error.message || 'Verifica tus credenciales',
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
                type="email"
                label="Email"
                placeholder="tu@email.com"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isRequired
                autoComplete="email"
            />

            <Input
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                name="password"
                value={formData.password}
                onChange={handleChange}
                isRequired
                autoComplete="current-password"
            />

            <Button
                type="submit"
                color="primary"
                isLoading={loading}
                className="w-full mt-2"
                size="lg"
            >
                {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>

            <div className="text-center mt-2">
                <a href="/tenant/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                    ¿Olvidaste tu contraseña?
                </a>
            </div>
        </Form>
    );
}
