/**
 * Oficina Glam – Design Tokens
 * Beterraba (#8B2942) como protagonista – ação, destaque, estado ativo.
 * Fundo neutro quente. Máximo 1 cor vibrante por tela.
 * Contraste AA: textLow mínimo equivalente rgba(0,0,0,0.4).
 */

export const colors = {
  /** Beterraba – protagonista da marca */
  accent: '#8B2942',
  accentDark: '#6B1F33',
  accentSoft: '#F6EBEE',
  accentMuted: 'rgba(139, 41, 66, 0.12)',
  /** Beterraba dessaturada – CTAs secundários, menos contraste */
  accentMutedSolid: '#A65B6B',

  /** Superfícies – sólidas, sem transparência */
  background: '#F8F6F5',
  surface: '#FFFFFF',
  surfaceTint: '#FBF8F7',

  /** Bordas e divisores – escala única */
  border: 'rgba(0,0,0,0.08)',
  borderSubtle: 'rgba(0,0,0,0.05)',
  divider: 'rgba(0,0,0,0.08)',

  /** Texto – escala fixa de contraste (AA) */
  textPrimary: '#1A1A1A',
  textHigh: '#2D2D2F',
  textMedium: '#5C5C5E',
  textLow: '#6B6B6E',
  textSecondary: '#5C5C5E',
  textTertiary: '#6B6B6E',

  /** Ícones – ativo accent/primary, inativo textMedium */
  iconPrimary: '#8B2942',
  iconOnAccent: '#FFFFFF',
  iconMuted: '#5C5C5E',
  iconInactive: '#5C5C5E',
  iconNeutral: '#1A1A1A',

  /** Overlays – modais e backdrop (não usar em telas) */
  overlayDark: 'rgba(0,0,0,0.5)',
  overlayDarker: 'rgba(0,0,0,0.6)',
  overlayDarkest: 'rgba(0,0,0,0.9)',

  /** Semânticos */
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  whatsapp: '#25D366',

  /** Aliases */
  text: '#1A1A1A',
  primary: '#8B2942',
  headerBg: '#8B2942',
  textLight: '#6E6E73',
  cardBg: '#FFFFFF',
  rosaSuper: '#FFFFFF',
  rosaMedio: '#8B2942',
  rosaEscuro: '#8B2942',
  rosaInteso: '#8B2942',
  surfaceSoft: '#F6EBEE',
} as const;
