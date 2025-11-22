import { supabase } from './supabase';

export const getProviders = async () => {
    const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching providers:', error);
        throw error;
    }

    return data;
};

export const createProvider = async (provider) => {
    const { data, error } = await supabase
        .from('service_providers')
        .insert([provider])
        .select()
        .single();

    if (error) {
        console.error('Error creating provider:', error);
        throw error;
    }

    return data;
};

export const updateProvider = async (id, provider) => {
    const { data, error } = await supabase
        .from('service_providers')
        .update(provider)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating provider:', error);
        throw error;
    }

    return data;
};

export const deleteProvider = async (id) => {
    const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting provider:', error);
        throw error;
    }

    return true;
};
