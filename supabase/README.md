# Supabase - Oficina Glam

## Tabela `documentos`

A tela **Visualização de Documentos** usa a tabela `documentos` no Supabase.

Sua tabela já existe com: `id`, `created_at`, `titulo`, `validade`, `foto_url`, `tipo`.

### Para a tela de documentos do veículo (CNH, CRLV) funcionar

1. Abra o **Supabase Dashboard** do seu projeto.
2. Vá em **SQL Editor**.
3. Execute o conteúdo do arquivo `migrations/001_create_documentos.sql`.

Isso **altera** a tabela existente:

- Adiciona a coluna `vehicle_id` (referência ao `veiculo`) para vincular documentos ao veículo.
- Permite `titulo` vazio quando o documento vem da tela do veículo.
- Cria índices para buscas por veículo e tipo.

O app usa a coluna **`foto_url`** (não `arquivo_url`) para a URL da imagem.

---

## Tabelas `oficinas`, `servicos`, `oficina_servicos`

Rede de oficinas associadas (ex.: Japurá Pneus), com endereços, horários e serviços por unidade. Pensado para um perfil de administrador gerenciar lojas e serviços no futuro.

### Estrutura

- **oficinas**: id, nome, endereco, cidade, estado, cep, horario_seg_sex, horario_sabado, tipo (loja | truck_center | pit_stop), telefone, whatsapp, ativo.
- **servicos**: id, nome, categoria (leves_todos | leves_mecanica | pesada | pesada_mecanica), ativo.
- **oficina_servicos**: oficina_id, servico_id (N:N – quais serviços cada oficina oferece).

### Como aplicar

1. No **Supabase Dashboard** → **SQL Editor**.
2. Execute na ordem:
   - `migrations/002_create_oficinas_servicos.sql` (cria as tabelas).
   - `migrations/003_seed_oficinas_servicos_japura.sql` (insere Japurá Pneus: unidades, horários e vínculos de serviços).

O seed inclui todas as unidades Japurá (AM, PA, RO, AC, RR, AP), horários de funcionamento e contato (92) 3642-1313 / 0800 1313006.
