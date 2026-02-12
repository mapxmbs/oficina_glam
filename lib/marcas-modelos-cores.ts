/**
 * Marcas, modelos e cores para dropdown (Meu Carro).
 * Busca no Supabase (tabelas marcas, modelos, cores). Fallback para car-data se não existir.
 */

import { supabase } from './supabase';
import { CORES, MARCAS, getModelosByMarca } from './car-data';

let cachedMarcas: string[] | null = null;
let cachedCores: string[] | null = null;
const cachedModelos: Record<string, string[]> = {};

export async function fetchMarcas(): Promise<string[]> {
  if (cachedMarcas) return cachedMarcas;
  try {
    const { data, error } = await supabase
      .from('marcas')
      .select('nome')
      .eq('ativo', true)
      .order('nome');
    if (!error && data?.length) {
      cachedMarcas = data.map((r) => String(r.nome).trim()).filter(Boolean);
      return cachedMarcas;
    }
  } catch (_) {
    /* ignore */
  }
  return [...MARCAS];
}

export async function fetchModelosByMarca(marcaNome: string): Promise<string[]> {
  if (!marcaNome) return [];
  if (cachedModelos[marcaNome]) return cachedModelos[marcaNome];
  try {
    const { data: marcaRow } = await supabase
      .from('marcas')
      .select('id')
      .ilike('nome', marcaNome)
      .limit(1)
      .single();
    if (!marcaRow?.id) return getModelosByMarca(marcaNome);
    const { data, error } = await supabase
      .from('modelos')
      .select('nome')
      .eq('marca_id', marcaRow.id)
      .eq('ativo', true)
      .order('nome');
    if (!error && data?.length) {
      const list = data.map((r) => String(r.nome).trim()).filter(Boolean);
      cachedModelos[marcaNome] = list;
      return list;
    }
  } catch (_) {
    /* ignore */
  }
  return getModelosByMarca(marcaNome);
}

export async function fetchCores(): Promise<string[]> {
  if (cachedCores) return cachedCores;
  try {
    const { data, error } = await supabase
      .from('cores')
      .select('nome')
      .eq('ativo', true)
      .order('nome');
    if (!error && data?.length) {
      cachedCores = data.map((r) => String(r.nome).trim()).filter(Boolean);
      return cachedCores;
    }
  } catch (_) {
    /* ignore */
  }
  return [...CORES];
}

export function clearMarcasModelosCoresCache() {
  cachedMarcas = null;
  cachedCores = null;
  Object.keys(cachedModelos).forEach((k) => delete cachedModelos[k]);
}
