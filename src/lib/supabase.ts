import { createClient } from '@supabase/supabase-js';
import { validateEnvironment, getEnvVar } from './env-validation';

// Validate environment variables on module load
validateEnvironment();

const supabaseUrl = getEnvVar('PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('PUBLIC_SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
