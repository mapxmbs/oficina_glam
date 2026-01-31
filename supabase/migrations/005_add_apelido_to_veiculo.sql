-- Adiciona coluna apelido à tabela veiculo (opcional – nome que a cliente dá ao carro)
ALTER TABLE public.veiculo
ADD COLUMN IF NOT EXISTS apelido text;
