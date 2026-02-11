/**
 * Padrões de UI – Oficina Glam | Premium, Glam, Contraste Real
 * Planos claros, médios e escuros. Beterraba com presença. Menos bordas, mais planos.
 */

import { colors } from './colors';

// ═══════════════════════════════════════════════════════════════════════════
// TELA – plano médio (background), contraste com surface branca
// ═══════════════════════════════════════════════════════════════════════════
export const screenNeutral = {
  flex: 1,
  backgroundColor: colors.background,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CARDS – branco puro, sem bordas excessivas. Contraste por fundo e espaçamento.
// ═══════════════════════════════════════════════════════════════════════════
export const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 6,
  elevation: 1,
};

export const cardBorder = {
  borderWidth: 1,
  borderColor: colors.border,
};

/** Card principal – branco, sem borda (contraste por plano) */
export const cardSecondary = {
  backgroundColor: colors.surface,
  borderRadius: 16,
  padding: 20,
} as const;

/** Card alternado – surfaceTint só para respiro */
export const cardFlat = {
  backgroundColor: colors.surfaceTint,
  borderRadius: 16,
  padding: 20,
} as const;

/** Card principal accent – beterraba com presença, sem brilho */
export const cardPrincipal = {
  backgroundColor: colors.accent,
  borderRadius: 16,
  padding: 24,
  borderTopWidth: 0,
  borderTopColor: 'transparent',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
} as const;

/** Header de seção – beterraba, peso visual */
export const sectionHeaderAccent = {
  backgroundColor: colors.accent,
  paddingVertical: 16,
  paddingHorizontal: 24,
  borderRadius: 16,
} as const;

/** Bloco de destaque – accentDark para âncoras */
export const blockAccentDark = {
  backgroundColor: colors.accentDark,
  paddingVertical: 20,
  paddingHorizontal: 24,
  borderRadius: 16,
} as const;

export const cardBase = cardSecondary;

// ═══════════════════════════════════════════════════════════════════════════
// ACCENT – uso restrito
// ═══════════════════════════════════════════════════════════════════════════

/** CTA principal – botão de ação principal da tela */
export const ctaPrimary = {
  backgroundColor: colors.accent,
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: 14,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
} as const;

/** Estado ativo – chip, tab, filtro selecionado */
export const stateActive = {
  backgroundColor: colors.accent,
} as const;

/** Badge importante – contador, status, label de destaque */
export const badgeAccent = {
  backgroundColor: colors.accentSoft,
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 8,
} as const;

/** Ícone-chave – ícones que indicam ação ou foco (alias) */
export const iconAccent = colors.accent;

// ─── Ícones: use getIconColor(variant) ou tokens diretos
// iconPrimary: fundo claro (surface, accentSoft) | iconOnAccent: fundo accent

// ═══════════════════════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════════════════════
export const headerMinimal = {
  flexDirection: 'row' as const,
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 16,
  paddingHorizontal: 20,
};

export const headerIconWrap = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.accent,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

export const headerHighlight = {
  backgroundColor: colors.accent,
  paddingVertical: 20,
  paddingHorizontal: 20,
  borderRadius: 16,
};

// ═══════════════════════════════════════════════════════════════════════════
// INPUT
// ═══════════════════════════════════════════════════════════════════════════
export const inputBase = {
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
};

// ═══════════════════════════════════════════════════════════════════════════
// SPACING (padrão de tela)
// ═══════════════════════════════════════════════════════════════════════════
export const spacing = {
  screenPadding: 24,
  screenPaddingTop: 20,
  screenPaddingBottom: 48,
  cardGap: 12,
  sectionGap: 32,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BUTTONS – variantes (usar SEMPRE, nunca estilizar na mão)
// ═══════════════════════════════════════════════════════════════════════════

/** Botão secundário – fundo claro, borda sutil */
export const buttonSecondary = {
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: 14,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
} as const;

/** Botão ghost – transparente, apenas texto accent */
export const buttonGhost = {
  backgroundColor: 'transparent',
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: 14,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
} as const;

/** Botão danger – ações destrutivas */
export const buttonDanger = {
  backgroundColor: colors.danger,
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: 14,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
} as const;

/** Botão secundário com texto accent – branco, texto rosa (ex: Agendar em card principal) */
export const buttonSecondaryAccent = {
  backgroundColor: colors.surface,
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 12,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
} as const;

/** Botão sobre fundo accent – contorno branco, texto branco */
export const buttonOnAccent = {
  backgroundColor: 'rgba(255,255,255,0.2)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.5)',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 12,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
} as const;
