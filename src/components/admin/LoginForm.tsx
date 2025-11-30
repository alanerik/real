import React, { useState } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Input,
    Button,
    Form,
    Alert,
    HeroUIProvider,
} from "@heroui/react";
import { supabase } from "../../lib/supabase";
import { showToast } from "../ToastManager";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Show success toast before redirect
            showToast({
                title: "¡Bienvenido!",
                description: "Inicio de sesión exitoso",
                color: "success"
            });

            // Redirect after showing toast
            setTimeout(() => {
                window.location.href = "/admin/dashboard";
            }, 1000);
        } catch (err: any) {
            setError(err.message || "Ocurrió un error durante el inicio de sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <HeroUIProvider>
            <div className="flex items-center justify-center min-h-[80vh] px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="flex flex-col gap-1 items-center pb-0">
                        <h1 className="text-2xl font-bold">Acceso Administrativo</h1>
                        <p className="text-small text-default-500">
                            Inicia sesión para gestionar propiedades
                        </p>
                    </CardHeader>
                    <CardBody>
                        <Form
                            className="flex flex-col gap-4"
                            validationBehavior="native"
                            onSubmit={handleLogin}
                        >
                            <Input
                                isRequired
                                label="Correo Electrónico"
                                placeholder="Ingresa tu correo"
                                type="email"
                                variant="bordered"
                                value={email}
                                onValueChange={setEmail}
                            />
                            <Input
                                isRequired
                                label="Contraseña"
                                placeholder="Ingresa tu contraseña"
                                type="password"
                                variant="bordered"
                                value={password}
                                onValueChange={setPassword}
                            />

                            {error && (
                                <Alert color="danger" variant="flat">
                                    {error}
                                </Alert>
                            )}

                            <Button
                                className="w-full"
                                color="primary"
                                type="submit"
                                isLoading={loading}
                            >
                                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                            </Button>
                        </Form>
                    </CardBody>
                    <CardFooter className="justify-center">
                        {/* Placeholder for future Google Auth or other links */}
                    </CardFooter>
                </Card>
            </div>
        </HeroUIProvider>
    );
}
