const { createClient } = require('@supabase/supabase-js');
require('../config/env')();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error('Missing SUPABASE_KEY environment variable');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase; 