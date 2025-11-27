/**
 * Custom Error Classes
 * Provides consistent error handling across the application
 */

/**
 * Base error class for Supabase operations
 */
export class SupabaseError extends Error {
    constructor(
        message: string,
        public readonly originalError: any,
        public readonly operation: string,
        public readonly table?: string
    ) {
        super(message);
        this.name = 'SupabaseError';

        // Maintain proper stack trace for debugging
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SupabaseError);
        }
    }

    /**
     * Get a user-friendly error message
     */
    getUserMessage(): string {
        // Check for common Supabase error codes
        const code = this.originalError?.code;

        switch (code) {
            case 'PGRST116':
                return 'No se encontró el registro solicitado';
            case '23505':
                return 'Ya existe un registro con estos datos';
            case '23503':
                return 'No se puede completar la operación debido a restricciones de datos';
            case '42501':
                return 'No tienes permisos para realizar esta operación';
            default:
                return this.message;
        }
    }

    /**
     * Get detailed error information for logging
     */
    getDetails(): Record<string, any> {
        return {
            name: this.name,
            message: this.message,
            operation: this.operation,
            table: this.table,
            originalError: {
                message: this.originalError?.message,
                code: this.originalError?.code,
                details: this.originalError?.details,
                hint: this.originalError?.hint
            }
        };
    }
}

/**
 * Error for validation failures
 */
export class ValidationError extends Error {
    constructor(
        message: string,
        public readonly field?: string,
        public readonly validationRule?: string
    ) {
        super(message);
        this.name = 'ValidationError';

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidationError);
        }
    }

    getUserMessage(): string {
        if (this.field) {
            return `Error en ${this.field}: ${this.message}`;
        }
        return this.message;
    }
}

/**
 * Helper function to create a SupabaseError from a Supabase response
 */
export function createSupabaseError(
    error: any,
    operation: string,
    table?: string
): SupabaseError {
    const message = error?.message || 'Error desconocido en operación de base de datos';
    return new SupabaseError(message, error, operation, table);
}
