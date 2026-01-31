-- Adiciona coluna cor à tabela veiculo (seguro: não dá erro se já existir)
ALTER TABLE public.veiculo
ADD COLUMN IF NOT EXISTS cor text;
