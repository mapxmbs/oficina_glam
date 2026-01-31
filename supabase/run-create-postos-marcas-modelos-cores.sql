-- ============================================================
-- CRIAR TABELAS postos, marcas, modelos, cores + SEED postos
-- ============================================================
-- 1. Abra o Supabase Dashboard do seu projeto
-- 2. Vá em SQL Editor
-- 3. Cole todo este arquivo e execute (Run)
-- ============================================================

-- ------ TABELAS ------
CREATE TABLE IF NOT EXISTS public.postos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome text NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marcas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome text NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.modelos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  marca_id bigint NOT NULL REFERENCES public.marcas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(marca_id, nome)
);

CREATE TABLE IF NOT EXISTS public.cores (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome text NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_postos_nome ON public.postos(nome);
CREATE INDEX IF NOT EXISTS idx_marcas_nome ON public.marcas(nome);
CREATE INDEX IF NOT EXISTS idx_modelos_marca ON public.modelos(marca_id);
CREATE INDEX IF NOT EXISTS idx_modelos_nome ON public.modelos(nome);
CREATE INDEX IF NOT EXISTS idx_cores_nome ON public.cores(nome);

-- ------ SEED POSTOS ------
INSERT INTO public.postos (nome) VALUES
  ('Atem'), ('Shell'), ('Equador'), ('Rezende'), ('Ipiranga'),
  ('Ale'), ('BR'), ('Raízen'), ('Texaco'), ('Total'), ('Vibra (ex-BR)'), ('Outros')
ON CONFLICT (nome) DO NOTHING;
