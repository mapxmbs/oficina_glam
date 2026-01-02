// Utilitário para garantir fontes consistentes entre iOS e Android

export const fonts = {
  // Títulos grandes e chamadas principais
  heading: {
    fontFamily: 'LoveloBlack',
    textTransform: 'uppercase' as const,
  },
  
  // Subtítulos e labels
  subheading: {
    fontFamily: 'MontserratAlternates-Medium',
  },
  
  // Texto corpo e parágrafos
  body: {
    fontFamily: 'Inter-Regular',
  },
  
  // Texto de botões
  button: {
    fontFamily: 'MontserratAlternates-Medium',
    fontWeight: 'bold' as const,
  },
  
  // Labels e captions
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
};

// Helper para aplicar fonte de forma consistente
export const getFontStyle = (type: keyof typeof fonts) => fonts[type];
