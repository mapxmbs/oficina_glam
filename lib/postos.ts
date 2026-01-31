/**
 * Postos de combustível para dropdown (add-fuel).
 * Busca no Supabase (tabela postos). Fallback estático se tabela não existir.
 */

import { supabase } from './supabase';

export const POSTOS_FALLBACK = [
  'Atem',
  'Shell',
  'Equador',
  'Rezende',
  'Ipiranga',
  'Ale',
  'BR',
  'Raízen',
  'Texaco',
  'Total',
  'Vibra (ex-BR)',
  'Outros',
] as const;

export type PostoFallback = (typeof POSTOS_FALLBACK)[number];

let cached: string[] | null = null;

export async function fetchPostos(): Promise<string[]> {
  if (cached) return cached;
  try {
    const { data, error } = await supabase
      .from('postos')
      .select('nome')
      .eq('ativo', true)
      .order('nome');
    if (!error && data?.length) {
      cached = data.map((r) => String(r.nome).trim()).filter(Boolean);
      return cached;
    }
  } catch (_) {
    /* ignore */
  }
  return [...POSTOS_FALLBACK];
}

export function clearPostosCache() {
  cached = null;
}
