import { useState, useMemo, useEffect } from "react";
import type { Property, StatsData } from "../types/dashboard";
import { calculateStats } from "../utils/dashboard/statsCalculator";

interface UsePropertyFiltersReturn {
    filterValue: string;
    setFilterValue: (value: string) => void;
    page: number;
    setPage: (page: number) => void;
    filteredItems: Property[];
    paginatedItems: Property[];
    stats: StatsData;
    rowsPerPage: number;
}

/**
 * Custom hook for filtering and paginating properties
 * @param properties - Array of all properties
 * @returns Filter state, pagination, and calculated stats
 */
export function usePropertyFilters(properties: Property[]): UsePropertyFiltersReturn {
    const [filterValue, setFilterValue] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    // Reset page when filter changes
    useEffect(() => {
        setPage(1);
    }, [filterValue]);

    // Calculate statistics
    const stats = useMemo(() => calculateStats(properties), [properties]);

    // Filter items
    const filteredItems = useMemo(() => {
        if (!filterValue) return properties;

        return properties.filter((item) =>
            item.title.toLowerCase().includes(filterValue.toLowerCase()) ||
            item.city?.toLowerCase().includes(filterValue.toLowerCase())
        );
    }, [properties, filterValue]);

    // Paginate items
    const paginatedItems = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    return {
        filterValue,
        setFilterValue,
        page,
        setPage,
        filteredItems,
        paginatedItems,
        stats,
        rowsPerPage,
    };
}
