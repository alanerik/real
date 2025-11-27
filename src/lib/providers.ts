import { supabase } from './supabase';
import { createSupabaseError } from './errors';
import { logger } from './logger';

interface ServiceProvider {
    id?: string;
    name: string;
    trade: string;
    phone: string;
    email?: string;
    created_at?: string;
}

export const getProviders = async () => {
    logger.supabase('SELECT ALL', 'service_providers');

    const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        throw createSupabaseError(error, 'getProviders', 'service_providers');
    }

    return data;
};

export const createProvider = async (provider: Partial<ServiceProvider>) => {
    logger.supabase('INSERT', 'service_providers', { name: provider.name });

    const { data, error } = await supabase
        .from('service_providers')
        .insert([provider])
        .select()
        .single();

    if (error) {
        throw createSupabaseError(error, 'createProvider', 'service_providers');
    }

    logger.info('Service provider created successfully', { id: data.id, name: data.name });
    return data;
};

export const updateProvider = async (id: string, provider: Partial<ServiceProvider>) => {
    logger.supabase('UPDATE', 'service_providers', { id });

    const { data, error } = await supabase
        .from('service_providers')
        .update(provider)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw createSupabaseError(error, 'updateProvider', 'service_providers');
    }

    logger.info('Service provider updated successfully', { id });
    return data;
};

export const deleteProvider = async (id: string) => {
    logger.supabase('DELETE', 'service_providers', { id });

    const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', id);

    if (error) {
        throw createSupabaseError(error, 'deleteProvider', 'service_providers');
    }

    logger.info('Service provider deleted successfully', { id });
    return true;
};
