import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wkpzxijmnkqakwlrqfgq.supabase.co';
const supabaseAnonKey = 'sb_publishable_WbQi0MKSr3khXJovMnBZQg_XOUjibha';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);