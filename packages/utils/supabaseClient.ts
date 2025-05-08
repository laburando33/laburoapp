import { createClient } from '@supabase/supabase-js';

// 1. Leemos las variables de entorno
//  “!” en TypeScript indica que estamos seguros de que no son null/undefined
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ||
process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 2. Creamos la instancia de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
