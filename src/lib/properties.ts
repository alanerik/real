import { supabase } from './supabase';
import { createSupabaseError } from './errors';
import { logger } from './logger';

interface DbProperty {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    price: number;
    currency: string;
    city: string;
    operation: string;
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    ambientes: number;
    area: number;
    image_url: string | null;
    features: string[];
    total_area: number;
    covered_area: number;
    semi_covered_area: number;
    land_area: number;
    status: string;
    garage: boolean;
    antiquity: number;
    expenses: number;
    created_at: string;
    gallery_images: string[] | null;
    is_brand_new: boolean;
    is_featured: boolean;
    latitud: number | null;
    longitud: number | null;
}

export async function getAllProperties() {
    logger.supabase('SELECT ALL', 'properties');

    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw createSupabaseError(error, 'getAllProperties', 'properties');
    }

    return data.map(mapProperty);
}

export async function getPropertyBySlug(slug: string) {
    logger.supabase('SELECT BY SLUG', 'properties', { slug });

    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        throw createSupabaseError(error, 'getPropertyBySlug', 'properties');
    }

    return mapProperty(data);
}

export async function getLatestProperties(limit = 3) {
    logger.supabase('SELECT LATEST', 'properties', { limit });

    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        throw createSupabaseError(error, 'getLatestProperties', 'properties');
    }

    return data.map(mapProperty);
}

export async function getFeaturedProperties(limit = 4) {
    logger.supabase('SELECT FEATURED', 'properties', { limit });

    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        throw createSupabaseError(error, 'getFeaturedProperties', 'properties');
    }

    return data.map(mapProperty);
}

function mapProperty(dbProp: DbProperty) {
    return {
        id: dbProp.id,
        slug: dbProp.slug,
        collection: 'propiedades',
        data: {
            title: dbProp.title || 'Sin título',
            description: dbProp.description || '',
            price: Number(dbProp.price) || 0,
            currency: dbProp.currency || 'USD',
            city: dbProp.city || '',
            operation: dbProp.operation || 'venta',
            propertyType: dbProp.property_type || 'otro',
            bedrooms: Number(dbProp.bedrooms) || 0,
            bathrooms: Number(dbProp.bathrooms) || 0,
            ambientes: Number(dbProp.ambientes) || 0,
            area: Number(dbProp.area) || 0,
            image: dbProp.image_url || '',
            features: Array.isArray(dbProp.features) ? dbProp.features : [],
            totalArea: Number(dbProp.total_area) || 0,
            coveredArea: Number(dbProp.covered_area) || 0,
            semiCoveredArea: Number(dbProp.semi_covered_area) || 0,
            landArea: Number(dbProp.land_area) || 0,
            status: dbProp.status || 'available',
            garage: !!dbProp.garage,
            antiquity: Number(dbProp.antiquity) || 0,
            expenses: Number(dbProp.expenses) || 0,
            createdAt: dbProp.created_at, // Important for sorting
            publishDate: dbProp.created_at, // Fallback for publishDate
            gallery: dbProp.gallery_images || [],
            isBrandNew: dbProp.is_brand_new || false,
            isFeatured: dbProp.is_featured || false,
            latitud: dbProp.latitud || null,
            longitud: dbProp.longitud || null,
        }
    };
}

export async function getPropertiesBySlugs(slugs: string[]) {
    if (!slugs || slugs.length === 0) return [];

    logger.supabase('SELECT BY SLUGS', 'properties', { count: slugs.length });

    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('slug', slugs)
        .order('created_at', { ascending: false });

    if (error) {
        throw createSupabaseError(error, 'getPropertiesBySlugs', 'properties');
    }

    return data.map(mapProperty);
}
