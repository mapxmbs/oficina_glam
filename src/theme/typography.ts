/**
 * Hierarquia tipográfica – Lovelo (headlines), Montserrat (destaques), Inter (corpo)
 * Pesos: 400 corpo | 500 subheading | 600 dados/labels | 700 ênfase
 */

export const typography = {
  // ─── Corpo (Inter – legibilidade)
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 14,
  },
  label: {
    fontFamily: 'MontserratAlternates_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  bodyXs: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  bodyLg: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },

  // ─── Títulos (Montserrat – elegância)
  titleSm: {
    fontFamily: 'MontserratAlternates_500Medium',
    fontSize: 16,
    lineHeight: 22,
  },
  title: {
    fontFamily: 'MontserratAlternates_500Medium',
    fontSize: 18,
    lineHeight: 24,
  },
  titleLg: {
    fontFamily: 'MontserratAlternates_500Medium',
    fontSize: 20,
    lineHeight: 26,
  },
  titleXl: {
    fontFamily: 'MontserratAlternates_500Medium',
    fontSize: 24,
    lineHeight: 30,
  },

  // ─── Display / Títulos de tela (Lovelo – tipografia oficial da marca)
  display: {
    fontFamily: 'LoveloBlack',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0.25,
  },
  displayLg: {
    fontFamily: 'LoveloBlack',
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 0.25,
  },
  /** Título principal de tela – usar em TODAS as telas (ex: Rede Glam, Combustível) */
  screenTitle: {
    fontFamily: 'LoveloBlack',
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 0.25,
  },
  /** Subtítulo de tela – linha abaixo do título */
  screenSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },

  // ─── Dados técnicos (Inter – sempre legível)
  data: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
  },
  dataLg: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    lineHeight: 28,
  },

  subheading: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 22,
  },
} as const;

export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const;
