-- ============================================================
-- COLUNA "cor" NA TABELA VEICULO
-- ============================================================
-- 1. Abra o Supabase Dashboard do seu projeto
-- 2. Vá em SQL Editor
-- 3. Cole o comando abaixo e clique em Run
-- ============================================================

ALTER TABLE public.veiculo
ADD COLUMN IF NOT EXISTS cor text;
