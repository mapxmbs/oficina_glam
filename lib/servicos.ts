/**
 * Serviços para dropdown (manutenções).
 * Busca no Supabase (tabela servicos). Fallback estático se tabela não existir.
 */

import { supabase } from './supabase';

export const SERVICOS_FALLBACK = [
  'Troca de Óleo', 'Revisão', 'Pneus', 'Freios', 'Bateria', 'Alinhamento',
  'Balanceamento', 'Suspensão', 'Troca de óleo e filtros', 'Revisão preventiva',
] as const;

let cached: string[] | null = null;

export async function fetchServicos(): Promise<string[]> {
  if (cached) return cached;
  try {
    const { data, error } = await supabase
      .from('servicos')
      .select('nome')
      .eq('ativo', true)
      .order('nome');
    if (!error && data?.length) {
      cached = [...new Set(data.map((r) => String(r.nome).trim()).filter(Boolean))];
      return cached;
    }
  } catch (_) {
    /* ignore */
  }
  return [...SERVICOS_FALLBACK];
}

export function clearServicosCache() {
  cached = null;
}
