-- Adiciona coluna marca à tabela veiculo (compatível com dropdown Marca/Modelo)
ALTER TABLE public.veiculo
ADD COLUMN IF NOT EXISTS marca text;
