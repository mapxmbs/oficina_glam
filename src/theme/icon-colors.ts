/**
 * Sistema de cores para ícones – contraste consistente
 *
 * Regra: fundo claro → ícone escuro ou accent; fundo accent → ícone branco.
 * Nunca usar branco em ícones sobre surface, background ou accentSoft.
 */

import { colors } from './colors';

export type IconVariant = 'primary' | 'onAccent' | 'neutral' | 'muted' | 'inactive';

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
    case 'inactive':
      return colors.iconInactive;
    default:
      return colors.iconPrimary;
  }
}

/** Variants e seus contextos de uso */
export const iconVariantContext = {
  primary: colors.iconPrimary,
  onAccent: colors.iconOnAccent,
  neutral: colors.iconNeutral,
  muted: colors.iconMuted,
  inactive: colors.iconInactive,
} as const;

export type BackgroundVariant = 'accent' | 'accentSoft' | 'surface' | 'background';

/** Regra obrigatória: ícone branco SÓ em fundo accent/escuro. Em fundos claros → iconPrimary. */
export function getIconColorByBackground(bg: BackgroundVariant): string {
  return bg === 'accent' ? colors.iconOnAccent : colors.iconPrimary;
}
