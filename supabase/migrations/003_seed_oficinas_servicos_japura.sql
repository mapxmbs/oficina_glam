-- Seed: Japurá Pneus – oficinas, serviços e vínculos.
-- Execute após 002_create_oficinas_servicos.sql.

-- Contato geral Japurá (usado nas oficinas que não têm telefone próprio)
-- Telefone / WhatsApp: (92) 3642-1313 | 0800 1313006

-- ========== SERVIÇOS ==========
-- Leves (todas as lojas)
INSERT INTO public.servicos (nome, categoria) VALUES
  ('Alinhamento 3D', 'leves_todos'),
  ('Balanceamento', 'leves_todos'),
  ('Montagem', 'leves_todos'),
  ('Calibragem', 'leves_todos'),
  ('Rodízio', 'leves_todos'),
  ('Troca de bateria', 'leves_todos')
ON CONFLICT (nome, categoria) DO NOTHING;

-- Mecânica geral veículos leves
INSERT INTO public.servicos (nome, categoria) VALUES
  ('Freios', 'leves_mecanica'),
  ('Revisão preventiva', 'leves_mecanica'),
  ('Suspensão', 'leves_mecanica'),
  ('Troca de óleo e filtros', 'leves_mecanica')
ON CONFLICT (nome, categoria) DO NOTHING;

-- Linha pesada (Truck Center)
INSERT INTO public.servicos (nome, categoria) VALUES
  ('Rodízio', 'pesada'),
  ('Montagem', 'pesada'),
  ('Alinhamento', 'pesada'),
  ('Balanceamento', 'pesada')
ON CONFLICT (nome, categoria) DO NOTHING;

-- Linha pesada mecânicos (Truck Center Rio Branco)
INSERT INTO public.servicos (nome, categoria) VALUES
  ('Troca de ponteira de direção', 'pesada_mecanica'),
  ('Substituição de manga de eixo', 'pesada_mecanica'),
  ('Rodízio', 'pesada_mecanica'),
  ('Montagem', 'pesada_mecanica'),
  ('Alinhamento', 'pesada_mecanica'),
  ('Balanceamento', 'pesada_mecanica')
ON CONFLICT (nome, categoria) DO NOTHING;

