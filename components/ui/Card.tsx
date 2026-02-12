/**
 * Card – variantes do design system
 * NUNCA estilizar fora do theme. Usar SEMPRE uma variante.
 */

import type { ViewProps } from 'react-native';
import { Pressable, View } from 'react-native';
import {
  blockAccent,
  blockSoft,
  cardBase,
} from '../../src/theme/design-patterns';

export type CardVariant = 'base' | 'flat' | 'principal';

type CardProps = ViewProps & {
  variant?: CardVariant;
  /** Se fornecido, card é clicável */
  onPress?: () => void;
  children: React.ReactNode;
};

const variantMap = {
  base: cardBase,
  flat: blockSoft,
  principal: blockAccent,
};

export function Card({
  variant = 'base',
  onPress,
  style,
  children,
  ...rest
}: CardProps) {
  const baseStyle = variantMap[variant];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [baseStyle, { transform: [{ scale: pressed ? 0.995 : 1 }] }, style]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[baseStyle, style]} {...rest}>
      {children}
    </View>
  );
}
