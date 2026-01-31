/**
 * Sistema de cores para ícones – contraste consistente
 *
 * Regra: fundo claro → ícone escuro ou accent; fundo accent → ícone branco.
 * Nunca usar branco em ícones sobre surface, background ou accentSoft.
 */

import { colors } from './colors';

export type IconVariant = 'primary' | 'onAccent' | 'neutral' | 'muted';

/** Mapeia variant para a cor correta do ícone */
export function getIconColor(variant: IconVariant): string {
  switch (variant) {
    case 'primary':
      return colors.iconPrimary;
    case 'onAccent':
      return colors.iconOnAccent;
    case 'neutral':
      return colors.iconNeutral;
    case 'muted':
      return colors.iconMuted;
    default:
      return colors.iconPrimary;
  }
}

/** Variants e seus contextos de uso */
export const iconVariantContext = {
  /** Ícone sobre fundo claro: surface, background, accentSoft, card secundário */
  primary: colors.iconPrimary,
  /** Ícone sobre fundo accent: CTA, card principal, botões rosa, FAB */
  onAccent: colors.iconOnAccent,
  /** Ícone neutro, sem destaque de ação */
  neutral: colors.iconNeutral,
  /** Ícone inativo: tab não selecionada, desabilitado */
  muted: colors.iconMuted,
} as const;
