/**
 * Veículo ativo – entidade central do app
 * Toda inserção filha (abastecimentos, manutencoes, documentos) deve depender dele.
 */

import { supabase } from './supabase';

export type Vehicle = {
  id: string;
  marca?: string | null;
  modelo?: string | null;
  placa?: string | null;
  ano?: number | null;
  versao?: string | null;
  cor?: string | null;
  apelido?: string | null;
  foto_url?: string | null;
  created_at?: string;
};

/** Retorna o veículo ativo (único). null se não existir. */
export async function getActiveVehicle(): Promise<Vehicle | null> {
  const { data, error } = await supabase
    .from('veiculo')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar veículo:', error);
    return null;
  }
  return data;
}

/** ID do veículo ativo ou null */
export async function getActiveVehicleId(): Promise<string | null> {
  const v = await getActiveVehicle();
  return v?.id ?? null;
}
