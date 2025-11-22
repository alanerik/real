import { supabase } from './supabase';

export const createMaintenanceTicket = async (ticket) => {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .insert([ticket])
    .select()
    .single();

  if (error) {
    console.error('Error creating maintenance ticket:', error);
    throw error;
  }

  return data;
};

export const getMaintenanceTickets = async () => {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .select(`
      *,
      properties (
        title,
        city
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching maintenance tickets:', error);
    throw error;
  }

  return data;
};

export const updateMaintenanceTicketStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating maintenance ticket status:', error);
    throw error;
  }

  return data;
};

export const deleteMaintenanceTicket = async (id) => {
  const { error } = await supabase
    .from('maintenance_tickets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting maintenance ticket:', error);
    throw error;
  }

  return true;
};
