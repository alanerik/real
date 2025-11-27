/**
 * Environment Variable Validation
 * Validates required environment variables on application startup
 * to prevent cryptic runtime errors.
 */

const requiredEnvVars = [
    'PUBLIC_SUPABASE_URL',
    'PUBLIC_SUPABASE_ANON_KEY'
] as const;

export class EnvironmentValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EnvironmentValidationError';
    }
}

/**
 * Validates that all required environment variables are present
 * @throws {EnvironmentValidationError} if any required variables are missing
 */
export function validateEnvironment(): void {
    const missing: string[] = [];

    for (const envVar of requiredEnvVars) {
        const value = import.meta.env[envVar];
        if (!value || value.trim() === '') {
            missing.push(envVar);
        }
    }

    if (missing.length > 0) {
        throw new EnvironmentValidationError(
            `Missing required environment variables:\n  - ${missing.join('\n  - ')}\n\n` +
            `Please check your .env file and ensure these variables are set.`
        );
    }
}

/**
 * Gets an environment variable value with type safety
 */
export function getEnvVar(key: typeof requiredEnvVars[number]): string {
    const value = import.meta.env[key];
    if (!value) {
        throw new EnvironmentValidationError(`Environment variable ${key} is not set`);
    }
    return value;
}
