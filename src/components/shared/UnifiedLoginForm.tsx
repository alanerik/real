import React, { useState } from "react";
import { Button, Input, Checkbox, Link, Form, HeroUIProvider } from "@heroui/react";

// Eye icons as inline SVG components
const EyeIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-default-400 pointer-events-none"
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-default-400 pointer-events-none"
    >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

export interface UnifiedLoginFormProps {
    title: string;
    subtitle?: string;
    emoji?: string;
    onSubmit: (email: string, password: string, rememberMe: boolean) => Promise<void>;
    forgotPasswordUrl?: string;
    showRememberMe?: boolean;
    showForgotPassword?: boolean;
    createAccountUrl?: string;
    createAccountText?: string;
    submitButtonText?: string;
    loadingText?: string;
    error?: string | null;
}

export default function UnifiedLoginForm({
    title,
    subtitle,
    emoji = "👋",
    onSubmit,
    forgotPasswordUrl = "#",
    showRememberMe = true,
    showForgotPassword = true,
    createAccountUrl,
    createAccountText = "Crear una cuenta",
    submitButtonText = "Iniciar Sesión",
    loadingText = "Iniciando sesión...",
    error: externalError,
}: UnifiedLoginFormProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [internalError, setInternalError] = useState<string | null>(null);

    const error = externalError || internalError;

    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setInternalError(null);

        try {
            await onSubmit(email, password, rememberMe);
        } catch (err: any) {
            setInternalError(err.message || "Ocurrió un error durante el inicio de sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <HeroUIProvider>
            <div className="flex h-full w-full items-center justify-center">
                <div className="rounded-large flex w-full max-w-sm flex-col gap-4 px-8 pt-6 pb-10">
                    <p className="pb-4 text-left text-3xl font-semibold">
                        {title}
                        {emoji && (
                            <span aria-label="emoji" className="ml-2" role="img">
                                {emoji}
                            </span>
                        )}
                    </p>
                    {subtitle && (
                        <p className="text-default-500 text-sm -mt-4 mb-2">{subtitle}</p>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
                            <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>
                        </div>
                    )}

                    <Form
                        className="flex flex-col gap-4"
                        validationBehavior="native"
                        onSubmit={handleSubmit}
                    >
                        <Input
                            isRequired
                            label="Email"
                            labelPlacement="outside"
                            name="email"
                            placeholder="Ingresa tu email"
                            type="email"
                            variant="bordered"
                            value={email}
                            onValueChange={setEmail}
                            autoComplete="email"
                        />
                        <Input
                            isRequired
                            endContent={
                                <button type="button" onClick={toggleVisibility} className="focus:outline-none">
                                    {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            }
                            label="Contraseña"
                            labelPlacement="outside"
                            name="password"
                            placeholder="Ingresa tu contraseña"
                            type={isVisible ? "text" : "password"}
                            variant="bordered"
                            value={password}
                            onValueChange={setPassword}
                            autoComplete="current-password"
                        />

                        {(showRememberMe || showForgotPassword) && (
                            <div className="flex w-full items-center justify-between px-1 py-2">
                                {showRememberMe && (
                                    <Checkbox
                                        isSelected={rememberMe}
                                        onValueChange={setRememberMe}
                                        name="remember"
                                        size="sm"
                                    >
                                        Recordarme
                                    </Checkbox>
                                )}
                                {showForgotPassword && (
                                    <Link
                                        className="text-default-500"
                                        href={forgotPasswordUrl}
                                        size="sm"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                )}
                            </div>
                        )}

                        <Button
                            className="w-full"
                            color="primary"
                            type="submit"
                            isLoading={loading}
                        >
                            {loading ? loadingText : submitButtonText}
                        </Button>
                    </Form>

                    {createAccountUrl && (
                        <p className="text-small text-center">
                            <Link href={createAccountUrl} size="sm">
                                {createAccountText}
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </HeroUIProvider>
    );
}
