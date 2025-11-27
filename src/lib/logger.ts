/**
 * Centralized Logger
 * Provides conditional logging based on environment
 * Prevents debug logs from appearing in production
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    timestamp: string;
    message: string;
    data?: any;
}

/**
 * Formats a log entry for display
 */
function formatLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
        level,
        timestamp: new Date().toISOString(),
        message,
        data
    };
}

/**
 * Centralized logger with environment-aware logging
 */
export const logger = {
    /**
     * Debug logs - only shown in development
     * Use for detailed debugging information
     */
    debug: (message: string, ...args: any[]): void => {
        if (isDev) {
            const entry = formatLogEntry('debug', message, args.length > 0 ? args : undefined);
            console.log(`🔍 [DEBUG] ${entry.message}`, ...(args || []));
        }
    },

    /**
     * Info logs - only shown in development
     * Use for general informational messages
     */
    info: (message: string, ...args: any[]): void => {
        if (isDev) {
            const entry = formatLogEntry('info', message, args.length > 0 ? args : undefined);
            console.info(`ℹ️ [INFO] ${entry.message}`, ...(args || []));
        }
    },

    /**
     * Warning logs - shown in all environments
     * Use for recoverable errors or deprecations
     */
    warn: (message: string, ...args: any[]): void => {
        const entry = formatLogEntry('warn', message, args.length > 0 ? args : undefined);
        console.warn(`⚠️ [WARN] ${entry.message}`, ...(args || []));
    },

    /**
     * Error logs - shown in all environments
     * Use for errors that need attention
     */
    error: (message: string, error?: Error | any, ...args: any[]): void => {
        const entry = formatLogEntry('error', message, { error, args: args.length > 0 ? args : undefined });

        if (isDev) {
            console.error(`❌ [ERROR] ${entry.message}`, error, ...(args || []));
        } else {
            // In production, log less verbose errors
            console.error(`❌ [ERROR] ${entry.message}`, error?.message || error);
        }
    },

    /**
     * Logs a Supabase operation for debugging
     */
    supabase: (operation: string, table: string, details?: any): void => {
        if (isDev) {
            console.log(`📊 [SUPABASE] ${operation} on ${table}`, details || '');
        }
    }
};

/**
 * Performance logger for measuring execution time
 */
export class PerformanceLogger {
    private startTime: number;
    private operation: string;

    constructor(operation: string) {
        this.operation = operation;
        this.startTime = performance.now();
        logger.debug(`⏱️ Starting: ${operation}`);
    }

    end(additionalInfo?: string): void {
        const duration = performance.now() - this.startTime;
        const info = additionalInfo ? ` - ${additionalInfo}` : '';
        logger.debug(`⏱️ Completed: ${this.operation} in ${duration.toFixed(2)}ms${info}`);
    }
}

/**
 * Helper to log and re-throw errors
 */
export function logAndThrow(error: Error, context: string): never {
    logger.error(`Error in ${context}`, error);
    throw error;
}
