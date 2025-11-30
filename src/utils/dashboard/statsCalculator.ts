import type { Property, StatsData } from "../../types/dashboard";

/**
 * Calculate dashboard statistics from properties array
 * @param properties - Array of properties
 * @returns Stats object with totals by status
 */
export function calculateStats(properties: Property[]): StatsData {
    return {
        total: properties.length,
        available: properties.filter((p) => p.status === "available" || !p.status).length,
        reserved: properties.filter((p) => p.status === "reserved").length,
        sold: properties.filter((p) => p.status === "sold").length,
    };
}

/**
 * Calculate remaining days until a date
 * @param endDate - End date string
 * @returns Number of days remaining (negative if expired)
 */
export function calculateRemainingDays(endDate: string): number {
    return Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
}
