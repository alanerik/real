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
        // Check if user came from Supabase invite link (has tokens in hash)
        checkSupabaseSession();

        // Get email from URL params
        const params = new URLSearchParams(window.location.search);
        const emailParam = params.get('email');
        if (emailParam) {
            setEmail(emailParam);
            checkInvitation(emailParam);
        }
    }, []);

    const checkSupabaseSession = async () => {
        try {
            // Supabase automatically handles the tokens from the URL hash
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error getting session:', error);
                return;
            }

            if (session?.user) {
                console.log('User session found from invite:', session.user.email);
                setEmail(session.user.email);
                checkInvitation(session.user.email);
            }
        } catch (error) {
            console.error('Error checking Supabase session:', error);
        }
    };

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
            // Get the current user (should be authenticated from invite link)
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error('No se pudo verificar la sesión. Por favor, usa el link del email de invitación.');
            }

            // Update the user's password
            const { error: updateError } = await supabase.auth.updateUser({
                password: formData.password
            });

            if (updateError) throw updateError;

            // Link user to rental
            await linkTenantToRental(rentalInfo.id, user.id);

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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
                    <svg className="w-12 h-12 text-yellow-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Link Inválido</h3>
                    <p className="text-sm text-yellow-700 mb-4">
                        Por favor, usa el link que recibiste en tu email de invitación.
                    </p>
                    <p className="text-xs text-yellow-600">
                        Si no recibiste el email, contacta al propietario.
                    </p>
                </div>
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
