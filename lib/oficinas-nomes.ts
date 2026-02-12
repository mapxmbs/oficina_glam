/**
 * Nomes de oficinas para dropdown (formulário de manutenção).
 * Busca no Supabase (tabela oficinas). Fallback estático se tabela não existir.
 */

import { supabase } from './supabase';

export const OFICINAS_FALLBACK = [
  'Oficina Mecânica da Ana - Paulista',
  'Auto Center Premium - Augusta',
  'Glam Motors Express - Faria Lima',
  'Casa do Mecânico - Pinheiros',
  'Speed Service - Vila Madalena',
  'Oficina VIP - Itaim Bibi',
] as const;

let cached: string[] | null = null;

export async function fetchOficinasNomes(): Promise<string[]> {
  if (cached) return cached;
  try {
    const { data, error } = await supabase
      .from('oficinas')
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
  return [...OFICINAS_FALLBACK];
}

export function clearOficinasNomesCache() {
  cached = null;
}
