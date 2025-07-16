import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://svvzxqixpuyzhtzkufxd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2dnp4cWl4cHV5emh0emt1ZnhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4Njc1OTEsImV4cCI6MjA2MzQ0MzU5MX0.sM9yDRlw3Cps0Sg9SK0spHpXnd0jAZOw8_exX_t_4oY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 