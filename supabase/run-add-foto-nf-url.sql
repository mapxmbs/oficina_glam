-- ============================================================
-- COLUNA "foto_nf_url" NA TABELA MANUTENCOES
-- ============================================================
-- 1. Abra o Supabase Dashboard do seu projeto
-- 2. Vá em SQL Editor
-- 3. Cole o comando abaixo e clique em Run
-- ============================================================
-- Necessário para anexar fotos de notas fiscais nas manutenções.
-- ============================================================

ALTER TABLE public.manutencoes
ADD COLUMN IF NOT EXISTS foto_nf_url text;
