/**
 * Utilitários de plataforma – Android e iOS
 * Design adaptável aos dois sistemas operacionais.
 */

import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

/** Padding de segurança para bottom (tab bar, FAB) */
export const bottomSafePadding = Platform.select({
  ios: 20,
  android: 12,
  default: 12,
});

/** Altura mínima de área toque (44pt iOS, 48dp Android) */
export const minTouchTarget = Platform.select({
  ios: 44,
  android: 48,
  default: 44,
});

/** Espaçamento de header/padding top */
export const headerPaddingTop = Platform.select({
  ios: 16,
  android: 12,
  default: 14,
});

/** Elevação/sombra – Android usa elevation, iOS shadow* */
export const elevation = (level: 1 | 2 | 3 | 4) => {
  const map = { 1: { elevation: 1 }, 2: { elevation: 2 }, 3: { elevation: 4 }, 4: { elevation: 6 } };
  const base = map[level];
  if (isIOS) {
    return {
      ...base,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: level },
      shadowOpacity: 0.06 + level * 0.02,
      shadowRadius: level * 2,
    };
  }
  return base;
};

/** Largura de tela para layout responsivo */
export const screenWidth = width;
export const screenHeight = height;
export const isNarrowScreen = width < 360;
