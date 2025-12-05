import { supabase } from './supabase';
import { logger } from './logger';

export interface Lead {
    id: string;
    property_id?: string;
    agent_id?: string;
    name: string;
    email?: string;
    phone?: string;
    message?: string;
    source: 'website' | 'phone' | 'referral' | 'whatsapp';
    status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
    notes?: string;
    created_at: string;
    updated_at: string;
    // Joined data
    properties?: {
        id: string;
        title: string;
        city: string;
    };
}

export interface CreateLeadData {
    property_id?: string;
    agent_id: string;
    name: string;
    email?: string;
    phone?: string;
    message?: string;
    source?: string;
}

export const LEAD_STATUS_OPTIONS = [
    { uid: 'new', name: 'Nuevo', color: 'primary' },
    { uid: 'contacted', name: 'Contactado', color: 'secondary' },
    { uid: 'qualified', name: 'Calificado', color: 'warning' },
    { uid: 'converted', name: 'Convertido', color: 'success' },
    { uid: 'lost', name: 'Perdido', color: 'danger' },
] as const;

export const LEAD_SOURCE_OPTIONS = [
    { uid: 'website', name: 'Sitio Web' },
    { uid: 'phone', name: 'Teléfono' },
    { uid: 'referral', name: 'Referido' },
    { uid: 'whatsapp', name: 'WhatsApp' },
] as const;

/**
 * Get leads for an agent
 */
export async function getAgentLeads(agentId: string): Promise<Lead[]> {
    const { data, error } = await supabase
        .from('leads')
        .select(`
            *,
            properties (
                id,
                title,
                city
            )
        `)
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

    if (error) {
        logger.error('Error fetching agent leads', error);
        return [];
    }

    return data || [];
}

/**
 * Create a new lead
 */
export async function createLead(leadData: CreateLeadData): Promise<Lead | null> {
    const { data, error } = await supabase
        .from('leads')
        .insert({
            ...leadData,
            status: 'new'
        })
        .select()
        .single();

    if (error) {
        logger.error('Error creating lead', error);
        return null;
    }

    return data;
}

/**
 * Update lead status
 */
export async function updateLeadStatus(leadId: string, status: Lead['status']): Promise<boolean> {
    const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadId);

    if (error) {
        logger.error('Error updating lead status', error);
        return false;
    }

    return true;
}

/**
 * Update lead notes
 */
export async function updateLeadNotes(leadId: string, notes: string): Promise<boolean> {
    const { error } = await supabase
        .from('leads')
        .update({ notes })
        .eq('id', leadId);

    if (error) {
        logger.error('Error updating lead notes', error);
        return false;
    }

    return true;
}

/**
 * Delete a lead
 */
export async function deleteLead(leadId: string): Promise<boolean> {
    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

    if (error) {
        logger.error('Error deleting lead', error);
        return false;
    }

    return true;
}

/**
 * Get lead statistics for an agent
 */
export async function getLeadStats(agentId: string) {
    const { data, error } = await supabase
        .from('leads')
        .select('status')
        .eq('agent_id', agentId);

    if (error) {
        logger.error('Error fetching lead stats', error);
        return { new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0, total: 0 };
    }

    const leads = data || [];
    return {
        new: leads.filter(l => l.status === 'new').length,
        contacted: leads.filter(l => l.status === 'contacted').length,
        qualified: leads.filter(l => l.status === 'qualified').length,
        converted: leads.filter(l => l.status === 'converted').length,
        lost: leads.filter(l => l.status === 'lost').length,
        total: leads.length
    };
}
