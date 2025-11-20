import { supabase } from './supabase';

export async function getAllProperties() {
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching properties:', error);
        return [];
    }

    return data.map(mapProperty);
}

export async function getPropertyBySlug(slug) {
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching property:', error);
        return null;
    }

    return mapProperty(data);
}

export async function getLatestProperties(limit = 3) {
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching latest properties:', error);
        return [];
    }

    return data.map(mapProperty);
}

function mapProperty(dbProp) {
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
            status: dbProp.status || 'available',
            garage: !!dbProp.garage,
            antiquity: Number(dbProp.antiquity) || 0,
            expenses: Number(dbProp.expenses) || 0,
            createdAt: dbProp.created_at, // Important for sorting
            publishDate: dbProp.created_at, // Fallback for publishDate
            gallery: dbProp.gallery_images || [],
            isBrandNew: dbProp.is_brand_new || false,
        }
    };
}
