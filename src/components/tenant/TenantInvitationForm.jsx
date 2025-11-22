import { useState, useEffect } from 'react';
import { Form, Input, Button } from "@heroui/react";
import { supabase } from '../../lib/supabase';
import { getRentalByEmail, linkTenantToRental } from '../../lib/auth-tenant';
import { showToast } from '../ToastManager';

export default function TenantInvitationForm() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [rentalInfo, setRentalInfo] = useState(null);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        // Get email from URL params
        const params = new URLSearchParams(window.location.search);
        const emailParam = params.get('email');
        if (emailParam) {
            setEmail(emailParam);
            checkInvitation(emailParam);
        }
    }, []);

    const checkInvitation = async (email) => {
        try {
            const rental = await getRentalByEmail(email);
            setRentalInfo(rental);
        } catch (error) {
            console.error('Error checking invitation:', error);
            showToast({
                title: 'Invitación no válida',
                description: 'No se encontró una invitación para este email',
                color: 'danger'
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            showToast({
                title: 'Error',
                description: 'Las contraseñas no coinciden',
                color: 'danger'
            });
            return;
        }

        if (formData.password.length < 6) {
            showToast({
                title: 'Error',
                description: 'La contraseña debe tener al menos 6 caracteres',
                color: 'danger'
            });
            return;
        }

        setLoading(true);

        try {
            // Create user account
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: formData.password,
            });

            if (signUpError) throw signUpError;

            // Link user to rental
            await linkTenantToRental(rentalInfo.id, authData.user.id);

            showToast({
                title: '¡Cuenta creada!',
                description: 'Redirigiendo al portal...',
                color: 'success'
            });

            // Redirect to tenant dashboard
            setTimeout(() => {
                window.location.href = '/tenant/dashboard';
            }, 1500);
        } catch (error) {
            console.error('Error creating account:', error);
            showToast({
                title: 'Error al crear cuenta',
                description: error.message || 'Intenta nuevamente',
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">Invitación no válida. Verifica el link que recibiste.</p>
            </div>
        );
    }

    if (!rentalInfo) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Verificando invitación...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Propiedad:</strong> {rentalInfo.properties?.title}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                    <strong>Email:</strong> {email}
                </p>
            </div>

            <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    type="password"
                    label="Contraseña"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    isRequired
                    autoComplete="new-password"
                />

                <Input
                    type="password"
                    label="Confirmar Contraseña"
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    isRequired
                    autoComplete="new-password"
                />

                <Button
                    type="submit"
                    color="primary"
                    isLoading={loading}
                    className="w-full mt-2"
                    size="lg"
                >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta y Acceder'}
                </Button>
            </Form>

            <div className="text-center">
                <p className="text-xs text-gray-500">
                    ¿Ya tienes cuenta? <a href="/tenant/login" className="text-primary-600 hover:text-primary-700">Inicia sesión aquí</a>
                </p>
            </div>
        </div>
    );
}
