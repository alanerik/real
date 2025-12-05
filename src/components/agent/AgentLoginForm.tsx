import { useState } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Input,
    Button,
    Form
} from "@heroui/react";
import { HeroUIProvider } from "@heroui/react";
import { supabase } from '../../lib/supabase';
import { getAgentByUserId } from '../../lib/agents';
import { showToast } from '../ToastManager';

export default function AgentLoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
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
        } catch (err: any) {
            setError(err.message || "Ocurrió un error durante el inicio de sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <HeroUIProvider>
            <Form onSubmit={handleLogin} className="space-y-4">
                {error && (
                    <div className="p-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
                        <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
                    </div>
                )}

                <Input
                    type="email"
                    label="Email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    isRequired
                    classNames={{
                        input: "dark:bg-gray-700",
                        inputWrapper: "dark:bg-gray-700"
                    }}
                />

                <Input
                    type="password"
                    label="Contraseña"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    isRequired
                    classNames={{
                        input: "dark:bg-gray-700",
                        inputWrapper: "dark:bg-gray-700"
                    }}
                />

                <Button
                    type="submit"
                    color="success"
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    isLoading={loading}
                    size="lg"
                >
                    {loading ? "Ingresando..." : "Ingresar"}
                </Button>
            </Form>
        </HeroUIProvider>
    );
}
