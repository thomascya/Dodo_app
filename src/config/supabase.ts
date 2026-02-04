import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qxempvnxmcvbyrnatmeo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4ZW1wdm54bWN2YnlybmF0bWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjI2OTEsImV4cCI6MjA4NTY5ODY5MX0.7nmH6UG6Bh3ue-Wozcx1yerG7SnPHQES3NDg0EKISRU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
