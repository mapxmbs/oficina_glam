/**
 * Hierarquia tipográfica – Contraste títulos vs corpo
 *
 * Princípio: Títulos destacam por tamanho e peso; corpo legível e neutro.
 * Sem fontes display decorativas no fluxo principal.
 */

export const typography = {
  // ─── Corpo (Inter – legibilidade)
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    lineHeight: 14,
  },
  label: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  bodyXs: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  bodyLg: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },

  // ─── Títulos (Montserrat – maior contraste com corpo)
  titleSm: {
    fontFamily: 'MontserratAlternates-Medium',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  title: {
    fontFamily: 'MontserratAlternates-Medium',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  titleLg: {
    fontFamily: 'MontserratAlternates-Medium',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
  },
  titleXl: {
    fontFamily: 'MontserratAlternates-Medium',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600' as const,
  },

  // ─── Display (LoveloBlack – apenas hero/marca, uso pontual)
  display: {
    fontFamily: 'LoveloBlack',
    fontSize: 20,
    lineHeight: 26,
  },
  displayLg: {
    fontFamily: 'LoveloBlack',
    fontSize: 24,
    lineHeight: 30,
  },
} as const;

export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const;
