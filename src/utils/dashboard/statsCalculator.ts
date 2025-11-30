import type { Property, StatsData } from "../../types/dashboard";

// Constants
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calculate dashboard statistics from properties array
 * @param properties - Array of properties
 * @returns Stats object with totals by status
 * @note Properties without status are counted as "available" for backward compatibility with legacy data
 * @performance O(n) - Single pass through the array using reduce
 */
export function calculateStats(properties: Property[]): StatsData {
    // Input validation
    if (!Array.isArray(properties)) {
        throw new Error('calculateStats: properties must be an array');
    }

    // Single pass through array - O(n) instead of O(n×4)
    return properties.reduce(
        (stats, property) => {
            stats.total++;

            // Properties without status default to available (legacy data support)
            const status = property.status || "available";

            if (status === "available") {
                stats.available++;
            } else if (status === "reserved") {
                stats.reserved++;
            } else if (status === "sold") {
                stats.sold++;
            }
            // Note: Unknown statuses are counted in total but not in specific categories

            return stats;
        },
        { total: 0, available: 0, reserved: 0, sold: 0 } as StatsData
    );
}

/**
 * Calculate remaining days until a date
 * @param endDate - End date string in ISO format
 * @returns Number of days remaining (negative if expired)
 * @throws Error if endDate is invalid or not a valid date string
 */
export function calculateRemainingDays(endDate: string): number {
    // Input validation
    if (!endDate || typeof endDate !== 'string') {
        throw new Error('calculateRemainingDays: endDate must be a non-empty string');
    }

    const end = new Date(endDate);

    // Validate that the date is valid
    if (isNaN(end.getTime())) {
        throw new Error(`calculateRemainingDays: Invalid date format: ${endDate}`);
    }

    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / MILLISECONDS_PER_DAY);
}