-- ========== OFICINAS ==========
-- Amazonas - AM
INSERT INTO public.oficinas (nome, endereco, cidade, estado, cep, horario_seg_sex, horario_sabado, tipo, telefone, whatsapp) VALUES
  ('Japurá Cachoeirinha', 'Av. Silves, 39 – Cachoeirinha', 'Manaus', 'AM', '69073-175', '07h30 às 18h00', '07h30 às 15h00', 'loja', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Djalma Batista', 'Av. Djalma Batista, 3333 – Chapada', 'Manaus', 'AM', '69050-010', '07h30 às 18h00', '07h30 às 16h00', 'loja', '(92) 3642-1313', '0800 1313006'),
  ('Japurá São Geraldo', 'Av. Djalma Batista, 535 – São Geraldo', 'Manaus', 'AM', '69053-355', '08h00 às 17h00', '08h00 às 15h00', 'loja', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Av. das Torres', 'Av. Gov. José Lindoso, 4601 - Flores', 'Manaus', 'AM', '69058-175', '08h00 às 17h00', '08h00 às 14h00', 'loja', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Via Norte', 'Av. Arquiteto José Henriques Bento Rodrigues, 3177 - R. São Francisco Norte', 'Manaus', 'AM', '69059-800', '08h00 às 17h00', '08h00 às 14h00', 'loja', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Coroado', 'Av. Cosme Ferreira, 2618 – Coroado', 'Manaus', 'AM', '69082-230', '08h00 às 17h00', '08h00 às 13h00', 'loja', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Torquato', 'Av. Torquato Tapajós, 7841 – Loja 02 – Tarumã', 'Manaus', 'AM', '69023-165', '08h00 às 17h00', '08h00 às 13h00', 'loja', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Truck Center - Distrito Industrial', 'Av. Autaz Mirim, 340 – Distrito Industrial I', 'Manaus', 'AM', '69007-000', '07h30 às 17h00', '07h30 às 12h00', 'truck_center', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Truck Center - Torquato Tapajós', 'Av. Torquato Tapajós – Tarumã', 'Manaus', 'AM', '69023-165', '08h00 às 17h00', '08h00 às 13h00', 'truck_center', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Pit Stop – Camapuã', 'Bemol Camapuã – Av. Camapuã, 3105 – Cidade Nova', 'Manaus', 'AM', '69010-720', '08h00 às 18h00', '08h00 às 13h00', 'pit_stop', '(92) 3642-1313', '0800 1313006')
ON CONFLICT (nome, cidade, estado) DO NOTHING;

-- Pará - PA
INSERT INTO public.oficinas (nome, endereco, cidade, estado, cep, horario_seg_sex, horario_sabado, tipo, telefone, whatsapp) VALUES
  ('Japurá Belém', 'Rod. Augusto Montenegro, KM 8 – Coqueiro', 'Belém', 'PA', '66635-110', '08h00 às 18h00', '08h00 às 13h00', 'loja', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Santarém', 'Rod. Santarém - Cuiabá, 2232-A - Caranazal', 'Santarém', 'PA', '68040-358', '08h00 às 18h00', '08h00 às 13h00', 'loja', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Parauapebas', 'PA-160, s/n – Quadra 48 – Parque dos Carajás', 'Parauapebas', 'PA', '68515-000', '08h00 às 18h00', '08h00 às 13h00', 'loja', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Canaã dos Carajás', 'Av. Weyne Cavalcante, 21 – 87 – Quadra 05, Lote – Jardim Florido', 'Canaã dos Carajás', 'PA', '68537-000', '08h00 às 18h00', '08h00 às 12h00', 'loja', '(92) 3642-1313', '0800 1313006')
ON CONFLICT (nome, cidade, estado) DO NOTHING;

-- Rondônia - RO
INSERT INTO public.oficinas (nome, endereco, cidade, estado, cep, horario_seg_sex, horario_sabado, tipo, telefone, whatsapp) VALUES
  ('Japurá Porto Velho', 'R. da Beira, 7810-A – Eldorado', 'Porto Velho', 'RO', '76811-738', '08h00 às 17h00', '08h00 às 12h00', 'loja', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Ji Paraná', 'Av. Transcontinental, 2060 – Jotão', 'Ji-Paraná', 'RO', '76900-063', '07h30 às 17h00', '08h00 às 12h00', 'loja', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Vilhena', 'Av. Celso Mazutti, 8089 – Setor Industrial', 'Vilhena', 'RO', '76980-000', '08h00 às 18h00', '08h00 às 12h00', 'loja', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Ariquemes', 'Sítio São Dimas – BR-364, 4.000', 'Ariquemes', 'RO', '76870-970', '08h00 às 18h00', '08h00 às 12h00', 'loja', '(92) 3642-1313', '0800 1313006')
ON CONFLICT (nome, cidade, estado) DO NOTHING;

-- Acre - AC
INSERT INTO public.oficinas (nome, endereco, cidade, estado, cep, horario_seg_sex, horario_sabado, tipo, telefone, whatsapp) VALUES
  ('Japurá Chico Mendes', 'Via Chico Mendes, 884 – Triângulo Velho', 'Rio Branco', 'AC', '69906-320', '07h00 às 17h00', '07h00 às 12h00', 'loja', '(92) 3642-1313', '0800 1313006'),
  ('Japurá Rio Branco - Truck Center', 'Rodovia BR-364, Saída para Porto Velho, 7207 – Belo Jardim II', 'Rio Branco', 'AC', '69907-868', '07h30 às 17h30', '07h30 às 11h30', 'truck_center', '(92) 3642-1313', '0800 1313006')
ON CONFLICT (nome, cidade, estado) DO NOTHING;

-- Roraima - RR (Truck Center Boa Vista)
INSERT INTO public.oficinas (nome, endereco, cidade, estado, cep, horario_seg_sex, horario_sabado, tipo, telefone, whatsapp) VALUES
  ('Japurá Boa Vista', 'R. Dr. Paulo Coelho Pereira, 1063 – São Vicente', 'Boa Vista', 'RR', '69303-495', '08h00 às 18h00', '08h00 às 14h00', 'truck_center', '(92) 3642-1313', '0800 1313006')
ON CONFLICT (nome, cidade, estado) DO NOTHING;

-- Amapá - AP
INSERT INTO public.oficinas (nome, endereco, cidade, estado, cep, horario_seg_sex, horario_sabado, tipo, telefone, whatsapp) VALUES
  ('Japurá Macapá', 'Av. Raimundo Álvares da Costa, 572 – Central', 'Macapá', 'AP', '68901-256', '08h00 às 18h00', '08h00 às 12h00', 'loja', '(92) 3642-1313', '0800 1313006')
ON CONFLICT (nome, cidade, estado) DO NOTHING;

-- ========== VÍNCULOS OFICINA x SERVIÇO ==========
-- Serviços leves (todas as lojas): todas as oficinas
INSERT INTO public.oficina_servicos (oficina_id, servico_id)
SELECT o.id, s.id FROM public.oficinas o
CROSS JOIN public.servicos s
WHERE s.categoria = 'leves_todos'
ON CONFLICT (oficina_id, servico_id) DO NOTHING;

-- Mecânica geral veículos leves: Djalma Batista, São Geraldo, Av. das Torres, Via Norte (AM), Chico Mendes (AC), Santarém (PA)
INSERT INTO public.oficina_servicos (oficina_id, servico_id)
SELECT o.id, s.id FROM public.oficinas o
CROSS JOIN public.servicos s
WHERE s.categoria = 'leves_mecanica'
  AND ((o.nome = 'Japurá Djalma Batista' AND o.cidade = 'Manaus')
    OR (o.nome = 'Japurá São Geraldo' AND o.cidade = 'Manaus')
    OR (o.nome = 'Japurá Av. das Torres' AND o.cidade = 'Manaus')
    OR (o.nome = 'Japurá Via Norte' AND o.cidade = 'Manaus')
    OR (o.nome = 'Japurá Chico Mendes' AND o.cidade = 'Rio Branco')
    OR (o.nome = 'Japurá Santarém' AND o.cidade = 'Santarém'))
ON CONFLICT (oficina_id, servico_id) DO NOTHING;

-- Linha pesada: Truck Center Distrito Industrial, Torquato Tapajós (AM), Boa Vista (RR)
INSERT INTO public.oficina_servicos (oficina_id, servico_id)
SELECT o.id, s.id FROM public.oficinas o
CROSS JOIN public.servicos s
WHERE s.categoria = 'pesada'
  AND ((o.nome = 'Japurá Truck Center - Distrito Industrial' AND o.cidade = 'Manaus')
    OR (o.nome = 'Japurá Truck Center - Torquato Tapajós' AND o.cidade = 'Manaus')
    OR (o.nome = 'Japurá Boa Vista' AND o.cidade = 'Boa Vista'))
ON CONFLICT (oficina_id, servico_id) DO NOTHING;

-- Linha pesada mecânicos: apenas Truck Center Rio Branco (AC)
INSERT INTO public.oficina_servicos (oficina_id, servico_id)
SELECT o.id, s.id FROM public.oficinas o
CROSS JOIN public.servicos s
WHERE s.categoria = 'pesada_mecanica'
  AND o.nome = 'Japurá Rio Branco - Truck Center' AND o.cidade = 'Rio Branco'
ON CONFLICT (oficina_id, servico_id) DO NOTHING;
