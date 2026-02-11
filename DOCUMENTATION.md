# 📱 Oficina Glam - Documentação Completa
> App de manutenção automotiva para mulheres (DIVAs) 💅🚗

**Última atualização:** 27 de Janeiro de 2026

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Projeto](#arquitetura-do-projeto)
3. [Funcionalidades Implementadas](#funcionalidades-implementadas)
4. [Design System](#design-system)
5. [Banco de Dados](#banco-de-dados)
6. [Integrações](#integrações)
7. [TO-DO / Funcionalidades Pendentes](#to-do--funcionalidades-pendentes)
8. [Ideias Futuras](#ideias-futuras)
9. [Como Executar](#como-executar)

---

## 🎯 Visão Geral

**Oficina Glam** é um aplicativo mobile desenvolvido com React Native + Expo, focado em empoderar mulheres no cuidado automotivo. O app oferece gerenciamento completo de veículos, manutenções, combustível, lembretes inteligentes e acesso a uma rede de oficinas credenciadas e seguras.

### 🎨 Identidade Visual
- **Público-alvo:** Mulheres (DIVAs) que querem autonomia no cuidado do carro
- **Tom de voz:** Empoderador, acolhedor, feminino, confiante
- **Cores:** Paleta rosa do suave ao intenso (#F5EEEE → #AC1754)

### 🛠️ Stack Tecnológica
- **Frontend:** React Native (Expo Router)
- **Estilização:** NativeWind (Tailwind CSS para RN)
- **Backend:** Supabase (PostgreSQL + Storage + Auth)
- **Tipografia:** Lovelo Black, Montserrat Alternates, Inter
- **Ícones:** lucide-react-native
- **Upload de Imagens:** expo-image-picker + base64-arraybuffer

---

## 🏗️ Arquitetura do Projeto

```
oficina_glam/
├── app/
│   ├── (tabs)/              # Navegação por abas
│   │   ├── _layout.tsx      # Config das abas (5 tabs centralizadas)
│   │   ├── index.tsx        # 🏠 Home/Dashboard
│   │   ├── vehicle.tsx      # 🚗 Meu Carro
│   │   ├── fuel.tsx         # ⛽ Combustível
│   │   ├── maintenance.tsx  # 🔧 Manutenção
│   │   └── workshops.tsx    # 🏢 Rede Glam
│   ├── ai/
│   │   └── manual-chat.tsx  # 🤖 Chat IA (preview)
│   ├── forms/
│   │   ├── add-fuel.tsx     # Adicionar abastecimento
│   │   ├── add-maintenance.tsx # Adicionar manutenção
│   │   ├── add-document.tsx # Upload de documentos
│   │   └── edit-vehicle.tsx # Editar veículo
│   ├── notifications.tsx    # 🔔 Lembretes inteligentes
│   ├── profile.tsx          # 👤 Perfil (TO-DO)
│   ├── _layout.tsx          # Root layout
│   └── global.css           # Estilos globais
├── components/              # Componentes reutilizáveis
│   ├── FloatingChatButton.tsx  # Bolha de chat Leninha (rosto + "Em que posso ajudar?")
│   ├── SearchModal.tsx         # Modal de pesquisa global (unidades, IA, serviços, etc.)
├── lib/
│   ├── supabase.ts          # Cliente Supabase
│   └── lembretes.ts         # Lógica de lembretes inteligentes
├── src/
│   └── theme/
│       └── colors.ts        # Paleta de cores DIVA
├── assets/
│   ├── fonts/               # Lovelo, Montserrat, Inter
│   └── images/
└── constants/
    └── theme.ts
```

---

## ✅ Funcionalidades Implementadas

### 1️⃣ **Home/Dashboard (index.tsx)**
#### ✨ Implementado:
- ✅ Header com perfil, **pesquisa global** e notificações
- ✅ **Ícone de pesquisa** no header (lupa) – abre modal de busca estratégica
- ✅ Card "Próximo Alerta" com prioridade visual
- ✅ **Central de IAs** (bloco único com fundo accent):
  - Leninha – chat, perguntas e dúvidas sobre o carro
  - Verificador de laudos – análise inteligente (integrado na central)
- ✅ Grid de atalhos (2 cards) navegação rápida (Veículo, Oficinas)
- ✅ **Carousel de Dicas da Glam:**
  - 3 dicas semanais deslizáveis (swipe horizontal)
  - Cards clicáveis com categorias (Manutenção, Economia, Segurança)
  - Indicadores de página (1/3, 2/3, 3/3)
  - Ícones, frequência e facilidade de cada dica
- ✅ **Seção de Redes Sociais (estratégica/discreta):**
  - Links para Instagram e TikTok (@glamoficina)
  - Botões funcionais com ícones

#### 🔍 Pesquisa global (SearchModal):
- Modal deslizante com busca em tempo real
- Categorias: Localização (unidades), IA (Leninha, verificador), Veículo (meu carro, documentos), Serviços (combustível, manutenção), Ajuda (notificações, suporte)
- Navegação direta para as telas ao selecionar resultado
- Adaptável iOS e Android (SafeArea, Platform)

#### 🤖 Botão flutuante – Chat Leninha (FloatingChatButton):
- Bolha de chat com avatar da Leninha (rosto Oficina Glam)
- Mensagem simpática: "Em que posso ajudar?"
- Ao tocar, abre o chat em `/ia-module`
- Posicionado acima da tab bar, adaptável a iOS/Android

#### 📊 Dados:
- Conecta com Supabase para buscar veículo e última manutenção
- Mock de dados de lembretes

---

### 6️⃣ **Perfil (profile.tsx)**
#### ✨ Implementado:
- ✅ **Header Premium:** Gradiente rosa vibrante com elementos decorativos
- ✅ **Upload de Foto de Perfil:**
  - Seleção de imagem via expo-image-picker
  - Upload para Supabase Storage (`arquivos/PERFIL/`)
  - Círculo de foto sobreposto ao header com botão de câmera
  - Loading durante upload
- ✅ **Formulário Completo com 3 Cards:**
  1. **Dados Pessoais:**
     - Nome Completo
     - Apelido (usado pela IA em notificações e chat)
     - Signo (12 opções em scroll horizontal)
  2. **Contato:**
     - E-mail (keyboard tipo email)
     - Celular (keyboard tipo phone-pad)
  3. **Documento:**
     - CPF (keyboard numérico)
- ✅ **Modo de Edição:**
  - Botão Edit2 no header alterna entre leitura e edição
  - Quando editando, inputs ficam ativos (TextInput)
  - Quando visualizando, dados ficam em blocos de leitura
  - Botão "Salvar" substitui ícone de editar
- ✅ **Preview Dinâmico:**
  - Nome completo aparece abaixo da foto
  - Apelido com ícone Sparkles
  - Signo com ícone Star
- ✅ **Integração Supabase:**
  - Busca dados da tabela `perfis`
  - Insert/Update com validação
  - Alerts de sucesso/erro
- ✅ **Validação e Feedback:**
  - Placeholders informativos
  - Dica sobre uso do apelido pela IA
  - Aviso de segurança sobre criptografia futura

#### 🎨 Design:
- Paleta rosa completa (rosaSuper → rosaEscuro)
- Cards com sombras e bordas arredondadas (rounded-3xl)
- Ícones personalizados para cada seção (User, Mail, Crown)
- ScrollView para navegação fluida
- Tipografia: LoveloBlack (títulos), MontserratAlternates (labels), Inter (body)

#### 📊 Dados:
- Conecta com tabela `perfis` (Supabase)
- TODO: Integrar com Auth quando implementado (user.id)

---

### 2️⃣ **Meu Carro (vehicle.tsx)**
#### ✨ Implementado:
- ✅ Header rosa vibrante com gradiente e botão de edição
- ✅ **Upload de foto do veículo:**
  - Visualização da foto atual
  - Botão de câmera sobreposto
  - Loading durante upload
  - Armazenamento no Supabase Storage (`arquivos/FOTO_CARRO/`)
- ✅ **Formulário de identificação:**
  - Modelo, Placa (destaque em rosa vibrante), Ano, Versão, Cor
  - Modo edição/visualização (toggle)
  - Campos estilizados com paleta rosa
- ✅ **Upload de documentos:**
  - CNH e CRLV/DUT
  - Cards com status (enviado/pendente)
  - Cores diferenciadas (verde CNH, laranja CRLV)
  - **TODO comentado:** Criptografia, autenticação biométrica, logs de acesso
- ✅ Listagem de documentos salvos

#### 🔒 Segurança (Planejada):
```typescript
// TODO - SEGURANÇA FUTURA:
// - Implementar criptografia em repouso (AES-256)
// - Adicionar autenticação biométrica (Face ID/Touch ID)
// - Considerar Supabase Vault ou AWS KMS para chaves
// - Log de acessos aos documentos para auditoria
```

---

### 3️⃣ **Combustível (fuel.tsx)**
#### ✨ Implementado:
- ✅ **Dashboard de métricas:**
  - **Card 1:** Consumo semanal em LITROS (azul)
  - **Card 2:** Gasto mensal em DINHEIRO (verde)
  - Cálculos automáticos baseados na semana atual e mês corrente
- ✅ Gráfico de tendência de gastos (barras simuladas)
- ✅ Alerta de consumo alto (< 8 km/L)
- ✅ Botão de adicionar abastecimento
- ✅ **Histórico completo:**
  - Cards com tipo de combustível (Gasolina/Etanol)
  - Data, litros, valor, km
  - Toque para ver detalhes (modal)
  - Long press para deletar
- ✅ **Modal de detalhes:**
  - Informações completas do abastecimento
  - Botão de exclusão (confirmação)
- ✅ Pull to refresh

#### 📊 Cálculos:
```typescript
// Consumo semanal: soma de litros da semana atual
// Gasto mensal: soma de valor_total do mês atual
// Média Km/L: (último KM - primeiro KM) / total de litros
```

---

### 4️⃣ **Manutenção (maintenance.tsx)**
#### ✨ Implementado:
- ✅ Header com título e botão de adicionar
- ✅ **Sistema de filtros:**
  - Chips de filtro por tipo de serviço (Óleo, Freios, Suspensão, Elétrica, etc)
  - Filtros ativos com cores rosa vibrante
- ✅ **Timeline visual:**
  - Linha vertical conectando os itens
  - Dot colorido por tipo de serviço
  - Cards com data, tipo, km, valor, oficina
  - Foto da NF (se disponível)
- ✅ **Modal de detalhes:**
  - Informações completas (tipo, data, km, valor, oficina, notas)
  - Visualização de foto da NF
  - Botão de exclusão
- ✅ Estado vazio estilizado
- ✅ Pull to refresh

#### 📝 Formulário de Adicionar Manutenção (add-maintenance.tsx):
- ✅ Campos: tipo, data, km, valor, oficina, notas
- ✅ **Autocomplete de oficina** (busca rede Glam)
- ✅ Upload de foto da Nota Fiscal
- ✅ Validações básicas

---

### 5️⃣ **Rede Glam / Workshops (workshops.tsx)**
#### ✨ Implementado:
- ✅ Header rosa vibrante com botão SAC
- ✅ Aviso: "Em breve - Mapa Interativo"
- ✅ **Filtros inteligentes e dinâmicos:**
  - Busca por cidade (campo de texto com ícone)
  - Filtro por UF (SP, RJ, MG, RS, BA, Todos)
  - Filtro por categoria (Todas, 5 Estrelas, Especializadas)
  - Contador de resultados filtrados
- ✅ **Cards de oficina premium:**
  - Foto com badge de avaliação (estrelas)
  - Badge "mais fotos em breve"
  - Nome da oficina (Lovelo Black uppercase)
  - Endereço completo (cidade/UF)
  - Horário de funcionamento
  - Preço base
  - Tags de serviços oferecidos
  - Número de avaliações
  - **Botão principal:** "Quero Agendar via WhatsApp"
    - Abre WhatsApp Web/App (wa.me)
    - Mensagem pré-formatada: "Olá! Encontrei sua oficina pelo app Oficina Glam e quero agendar um serviço para meu carro {modelo} ({placa}). 🚗"
  - **Botão secundário:** Ligar para oficina (tel:)
- ✅ **Modal SAC Glam:**
  - **Canais funcionais:**
    - WhatsApp Glam (abre wa.me com mensagem automática)
    - E-mail (contato@glamoficina.com.br)
    - Telefone 0800 707 1234
  - **Canais "em breve":**
    - Chat ao vivo no app
    - FAQ dinâmica
    - Chatbot com IA (backbone do bot do manual)
  - Aviso de funcionalidades futuras
- ✅ Estado vazio estilizado (nenhuma oficina encontrada)

#### 🗺️ Dados Mock:
4 oficinas de exemplo com informações completas (SP e RJ)

---

### 6️⃣ **Notificações/Lembretes (notifications.tsx)**
#### ✨ Implementado:
- ✅ Card "Próximo Alerta" destacado
- ✅ Lista de lembretes ativos
- ✅ **Seção de Recomendações IA (placeholder):**
  - Dicas personalizadas baseadas no histórico
  - Badge "EM BREVE"
- ✅ Card "Funcionalidades Futuras" (push notifications, ML)

#### 🧠 Lógica de Lembretes (lib/lembretes.ts):
```typescript
// Funções implementadas:
- calcularProximaDataPorTempo() // Adiciona meses a uma data
- calcularProximaManutencaoPorKm() // Calcula km da próxima manutenção
- humanizarMensagemLembrete() // "Em 2 dias" ou "Daqui 500km"
- regrasPadraoManutencao // Objeto com regras de cada tipo

// TODOs comentados:
// - Integração com push notifications
// - ML para prever manutenções baseadas em padrões
// - Notificações inteligentes por localização
```

---

### 7️⃣ **Chat IA - Manual do Carro (ai/manual-chat.tsx)**
#### ✨ Implementado:
- ✅ Interface de chat funcional
- ✅ Mensagens do usuário e bot
- ✅ Campo de input com botão de envio
- ✅ Auto-scroll para última mensagem
- ✅ Estado de carregamento (typing...)
- ✅ Mensagem de boas-vindas

#### 🤖 Status:
- ⚠️ **PREVIEW APENAS:** Respostas mockadas
- ⚠️ **TODO:** Integrar com API de IA (OpenAI, Anthropic, etc)
- ⚠️ **TODO:** Criar base de conhecimento com PDFs de manuais de carros
- ⚠️ **TODO:** Implementar RAG (Retrieval Augmented Generation)

---

### 8️⃣ **Perfil de Usuário (profile.tsx)**
#### ❌ Status:
- **NÃO IMPLEMENTADO**
- Página existe mas está vazia

---

### 9️⃣ **Navegação e Layout**
#### ✨ Implementado:
- ✅ **Bottom Tab Navigation:**
  - 5 abas: Veículo, Combustível, Home (centro), Manutenção, Workshops
  - Home centralizada (design único)
  - Tab bar clara/translúcida com ícones PneuIcon, BrilhoIcon, ChavesIcon (design system 2026)
  - Estados ativo/inativo com transição suave
- ✅ SafeAreaView e useSafeAreaInsets em todas as telas
- ✅ **Compatibilidade iOS e Android:** Platform.OS, SafeArea, layout responsivo
- ✅ **Botão flutuante de chat** (FloatingChatButton) – bolha com Leninha sobre a tab bar

---

## 🎨 Design System

### 🌈 Paleta de Cores DIVA (src/theme/colors.ts)
**Última atualização:** Dezembro 2025 - Reforma completa para melhor contraste

```typescript
{
  rosaSuper: '#F5EEEE',    // Rosa super suave - backgrounds muito claros, cards sutis
  rosaClaro: '#F7A8C4',    // Rosa claro - fundos principais das telas, ícones de destaque
  rosaMedio: '#F37199',    // Rosa médio - bordas, detalhes secundários
  rosaVibrante: '#E53888', // Rosa vibrante - elementos importantes (menos usado após reforma)
  rosaInteso: '#C3195D',   // Rosa intenso - elementos intermediários
  rosaEscuro: '#AC1754',   // Rosa escuro - headers, navegação (uso principal após reforma)
  
  // Cores funcionais
  success: '#00C853',
  warning: '#FFAB00',
  danger: '#FF1744',
  
  // Aplicações (após reforma de cores)
  background: '#F5EEEE',      // Backgrounds muito claros
  headerBg: '#AC1754',        // Headers e barras de navegação (ESCURO)
  iconHighlight: '#F7A8C4',   // Ícones de destaque (CLARO)
  surface: '#FFFFFF',         // Cards e superfícies
  text: '#2D2D2D',           // Texto principal
  textLight: '#757575',      // Texto secundário
  border: '#F37199'          // Bordas
}
```

#### 🎨 Filosofia de Design (Reforma Dezembro 2025):
- **Contraste Invertido:** Headers escuros (#AC1754) sobre fundos claros (#F7A8C4)
- **Hierarquia Visual:** Elementos mais importantes usam tons mais escuros
- **Fundos de Tela:** Todas as abas agora usam `colors.rosaClaro` (#F7A8C4) para consistência
- **Tab Bar:** Fundo escuro (#AC1754) com ícones claros (#F7A8C4) quando ativos
- **Cards Premium:** Backgrounds brancos com bordas e sombras sutis
- **CTAs:** Botões principais usam `colors.headerBg` para máximo destaque

### 📝 Tipografia
```typescript
// Hierarquia de fontes:
- Lovelo Black: Headlines (UPPERCASE) - impacto visual
- Montserrat Alternates Medium: Informações importantes, labels
- Inter Regular: Corpo de texto, leitura fácil

// Uso:
style={{ fontFamily: 'LoveloBlack', textTransform: 'uppercase' }}
style={{ fontFamily: 'MontserratAlternates-Medium' }}
style={{ fontFamily: 'Inter-Regular' }}
```

### 🎭 Componentes de UI
- Cards com sombras suaves (shadowColor: rosaInteso)
- Border radius grandes (rounded-3xl, rounded-2xl)
- Backgrounds decorativos (círculos com opacity)
- Badges com cores contextuais
- Botões com estados hover/active
- Inputs com fundo rosa super suave

---

## 🗄️ Banco de Dados (Supabase)

### 📊 Tabelas Implementadas

#### 1. **veiculo**
```sql
CREATE TABLE veiculo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modelo TEXT,
  placa TEXT,
  ano INTEGER,
  versao TEXT,
  cor TEXT,
  foto_url TEXT,  -- URL da foto no Storage
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. **abastecimentos**
```sql
CREATE TABLE abastecimentos (
  id SERIAL PRIMARY KEY,
  vehicle_id UUID REFERENCES veiculo(id),
  data TEXT,  -- Formato DD/MM/AAAA
  km INTEGER,
  litros DECIMAL(10,2),
  valor_total DECIMAL(10,2),
  tipo TEXT,  -- 'Gasolina' ou 'Etanol'
  posto TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. **manutencoes**
```sql
CREATE TABLE manutencoes (
  id SERIAL PRIMARY KEY,
  vehicle_id UUID REFERENCES veiculo(id),
  tipo TEXT,  -- 'Óleo', 'Freios', 'Suspensão', etc
  data TEXT,  -- Formato DD/MM/AAAA
  km INTEGER,
  valor DECIMAL(10,2),
  oficina TEXT,
  notas TEXT,
  foto_nf_url TEXT,  -- URL da foto da NF no Storage
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. **documentos**
```sql
CREATE TABLE documentos (
  id SERIAL PRIMARY KEY,
  vehicle_id UUID REFERENCES veiculo(id),
  tipo TEXT,  -- 'CNH', 'CRLV', 'OUTROS'
  arquivo_url TEXT,  -- URL no Storage
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. **lembretes**
```sql
CREATE TABLE lembretes (
  id SERIAL PRIMARY KEY,
  vehicle_id UUID REFERENCES veiculo(id),
  titulo TEXT,
  descricao TEXT,
  tipo TEXT,  -- 'tempo', 'km', 'manual'
  prioridade TEXT,  -- 'alta', 'media', 'baixa'
  data_alerta DATE,
  km_alerta INTEGER,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. **perfis**
```sql
CREATE TABLE perfis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_completo TEXT,
  apelido TEXT,  -- Usado pela IA e notificações
  email TEXT,
  celular TEXT,
  cpf TEXT,
  signo TEXT,  -- 'Áries', 'Touro', ..., 'Peixes'
  foto_url TEXT,  -- URL no Storage (PERFIL/)
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 7. **laudos** (Verificador Anti-Golpe)
```sql
CREATE TABLE laudos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,  -- TODO: vincular com auth quando implementado
  veiculo_id UUID REFERENCES veiculo(id),
  arquivo_url TEXT NOT NULL,  -- URL da foto/PDF no Storage
  tipo_arquivo TEXT NOT NULL,  -- 'foto' ou 'pdf'
  status TEXT NOT NULL,  -- 'confiavel', 'atencao', 'suspeito'
  analise_resumo TEXT,  -- Resumo da análise da IA
  servicos_identificados TEXT[],  -- Array de serviços detectados
  alertas TEXT[],  -- Array de alertas e avisos
  texto_extraido TEXT,  -- Texto extraído por OCR (para análise)
  preco_total DECIMAL(10,2),  -- Preço total do orçamento
  oficina_nome TEXT,  -- Nome da oficina (se identificado)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_laudos_user ON laudos(user_id);
CREATE INDEX idx_laudos_status ON laudos(status);
CREATE INDEX idx_laudos_created ON laudos(created_at DESC);
```

### 🗂️ Storage Buckets

#### **arquivos** (público)
```
arquivos/
├── FOTO_CARRO/
│   └── {timestamp}.jpg
├── CNH/
│   └── {timestamp}.jpg
├── CRLV/
│   └── {timestamp}.jpg
├── NF/
│   └── {timestamp}.jpg
├── PERFIL/
│   └── {timestamp}.jpg
├── LAUDOS/
│   ├── {timestamp}.jpg  -- Fotos de laudos/orçamentos
│   └── {timestamp}.pdf  -- PDFs de laudos/orçamentos
└── OUTROS/
    └── {timestamp}.jpg
```

**Políticas de segurança:**
- Bucket público para leitura
- Upload autenticado (TODO: implementar RLS)

---

## 🔌 Integrações

### ✅ Implementadas:
1. **Supabase:**
   - PostgreSQL (banco de dados)
   - Storage (upload de imagens)
   - Auth (preparado, não em uso)

2. **Expo Image Picker:**
   - Seleção de imagens da galeria
   - Crop e compressão
   - Conversão para base64

3. **React Native Linking:**
   - WhatsApp (wa.me)
   - Telefone (tel:)
   - E-mail (mailto:)
   - Redes sociais (Instagram, TikTok)

### ❌ Pendentes:
- Google Maps API (mapa de oficinas)
- Push Notifications (Expo Notifications)
- Biometria (expo-local-authentication)
- OpenAI/Anthropic (Chat IA)
- Stripe/Payment Gateway (pagamentos)
- Analytics (Firebase/Mixpanel)

---

## 📝 TO-DO / Funcionalidades Pendentes

### 🔴 **ALTA PRIORIDADE**

#### 1. **Sistema de Autenticação**
- [ ] Tela de login/cadastro
- [ ] Supabase Auth (email/senha)
- [ ] Login social (Google, Apple)
- [ ] Recuperação de senha
- [ ] Verificação de e-mail
- [ ] Proteção de rotas (auth guard)
- [ ] Vincular perfil ao user_id autenticado
- [ ] RLS em todas as tabelas (veiculo, abastecimentos, manutencoes, documentos, lembretes, perfis)

#### 2. **Máscaras e Validações de Input**
- [ ] Máscara de celular: (XX) XXXXX-XXXX
- [ ] Máscara de CPF: XXX.XXX.XXX-XX
- [ ] Validação de CPF (algoritmo validador)
- [ ] Validação de e-mail (regex)
- [ ] Validação de placa de veículo

#### 3. **Chat IA - Integração Real**
- [ ] Escolher provider (OpenAI GPT-4, Claude, etc)
- [ ] Criar API endpoint para chat
- [ ] Base de conhecimento com manuais automotivos
- [ ] Implementar RAG (Retrieval Augmented Generation)
- [ ] Context window com dados do veículo do usuário
- [ ] Streaming de respostas
- [ ] Histórico de conversas no banco (tabela `chat_historico`)
- [ ] Personalização com apelido do perfil

#### 4. **🛡️ Verificador de Laudos/Orçamentos (Anti-Golpe)**
**Objetivo:** Proteger DIVAs de fraudes em oficinas através de análise inteligente de laudos.

**Funcionalidade:**
- [x] Card estratégico na Home para "Analisar Laudo/Orçamento" ✅
- [x] Tela completa de verificador ✅
- [x] Upload de foto (câmera ou galeria) ✅
- [x] Modal de seleção de upload (câmera/galeria/PDF) ✅
- [x] Histórico de laudos analisados ✅
- [x] Deletar laudos do histórico ✅
- [x] Modal de detalhes com análise completa ✅
- [x] Status visual (Confiável/Atenção/Suspeito) ✅
- [x] Análise mockada (simulando IA) ✅
- [ ] **Criar tabela `laudos` no Supabase** (SQL fornecido na documentação)
- [ ] Upload de PDF funcional
- [ ] **OCR para extração de texto:**
  - Opção 1: Google Cloud Vision API (mais preciso)
  - Opção 2: AWS Textract (bom para documentos)
  - Opção 3: Tesseract.js (gratuito, porém menos preciso)
- [ ] **Análise por IA:**
  - Opção 1: GPT-4 Vision (lê imagem diretamente, sem OCR separado)
  - Opção 2: Claude 3 Opus (melhor para análise crítica e comparações)
  - Opção 3: OCR + GPT-4 (extrai texto primeiro, depois analisa)
- [ ] **Lógica de Verificação Real:**
  - Comparar serviços do laudo com histórico de manutenções da usuária
  - Detectar serviços redundantes (ex: alinhamento feito há 2 semanas)
  - Verificar preços contra média de mercado (API/database)
  - Identificar serviços desnecessários ou suspeitos
  - Alertar sobre possíveis golpes/fraudes
  - Análise de urgência (urgente vs preventivo vs dispensável)
- [ ] Compartilhar análise (screenshot para amigas)
- [ ] Denunciar oficina suspeita (via SAC Glam)
- [ ] Vincular laudo ao veículo específico (veiculo_id)
- [ ] Extrair e salvar preço total do orçamento
- [ ] Identificar nome da oficina automaticamente

**Tecnologia Recomendada:**
- **Backend:** Node.js/Express API ou Edge Functions (Supabase/Vercel)
- **OCR:** Google Cloud Vision API (melhor custo-benefício e precisão)
- **IA:** Claude 3.5 Sonnet ou GPT-4 (context window grande para histórico)
- **Storage:** Supabase Storage (bucket `laudos/`)

**Design Implementado:**
- Item dentro da Central de IAs na Home (shield icon, "Verificador de laudos")
- Tela dedicada com header personalizado
- Banner informativo sobre funcionamento
- Botão grande de upload com loading state
- Cards de histórico com status colorido (verde/amarelo/vermelho)
- Modal de detalhes fullscreen com:
  - Status header colorido
  - Imagem do laudo
  - Lista de serviços identificados
  - Alertas destacados
  - Recomendações personalizadas
  - Botão para ver oficinas confiáveis
  - Opção de deletar laudo

#### 5. **Sistema de Lembretes Inteligente - Ativação**
- [ ] Conectar lembretes mock com dados reais do banco
- [ ] Cálculo automático baseado em histórico de manutenções
- [ ] Notificações push programadas (Expo Notifications)
- [ ] Lembretes por tempo (revisão a cada X meses)
- [ ] Lembretes por KM (trocar óleo a cada X km)
- [ ] Criar/editar/deletar lembretes manuais
- [ ] Marcar lembrete como concluído
- [ ] Adiar lembrete (snooze)
- [ ] Badge de notificações na tab bar

### 🟡 **MÉDIA PRIORIDADE**

#### 5. **Segurança de Documentos Sensíveis**
- [ ] Criptografia de CPF no perfil (AES-256)
- [ ] Criptografia de CNH e CRLV (storage encrypted)
- [ ] Autenticação biométrica para visualizar documentos
- [ ] Supabase Vault para chaves de criptografia
- [ ] Log de acessos aos documentos

#### 6. **Mapa de Oficinas**
- [ ] Integração com Google Maps API
- [ ] Exibir oficinas da Rede Glam no mapa
- [ ] Geolocalização do usuário
- [ ] Calcular distância até oficina
- [ ] Rotas/navegação (abrir no Google Maps/Waze)
- [ ] Filtros no mapa (cidade, UF, categoria)
- [ ] Clusterização de pins quando zoom out

#### 7. **Sistema de Avaliações de Oficinas**
- [ ] Usuário avaliar oficina após visita (1-5 estrelas + comentário)
- [ ] Tabela `avaliacoes` (user_id, oficina_id, estrelas, comentario, data)
- [ ] Exibir avaliações no card da oficina
- [ ] Calcular média dinâmica de estrelas
- [ ] Filtrar/ordenar oficinas por avaliação
- [ ] Moderação de avaliações (admin)
- [ ] Denunciar avaliação inadequada

#### 8. **Aprimoramento de Oficinas**
- [ ] Galeria de fotos da oficina (múltiplas imagens)
- [ ] Lightbox para visualizar fotos em tela cheia
- [ ] Horário de funcionamento detalhado
- [ ] Lista de serviços oferecidos com preços
- [ ] Certificações e credenciamentos
- [ ] Badge "Oficina Verificada" para oficinas auditadas

#### 9. **Dashboard Avançado de Combustível**
- [ ] Gráfico de evolução de consumo (últimos 6 meses)
- [ ] Comparação Gasolina vs Etanol (economia)
- [ ] Média de km/l por tipo de combustível
- [ ] Sugestão do combustível mais econômico
- [ ] Alertas de consumo anormal
- [ ] Exportar histórico (CSV/PDF)

#### 10. **Relatórios de Manutenção**
- [ ] Relatório mensal de gastos (gráfico pizza por categoria)
- [ ] Timeline visual de todas as manutenções
- [ ] Gráficos de gastos mensais (barras)
- [ ] Projeção de custos futuros baseado em histórico
- [ ] Comparação com média do modelo do carro
- [ ] Exportar relatório completo (PDF)

### 🟢 **BAIXA PRIORIDADE**

#### 11. **Agendamento Online de Serviços**
- [ ] Sistema de agendamento integrado (não só WhatsApp)
- [ ] Calendário de disponibilidade das oficinas
- [ ] Confirmação automática por push/email
- [ ] Lembretes de agendamento próximo
- [ ] Histórico de agendamentos
- [ ] Cancelamento/reagendamento

#### 12. **Pagamento Digital**
- [ ] Integração com Stripe ou PagSeguro
- [ ] Pagamento de serviços pelo app
- [ ] Carrinho de serviços
- [ ] Cupons de desconto (códigos promocionais)
- [ ] Cashback em créditos Glam
- [ ] Histórico de transações

#### 13. **SAC Glam - Funcionalidades Avançadas**
- [x] Modal SAC básico com canais ✅
- [ ] Chat ao vivo no app (WebSocket/Socket.io)
- [ ] FAQ pesquisável e categorizável
- [ ] Chatbot de atendimento (IA para dúvidas comuns)
- [ ] Sistema de tickets (abrir chamado)
- [ ] Histórico de atendimentos do usuário
- [ ] Avaliação do atendimento

#### 14. **Gamificação**
- [ ] Sistema de pontos Glam (ganhar em ações no app)
- [ ] Badges/conquistas (Primeira Manutenção, Econômica, Organizada, etc)
- [ ] Ranking mensal de DIVAs
- [ ] Recompensas (descontos em oficinas parceiras)
- [ ] Missões semanais (ex: "Complete seu perfil - 100 pts")
- [ ] Níveis de usuário (Bronze, Prata, Ouro, Diamante)

#### 15. **Social Features**
- [ ] Compartilhar conquistas nas redes sociais
- [ ] Compartilhar dicas da Glam (stories)
- [ ] Sistema de indicação/referral (ganhar créditos)
- [ ] Feed social entre usuárias (opcional/privacidade)
- [ ] Comunidade de DIVAs (fórum de dúvidas)

#### 16. **Melhorias de UX/UI**
- [ ] Onboarding animado (primeira vez no app)
- [ ] Tutorial interativo das funcionalidades
- [ ] Modo escuro (dark mode)
- [ ] Personalização de tema (escolher tom de rosa favorito)
- [ ] Animações com Reanimated (transições suaves)
- [ ] Skeleton screens durante loading
- [ ] Haptic feedback em ações importantes

#### 17. **Funcionalidades Extras**
- [ ] Assistente de viagem (checklist pré-viagem)
- [ ] Alarme de revisão (notificação periódica)
- [ ] Histórico de multas (integração com APIs)
- [ ] Rastreador de IPVA e licenciamento
- [ ] Calculadora de custos por km rodado
- [ ] Dicas personalizadas baseadas no perfil de uso

---

## 💡 Ideias Futuras

### 🚀 **Expansão de Funcionalidades**

1. **🛡️ Verificador de Laudos - Evolução:**
   - **Machine Learning para Detecção de Padrões:**
     - Treinar modelo com milhares de laudos fraudulentos vs legítimos
     - Detectar oficinas com histórico de fraudes (banco de dados colaborativo)
     - Score de confiabilidade da oficina (0-100)
   - **Integração com Rede Glam:**
     - Se oficina não for da Rede Glam, sugerir oficina certificada próxima
     - Denúncia automática de oficinas suspeitas para investigação
     - Sistema de reputação (oficinas ganham ou perdem credibilidade)
   - **Comparação de Preços em Tempo Real:**
     - Buscar preços médios de serviços na região (APIs/scraping)
     - Alertar se preço está X% acima da média
     - Sugerir negociação ou segunda opinião
   - **Análise de Urgência:**
     - IA identifica se serviço é urgente, preventivo ou dispensável
     - Prioriza o que realmente precisa ser feito agora vs depois
   - **Histórico Compartilhado (Anônimo):**
     - Usuárias contribuem com laudos analisados
     - Criar database de serviços e preços por região/cidade
     - Alertas comunitários sobre oficinas com múltiplas denúncias

2. **Assistente de Viagem:**
   - Planejador de viagens com checklist
   - Alertas de revisão antes de viagem longa
   - Indicação de oficinas na rota

3. **Seguro Automotivo:**
   - Comparador de seguros
   - Parceria com seguradoras
   - Gestão de sinistros

3. **Venda de Peças:**
   - Marketplace de peças automotivas
   - Comparação de preços
   - Entrega rápida

4. **Comunidade DIVA:**
   - Feed social (tipo Instagram)
   - Grupos por modelo de carro
   - Fóruns de dúvidas
   - Lives com mecânicas

5. **Curso/Educação:**
   - Tutoriais em vídeo (YouTube)
   - Curso básico de mecânica
   - Glossário automotivo
   - Quiz e testes de conhecimento

6. **Parceria com Oficinas:**
   - Dashboard para oficinas
   - Sistema de agendamento para oficinas
   - CRM para oficinas
   - Analytics de desempenho

### 🤖 **IA e Machine Learning**

1. **Predição de Falhas:**
   - Analisar histórico e prever problemas
   - Alertas proativos
   - Recomendações personalizadas

2. **Assistente de Voz:**
   - "Glam, quando foi minha última troca de óleo?"
   - Adicionar abastecimento por voz
   - Agendar por comando de voz

3. **Reconhecimento de Imagem:**
   - OCR para ler nota fiscal automaticamente
   - Identificar modelo do carro por foto
   - Detectar danos/problemas por foto

4. **Chatbot Multicanal:**
   - Mesmo chatbot no app, WhatsApp, Instagram
   - Base de conhecimento unificada
   - Aprendizado contínuo

### 🌍 **Expansão Geográfica**

1. **Internacionalização:**
   - Suporte a múltiplos idiomas
   - Expansão para América Latina
   - Adaptação de moedas e unidades

2. **Parcerias Locais:**
   - Rede de oficinas por estado
   - Parceria com montadoras
   - Parcerias com postos de combustível

### 📊 **Monetização**

1. **Plano Premium:**
   - Lembretes ilimitados
   - Relatórios avançados
   - Chat IA sem limites
   - Prioridade no SAC

2. **Publicidade:**
   - Banner de parceiros (não intrusivo)
   - Oficinas patrocinadas (destaque)
   - Produtos recomendados

3. **Comissão:**
   - Comissão por agendamento
   - Comissão por venda de peças
   - Afiliados (indicação)

---

## 🚀 Como Executar

### Pré-requisitos:
```bash
- Node.js 18+
- Expo CLI
- Conta Supabase
- Android Studio / Xcode (para emuladores)
```

### Instalação:
```bash
# 1. Clone o repositório
git clone <repo-url>
cd oficina_glam

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
# Crie .env com:
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key

# 4. Execute o app
npx expo start -c
```

### 📱 Fontes (Manual):
As fontes precisam ser baixadas manualmente:
- **Lovelo Black:** LOVELOBL.otf
- **Montserrat Alternates Medium:** MontserratAlternates-Medium.ttf
- **Inter Regular:** Inter-Regular.ttf

Coloque em: `assets/fonts/`

### 🗄️ Banco de Dados:
Execute os scripts SQL no Supabase Dashboard para criar as tabelas.

---

## 📞 Contato e Suporte

- **E-mail:** contato@glamoficina.com.br
- **WhatsApp:** (11) 99999-9999
- **Instagram:** @glamoficina
- **TikTok:** @glamoficina

---

## 📄 Licença

[Definir licença]

---

**Desenvolvido com 💕 para empoderar DIVAs no cuidado automotivo**
