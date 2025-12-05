import { supabase } from './supabase';
import { logger } from './logger';

export interface Commission {
    id: string;
    property_id?: string;
    capturing_agent_id: string;
    selling_agent_id?: string;
    sale_price: number;
    commission_rate: number;
    capturing_share: number;
    selling_share: number;
    capturing_amount: number;
    selling_amount: number;
    status: 'pending' | 'paid' | 'cancelled';
    payment_date?: string;
    notes?: string;
    created_at: string;
    // Joined data
    properties?: {
        id: string;
        title: string;
        city: string;
    };
    capturing_agent?: {
        id: string;
        name: string;
    };
    selling_agent?: {
        id: string;
        name: string;
    };
}

export interface CommissionBreakdown {
    capturingAmount: number;
    sellingAmount: number;
    capturingShare: number;
    sellingShare: number;
    totalCommission: number;
}

// Commission constants
export const TOTAL_COMMISSION_RATE = 6; // 6% del valor de venta
export const CAPTURE_AND_SELL_SHARE = 40; // 40% del 6% si capta y vende
export const CAPTURE_ONLY_SHARE = 20; // 20% del 6% si solo capta
export const SELL_ONLY_SHARE = 20; // 20% del 6% si solo vende

/**
 * Calculate commission breakdown
 * @param salePrice - Precio de venta de la propiedad
 * @param sameAgent - Si el mismo agente captó y vendió
 */
export function calculateCommission(salePrice: number, sameAgent: boolean): CommissionBreakdown {
    const totalCommission = salePrice * (TOTAL_COMMISSION_RATE / 100);

    if (sameAgent) {
        // Mismo agente capta y vende: 40% del 6%
        const capturingAmount = totalCommission * (CAPTURE_AND_SELL_SHARE / 100);
        return {
            capturingAmount,
            sellingAmount: 0,
            capturingShare: CAPTURE_AND_SELL_SHARE,
            sellingShare: 0,
            totalCommission
        };
    } else {
        // Diferentes agentes: cada uno 20% del 6%
        const shareAmount = totalCommission * (CAPTURE_ONLY_SHARE / 100);
        return {
            capturingAmount: shareAmount,
            sellingAmount: shareAmount,
            capturingShare: CAPTURE_ONLY_SHARE,
            sellingShare: SELL_ONLY_SHARE,
            totalCommission
        };
    }
}

/**
 * Create a commission record when a sale is completed
 */
export async function createCommission(
    propertyId: string,
    capturingAgentId: string,
    sellingAgentId: string | null,
    salePrice: number
): Promise<Commission | null> {
    const sameAgent = !sellingAgentId || capturingAgentId === sellingAgentId;
    const breakdown = calculateCommission(salePrice, sameAgent);

    const { data, error } = await supabase
        .from('agent_commissions')
        .insert({
            property_id: propertyId,
            capturing_agent_id: capturingAgentId,
            selling_agent_id: sameAgent ? capturingAgentId : sellingAgentId,
            sale_price: salePrice,
            commission_rate: TOTAL_COMMISSION_RATE,
            capturing_share: breakdown.capturingShare,
            selling_share: breakdown.sellingShare,
            capturing_amount: breakdown.capturingAmount,
            selling_amount: breakdown.sellingAmount,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        logger.error('Error creating commission', error);
        return null;
    }

    return data;
}

/**
 * Get commissions for an agent (both as capturer and seller)
 */
export async function getAgentCommissions(agentId: string): Promise<Commission[]> {
    const { data, error } = await supabase
        .from('agent_commissions')
        .select(`
            *,
            properties (
                id,
                title,
                city
            )
        `)
        .or(`capturing_agent_id.eq.${agentId},selling_agent_id.eq.${agentId}`)
        .order('created_at', { ascending: false });

    if (error) {
        logger.error('Error fetching agent commissions', error);
        return [];
    }

    return data || [];
}

/**
 * Get commission summary for an agent
 */
export async function getCommissionSummary(agentId: string) {
    const commissions = await getAgentCommissions(agentId);

    let pendingTotal = 0;
    let paidTotal = 0;
    let pendingCount = 0;
    let paidCount = 0;

    commissions.forEach(c => {
        const amount = c.capturing_agent_id === agentId
            ? c.capturing_amount
            : c.selling_amount;

        if (c.status === 'pending') {
            pendingTotal += Number(amount) || 0;
            pendingCount++;
        } else if (c.status === 'paid') {
            paidTotal += Number(amount) || 0;
            paidCount++;
        }
    });

    return {
        pending: { total: pendingTotal, count: pendingCount },
        paid: { total: paidTotal, count: paidCount },
        all: { total: pendingTotal + paidTotal, count: commissions.length }
    };
}

/**
 * Mark commission as paid (admin only)
 */
export async function markCommissionPaid(commissionId: string): Promise<boolean> {
    const { error } = await supabase
        .from('agent_commissions')
        .update({
            status: 'paid',
            payment_date: new Date().toISOString()
        })
        .eq('id', commissionId);

    if (error) {
        logger.error('Error marking commission as paid', error);
        return false;
    }

    return true;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}
