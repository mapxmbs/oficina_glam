-- ============================================================
-- TABELAS PARA ADMIN: postos, marcas, modelos, cores
-- Futuramente o painel admin permite inserir/editar.
-- ============================================================

-- Postos de combustível (uso em abastecimentos + dropdown)
CREATE TABLE IF NOT EXISTS public.postos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome text NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Marcas de veículos
CREATE TABLE IF NOT EXISTS public.marcas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome text NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Modelos (vinculados à marca)
CREATE TABLE IF NOT EXISTS public.modelos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  marca_id bigint NOT NULL REFERENCES public.marcas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(marca_id, nome)
);

-- Cores (uso em veículo)
CREATE TABLE IF NOT EXISTS public.cores (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome text NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para busca
CREATE INDEX IF NOT EXISTS idx_postos_nome ON public.postos(nome);
CREATE INDEX IF NOT EXISTS idx_marcas_nome ON public.marcas(nome);
CREATE INDEX IF NOT EXISTS idx_modelos_marca ON public.modelos(marca_id);
CREATE INDEX IF NOT EXISTS idx_modelos_nome ON public.modelos(nome);
CREATE INDEX IF NOT EXISTS idx_cores_nome ON public.cores(nome);
