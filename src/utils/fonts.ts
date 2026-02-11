/**
 * Fontes – Inter única (regra absoluta)
 * Variação por peso e tamanho.
 */

export const fonts = {
  heading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
  },
  subheading: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  button: {
    fontFamily: 'Inter_600SemiBold',
  },
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
} as const;

export const getFontStyle = (type: keyof typeof fonts) => fonts[type];
