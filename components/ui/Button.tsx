/**
 * Button – variantes do design system
 * NUNCA estilizar botões na mão. Usar SEMPRE uma variante.
 */

import type { TextProps, ViewProps } from 'react-native';
import { Pressable, Text } from 'react-native';
import { colors } from '../../src/theme/colors';
import {
  ctaPrimary,
  buttonSecondary,
  buttonSecondaryAccent,
  buttonGhost,
  buttonDanger,
  buttonOnAccent,
} from '../../src/theme/design-patterns';
import { typography } from '../../src/theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'secondaryAccent' | 'ghost' | 'danger' | 'onAccent';

type ButtonProps = ViewProps & {
  variant?: ButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  /** Texto do botão – usa Typography do theme */
  label?: string;
};

const variantStyle = {
  primary: ctaPrimary,
  secondary: buttonSecondary,
  secondaryAccent: buttonSecondaryAccent,
  ghost: buttonGhost,
  danger: buttonDanger,
  onAccent: buttonOnAccent,
};

const textColor = {
  primary: colors.iconOnAccent,
  secondary: colors.text,
  secondaryAccent: colors.accent,
  ghost: colors.accent,
  danger: colors.iconOnAccent,
  onAccent: colors.iconOnAccent,
};

export function Button({
  variant = 'primary',
  onPress,
  disabled = false,
  children,
  label,
  style,
  ...rest
}: ButtonProps) {
  const btnStyle = variantStyle[variant];
  const color = textColor[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        btnStyle,
        { opacity: disabled ? 0.5 : pressed ? 0.9 : 1 },
        style,
      ]}
      {...rest}
    >
      {label != null ? (
        <Text style={[typography.titleSm, { color }]}>{label}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
