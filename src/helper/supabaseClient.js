import {createClient} from '@supabase/supabase-js'

const supabaseUrl = 'https://vztkelpnqpewnysbzqko.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dGtlbHBucXBld255c2J6cWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODkyMzQsImV4cCI6MjA1ODY2NTIzNH0.iGZhJK1FeAmPI_l-9Ph9rP9TSpy7ftzXFIgoYj0FLHQ';

const supabase= createClient(supabaseUrl,supabaseAnonKey);
export default supabase;