# Design System – Oficina Glam

> Energia visual com elegância. Base neutra; accent restrito a ação e foco.

---

## 1. Princípios

- **Base neutra** para calma e legibilidade.
- **Rosa apenas como cor de ação e foco** (accent).
- **Regra anti-excesso:** Nenhum card usa simultaneamente fundo colorido + borda colorida + sombra.
- **Elemento assinatura:** Brilho sutil (top highlight) em áreas premium (Home, card principal).

---

## 2. Paleta

### Accent (uso restrito)

| Token      | Hex       | Aplicação                                           |
|-----------|-----------|------------------------------------------------------|
| `accent`  | `#B91C5C` | CTA principal, estado ativo, badges importantes, ícones-chave |
| `accentSoft` | `#FDF2F6` | Fundos de ícones, hovers discretos                 |

**Aliases:** `primary` e `primarySoft` apontam para accent (compatibilidade).

### Neutros (base dominante)

| Token         | Hex       | Uso                       |
|---------------|-----------|---------------------------|
| `background`  | `#F8F7F9` | Fundo principal           |
| `surface`     | `#FFFFFF` | Cards, modais, inputs     |
| `border`      | `#EBE8EC` | Bordas sutis              |
| `borderMedium`| `#DFDBE0` | Bordas mais visíveis      |

### Texto (contraste AA)

| Token         | Hex       | Uso                       |
|---------------|-----------|---------------------------|
| `textPrimary` | `#1A1A1A` | Títulos, texto principal  |
| `textHigh`    | `#2D2D2F` | Alta ênfase               |
| `textMedium`  | `#5C5C5E` | Subtítulos, labels        |
| `textLow`     | `#6B6B6E` | Microcopy (mín. 0.4 eq.)  |

### Ícones

| Token         | Hex       | Uso                                              |
|---------------|-----------|--------------------------------------------------|
| `iconPrimary` | `#8B2942` | Ativo, fundo claro                               |
| `iconOnAccent`| `#FFFFFF` | Fundo accent (CTA, FAB)                          |
| `iconMuted` / `iconInactive` | `#5C5C5E` | Inativo (tab, desabilitado)      |

**Regra:** Fundo claro → ícone escuro ou accent; fundo accent → ícone branco. Nunca branco em ícones sobre surface, background ou accentSoft.

### Funcionais

| Token   | Hex       |
|---------|-----------|
| `success` | `#059669` |
| `warning` | `#D97706` |
| `danger`  | `#DC2626` |

---

## 3. Sistema de Ícones

### Tokens e variants

Use `getIconColor(variant)` de `src/theme/icon-colors.ts`:

```ts
import { getIconColor } from '../src/theme/icon-colors';

// Por variant
<PneuIcon size={24} color={getIconColor('primary')} />   // fundo claro
<Bell size={22} color={getIconColor('onAccent')} />     // fundo accent
<MapPin size={20} color={getIconColor('muted')} />      // inativo
```

Ou tokens diretos:

```ts
import { colors } from '../src/theme/colors';

<BrilhoIcon size={24} color={colors.iconPrimary} />     // em círculo accentSoft
<Save size={20} color={colors.iconOnAccent} />          // em botão CTA
```

### Exemplos de uso correto

| Contexto                     | Fundo          | Ícone          |
|-----------------------------|----------------|----------------|
| Card secundário, atalho     | surface/accentSoft | `iconPrimary` |
| Tab bar ativo               | surface claro  | `iconPrimary`  |
| Tab bar inativo             | surface claro  | `iconMuted`    |
| CTA, botão Salvar           | accent         | `iconOnAccent` |
| Card principal (Próximo Alerta) | accent     | `iconOnAccent` |
| FAB, botão +                | accent         | `iconOnAccent` |
| Header com accent           | accent         | `iconOnAccent` |

### Componentes flutuantes e modais

| Componente | Uso |
|------------|-----|
| **FloatingChatButton** | Bolha de chat com avatar Leninha (symbol.png), mensagem "Em que posso ajudar?", fundo surface, ícone accent |
| **SearchModal** | Modal de pesquisa global – surface, ícones accent em círculos accentSoft, categorias por cor |

### Exemplos de uso incorreto

```tsx
// ❌ Branco sobre fundo claro (baixo contraste)
<View style={{ backgroundColor: colors.accentSoft }}>
  <PneuIcon color="white" />  // NUNCA
</View>

// ❌ Hardcode de cor
<PneuIcon color="#FFFFFF" />  // Use colors.iconOnAccent

// ✅ Correto
<View style={{ backgroundColor: colors.accentSoft }}>
  <PneuIcon color={colors.iconPrimary} />
</View>
```

### Ícones custom (SVG)

BrilhoIcon, ChavesIcon, CoroaIcon, PneuIcon aceitam `color` e usam `colors.iconPrimary` como fallback. Nunca usam cores fixas internas.

---

## 3.5 Tokens estruturais (radius, sombra, espaçamento)

### Radius (padrão único global)
| Token   | Valor | Uso                        |
|---------|-------|----------------------------|
| `radius.sm` | 10  | Chips, ícones pequenos     |
| `radius.md` | 14  | Botões, inputs, chips ativos |
| `radius.lg` | 20  | Cards, blocos              |
| `radius.xl` | 24  | Cards grandes, modais      |

