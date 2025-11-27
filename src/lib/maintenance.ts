import { supabase } from './supabase';
import { createSupabaseError } from './errors';
import { logger } from './logger';

interface MaintenanceTicket {
  id?: string;
  property_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_provider_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const createMaintenanceTicket = async (ticket: Partial<MaintenanceTicket>) => {
  logger.supabase('INSERT', 'maintenance_tickets', { property_id: ticket.property_id });

  const { data, error } = await supabase
    .from('maintenance_tickets')
    .insert([ticket])
    .select()
    .single();

  if (error) {
    throw createSupabaseError(error, 'createMaintenanceTicket', 'maintenance_tickets');
  }

  logger.info('Maintenance ticket created successfully', { id: data.id });
  return data;
};

export const getMaintenanceTickets = async () => {
  logger.supabase('SELECT ALL', 'maintenance_tickets');

  const { data, error } = await supabase
    .from('maintenance_tickets')
    .select(`
      *,
      properties (
        title,
        city
      ),
      service_providers (
        id,
        name,
        trade,
        phone
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw createSupabaseError(error, 'getMaintenanceTickets', 'maintenance_tickets');
  }

  return data;
};

export const updateMaintenanceTicketStatus = async (id: string, status: MaintenanceTicket['status']) => {
  logger.supabase('UPDATE STATUS', 'maintenance_tickets', { id, status });

  const { data, error } = await supabase
    .from('maintenance_tickets')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw createSupabaseError(error, 'updateMaintenanceTicketStatus', 'maintenance_tickets');
  }

  logger.info('Maintenance ticket status updated', { id, status });
  return data;
};

export const deleteMaintenanceTicket = async (id: string) => {
  logger.supabase('DELETE', 'maintenance_tickets', { id });

  const { error } = await supabase
    .from('maintenance_tickets')
    .delete()
    .eq('id', id);

  if (error) {
    throw createSupabaseError(error, 'deleteMaintenanceTicket', 'maintenance_tickets');
  }

  logger.info('Maintenance ticket deleted successfully', { id });
  return true;
};

export const assignProviderToTicket = async (ticketId: string, providerId: string) => {
  logger.supabase('ASSIGN PROVIDER', 'maintenance_tickets', { ticketId, providerId });

  const { data, error } = await supabase
    .from('maintenance_tickets')
    .update({ assigned_provider_id: providerId })
    .eq('id', ticketId)
    .select(`
      *,
      properties (
        title,
        city
      ),
      service_providers (
        id,
        name,
        trade,
        phone
      )
    `)
    .single();

  if (error) {
    throw createSupabaseError(error, 'assignProviderToTicket', 'maintenance_tickets');
  }

  logger.info('Provider assigned to ticket', { ticketId, providerId });
  return data;
};

export const getTicketsByProperty = async (propertyId: string) => {
  logger.supabase('SELECT BY PROPERTY', 'maintenance_tickets', { propertyId });

  const { data, error } = await supabase
    .from('maintenance_tickets')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw createSupabaseError(error, 'getTicketsByProperty', 'maintenance_tickets');
  }

  return data;
};
