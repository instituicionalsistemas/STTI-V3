import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prjewxrgechpvqeefyns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByamV3eHJnZWNocHZxZWVmeW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzkxNzYsImV4cCI6MjA3MTY1NTE3Nn0.J_X98bC0Cd56Jfim7082KXM_5jc9BJb45bcrRbxC3GI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
