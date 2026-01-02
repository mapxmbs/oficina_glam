import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native'; // <--- Importante
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://rsnumsvkxfahvzccgdfp.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_XyOh8hhcRZVVVNYm-DC7_A_NJA--Oys';

// Essa lógica escolhe o armazenamento certo dependendo de onde está rodando
const storageAdapter = Platform.OS === 'web' 
  ? undefined // Na web, usa o padrão do navegador (localStorage)
  : AsyncStorage; // No celular, usa o AsyncStorage nativo

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});