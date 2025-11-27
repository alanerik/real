/**
 * HTML Sanitization Utilities
 * Prevents XSS attacks by escaping HTML special characters
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param text - String that may contain HTML special characters
 * @returns Safely escaped string
 */
export function escapeHtml(text: string | null | undefined): string {
    if (!text) return '';

    const htmlEscapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    };

    return String(text).replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char]);
}

/**
 * Sanitizes a full object by escaping all string values
 * @param obj - Object with potentially unsafe string values
 * @returns New object with all strings escaped
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = escapeHtml(value);
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized as T;
}

/**
 * Formats a date safely (no HTML escaping needed for dates)
 * @param dateString - ISO date string
 * @param locale - Locale for formatting (default: 'es-AR')
 * @returns Formatted date string
 */
export function formatDateSafe(dateString: string | null | undefined, locale: string = 'es-AR'): string {
    if (!dateString) return '_______________';

    try {
        return new Date(dateString).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch {
        return '_______________';
    }
}

/**
 * Formats currency safely (numbers don't need HTML escaping)
 * @param amount - Amount to format
 * @param locale - Locale for formatting (default: 'es-AR')
 * @returns Formatted currency string
 */
export function formatCurrencySafe(amount: number | null | undefined, locale: string = 'es-AR'): string {
    if (!amount && amount !== 0) return '_______________';

    try {
        return `$${Number(amount).toLocaleString(locale)}`;
    } catch {
        return '_______________';
    }
}
