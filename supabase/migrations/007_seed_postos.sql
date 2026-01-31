-- ============================================================
-- SEED: Postos de combustível (admin pode inserir mais depois)
-- ============================================================

INSERT INTO public.postos (nome) VALUES
  ('Atem'),
  ('Shell'),
  ('Equador'),
  ('Rezende'),
  ('Ipiranga'),
  ('Ale'),
  ('BR'),
  ('Raízen'),
  ('Texaco'),
  ('Total'),
  ('Vibra (ex-BR)'),
  ('Outros')
ON CONFLICT (nome) DO NOTHING;
