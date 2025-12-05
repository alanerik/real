import { supabase } from './supabase';
import { logger } from './logger';

export interface Agent {
    id: string;
    user_id: string;
    name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    license_number?: string;
    status: 'active' | 'inactive' | 'suspended';
    bio?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateAgentData {
    user_id: string;
    name: string;
    email: string;
    phone?: string;
    license_number?: string;
    bio?: string;
}

/**
 * Get agent by user ID (from Supabase Auth)
 */
export async function getAgentByUserId(userId: string): Promise<Agent | null> {
    const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

    if (error) {
        if (error.code !== 'PGRST116') { // Not found is ok
            logger.error('Error fetching agent by user_id', error);
        }
        return null;
    }

    return data;
}

/**
 * Get agent by ID
 */
export async function getAgentById(agentId: string): Promise<Agent | null> {
    const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

    if (error) {
        logger.error('Error fetching agent by id', error);
        return null;
    }

    return data;
}

/**
 * Get all active agents
 */
export async function getAllAgents(): Promise<Agent[]> {
    const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'active')
        .order('name');

    if (error) {
        logger.error('Error fetching all agents', error);
        return [];
    }

    return data || [];
}

/**
 * Create a new agent (admin only)
 */
export async function createAgent(agentData: CreateAgentData): Promise<Agent | null> {
    const { data, error } = await supabase
        .from('agents')
        .insert({
            ...agentData,
            status: 'active'
        })
        .select()
        .single();

    if (error) {
        logger.error('Error creating agent', error);
        return null;
    }

    return data;
}

/**
 * Update agent profile
 */
export async function updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent | null> {
    const { data, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', agentId)
        .select()
        .single();

    if (error) {
        logger.error('Error updating agent', error);
        return null;
    }

    return data;
}

/**
 * Get agent's properties with counts
 */
export async function getAgentStats(agentId: string) {
    const [propertiesRes, leadsRes, commissionsRes] = await Promise.all([
        supabase
            .from('properties')
            .select('id, status, approval_status', { count: 'exact' })
            .eq('agent_id', agentId),
        supabase
            .from('leads')
            .select('id, status', { count: 'exact' })
            .eq('agent_id', agentId),
        supabase
            .from('agent_commissions')
            .select('capturing_amount, selling_amount, status')
            .or(`capturing_agent_id.eq.${agentId},selling_agent_id.eq.${agentId}`)
    ]);

    const properties = propertiesRes.data || [];
    const leads = leadsRes.data || [];
    const commissions = commissionsRes.data || [];

    // Calculate stats
    const pendingProperties = properties.filter(p => p.approval_status === 'pending').length;
    const approvedProperties = properties.filter(p => p.approval_status === 'approved').length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const totalLeads = leads.length;

    const pendingCommissions = commissions
        .filter(c => c.status === 'pending')
        .reduce((acc, c) => acc + (Number(c.capturing_amount) || 0) + (Number(c.selling_amount) || 0), 0);

    const paidCommissions = commissions
        .filter(c => c.status === 'paid')
        .reduce((acc, c) => acc + (Number(c.capturing_amount) || 0) + (Number(c.selling_amount) || 0), 0);

    return {
        properties: {
            pending: pendingProperties,
            approved: approvedProperties,
            total: properties.length
        },
        leads: {
            new: newLeads,
            total: totalLeads
        },
        commissions: {
            pending: pendingCommissions,
            paid: paidCommissions,
            total: pendingCommissions + paidCommissions
        }
    };
}
