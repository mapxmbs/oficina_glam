/**
 * Padrões de UI – Oficina Glam
 *
 * REGRA ANTI-EXCESSO: Nenhum card usa simultaneamente
 * fundo colorido + borda colorida + sombra.
 *
 * Accent apenas em: CTA principal, estado ativo, badges importantes, ícones-chave.
 */

import { colors } from './colors';

// ═══════════════════════════════════════════════════════════════════════════
// ELEVAÇÃO (use UMA por card: sombra OU borda)
// ═══════════════════════════════════════════════════════════════════════════
export const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 2,
};

export const cardBorder = {
  borderWidth: 1,
  borderColor: colors.border,
};

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLOS DE CARDS
// ═══════════════════════════════════════════════════════════════════════════

/** 1. TELA NEUTRA – Fundo base, superfícies brancas, sem accent */
export const screenNeutral = {
  flex: 1,
  backgroundColor: colors.background,
} as const;

/** 2. CARD SECUNDÁRIO – Neutro, elevação por sombra. Sem borda colorida. */
export const cardSecondary = {
  backgroundColor: colors.surface,
  borderRadius: 16,
  padding: 20,
  ...cardShadow,
} as const;

/** 3. CARD SECUNDÁRIO FLAT – Dentro de outro card ou contexto já elevado. Só borda. */
export const cardFlat = {
  backgroundColor: colors.surface,
  borderRadius: 16,
  padding: 20,
  ...cardBorder,
} as const;

/** 4. CARD PRINCIPAL (premium) – Com elemento assinatura (brilho sutil).
 * Usar APENAS em Home ou destaque máximo.
 * Fundo accent, SEM borda colorida, sombra suave com tint accent. */
export const cardPrincipal = {
  backgroundColor: colors.accent,
  borderRadius: 16,
  padding: 24,
  borderTopWidth: 1,
  borderTopColor: 'rgba(255,255,255,0.25)',
  shadowColor: colors.accent,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 12,
  elevation: 4,
} as const;

// ─── Alias para compatibilidade
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
  backgroundColor: colors.accentSoft,
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
