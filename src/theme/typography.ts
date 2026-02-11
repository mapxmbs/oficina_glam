/**
 * Hierarquia tipográfica – Inter única (regra absoluta)
 * Variação por peso e tamanho. Visual clean e premium.
 */

export const typography = {
  // ─── Corpo
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 14,
  },
  label: {
    fontFamily: 'Inter_400Regular',
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

  // ─── Títulos (Inter com peso maior)
  titleSm: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  titleLg: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
  },
  titleXl: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    lineHeight: 30,
  },

  // ─── Display (headlines principais)
  display: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 26,
  },
  displayLg: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    lineHeight: 30,
  },

  // ─── Aliases para migração (mesmo que body/subheading)
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
