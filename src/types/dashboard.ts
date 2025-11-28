// Type definitions for Dashboard component

export interface User {
    id: string;
    email?: string;
    user_metadata?: {
        name?: string;
        [key: string]: any;
    };
}

export type PropertyStatus = 'available' | 'reserved' | 'sold';

export interface Property {
    id: number;
    title: string;
    city?: string;
    price?: number;
    currency?: string;
    operation?: string;
    image_url?: string;
    status?: PropertyStatus;
    created_at?: string;
}

export interface RentalAlert {
    id: number;
    tenant_name: string;
    end_date: string; // ISO date string
    status?: string;
    properties?: {
        title: string;
    };
}

export interface StatsData {
    total: number;
    available: number;
    reserved: number;
    sold: number;
}
