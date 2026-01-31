-- Ajusta a tabela documentos existente para suportar documentos do veículo (CNH, CRLV).
-- Sua tabela já tem: id, created_at, titulo, validade, foto_url, tipo.
-- Só adicionamos a coluna vehicle_id para vincular ao veículo.

-- Adiciona a coluna vehicle_id (referência ao veículo)
ALTER TABLE public.documentos
  ADD COLUMN IF NOT EXISTS vehicle_id bigint NULL
  REFERENCES public.veiculo(id) ON DELETE CASCADE;

-- Permite titulo vazio quando o documento vem da tela do veículo (CNH/CRLV)
ALTER TABLE public.documentos
  ALTER COLUMN titulo DROP NOT NULL;

-- Índice para buscar documentos por veículo
CREATE INDEX IF NOT EXISTS idx_documentos_vehicle_id ON public.documentos(vehicle_id);

-- Índice para buscar por tipo
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON public.documentos(tipo);