### Sombras (opacidade 0.04–0.06, offset 1–2px)
| Token      | Uso                           |
|------------|-------------------------------|
| `shadow.sm` | Elementos compactos           |
| `shadow.md` | Cards (padrão)                |
| `shadow.lg` | Destaque                      |
| `shadow.cta`| Botões CTA                    |

### Espaçamento vertical
| Token        | Uso                              |
|--------------|-----------------------------------|
| `blockGap`   | Entre blocos (22px / 18 narrow)   |
| `sectionGap` | Entre header e conteúdo           |
| `itemGap`    | Entre itens de lista (12px)       |

---

## 4. Tipografia

**Contraste títulos vs corpo** – sem fontes display decorativas no fluxo.

### Pesos (Inter)
| Peso  | Uso                          |
|-------|------------------------------|
| 400   | Corpo, legendas              |
| 500   | Subheading, labels secundários |
| 600   | Dados, labels, títulos de card |
| 700   | Ênfase, valores monetários   |

### Corpo (Inter)

| Nível     | Tamanho | Line height |
|-----------|---------|-------------|
| `caption` | 11px    | 14          |
| `label`   | 12px    | 16          |
| `bodyXs`  | 13px    | 18          |
| `body`    | 15px    | 22          |
| `bodySmall` | 14px  | 20          |
| `bodyLg`  | 16px    | 24          |

### Títulos (Montserrat, fontWeight 600)

| Nível    | Tamanho | Line height |
|----------|---------|-------------|
| `titleSm` | 16px   | 22          |
| `title`   | 18px   | 24          |
| `titleLg` | 20px   | 26          |
| `titleXl` | 24px   | 30          |

### Display (LoveloBlack – uso pontual, hero/marca)

| Nível     | Tamanho |
|-----------|---------|
| `display` | 20px    |
| `displayLg` | 24px  |

---

## 5. Padrões de Tela e Card

### 4.1 Tela neutra

Fundo base, superfícies brancas, sem accent.

```ts
import { screenNeutral } from '../src/theme/design-patterns';

<SafeAreaView style={[screenNeutral, { padding: 20 }]}>
  ...
</SafeAreaView>
```

**Exemplo:** Tela de listagem (fuel, maintenance), formulários.

---

### 4.2 Tela com foco

Tela neutra com elementos de accent pontuais (CTA, ícones-chave, chip ativo).

**Exemplo:** Home com card principal accent + cards secundários neutros.

---

### 4.3 Card principal (premium)

- **Onde:** Home, destaque máximo.
- **Características:** Fundo accent, elemento assinatura (brilho sutil no topo), sombra com tint accent.
- **Regra:** Sem borda colorida adicional.

```ts
import { cardPrincipal } from '../src/theme/design-patterns';

<TouchableOpacity style={cardPrincipal}>
  <Text style={{ color: 'white' }}>Próximo Alerta</Text>
</TouchableOpacity>
```

**Visual:** Fundo rosa, `borderTopColor: rgba(255,255,255,0.25)` (brilho), sombra `shadowColor: accent`.

---

### 4.4 Card secundário

- **Onde:** Listas, grids, conteúdo auxiliar.
- **Características:** Fundo branco, sombra OU borda (uma só).
- **Regra:** Sem fundo colorido, sem borda colorida.

```ts
import { cardSecondary } from '../src/theme/design-patterns';
// ou cardBase (alias)

<View style={cardSecondary}>
  ...
</View>
```

**Card secundário com foco (ex.: módulo IA):** `cardSecondary` + `borderLeftWidth: 4`, `borderLeftColor: accent`. Barra lateral de destaque, sem violar a regra.

---

### 4.5 Card flat

Para dentro de outros cards ou contexto já elevado. Só borda, sem sombra.

```ts
import { cardFlat } from '../src/theme/design-patterns';
```

---

## 6. Uso de Accent

| Uso            | Padrão / token      |
|----------------|---------------------|
| CTA principal  | `ctaPrimary`        |
| Estado ativo   | `stateActive`       |
| Badge importante | `badgeAccent`     |
| Ícone-chave    | `iconAccent` (colors.accent) |

---

## 7. Regra anti-excesso (resumo)

**Nunca combinar em um único card:**

1. Fundo colorido (accent)
2. Borda colorida (accent)
3. Sombra

**Permitido:**

- Card principal: fundo accent + sombra (com brilho no topo)
- Card secundário: fundo branco + sombra
- Card secundário com foco: fundo branco + sombra + barra lateral accent

---

## 8. Arquivos do design system

| Arquivo                | Conteúdo                               |
|------------------------|----------------------------------------|
| `src/theme/colors.ts`  | Paleta, tokens iconPrimary, iconOnAccent, etc. |
| `src/theme/icon-colors.ts` | getIconColor(variant), mapeamento variant→cor |
| `src/theme/typography.ts` | Hierarquia, contraste títulos/corpo |
| `src/theme/design-patterns.ts` | screenNeutral, cardPrincipal, cardSecondary, etc. |
