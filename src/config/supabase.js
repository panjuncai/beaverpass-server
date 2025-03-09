import { createClient } from '@supabase/supabase-js';
import loadEnv from './env.js';
loadEnv();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error('Missing SUPABASE_KEY environment variable');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 