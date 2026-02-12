/**
 * Button – variantes do design system
 * NUNCA estilizar botões na mão. Usar SEMPRE uma variante.
 */

import type { TextProps, ViewProps } from 'react-native';
import { Pressable, Text } from 'react-native';
import { colors } from '../../src/theme/colors';
import {
  ctaPrimary,
  ctaPrimaryMuted,
  buttonSecondary,
  buttonSecondaryAccent,
  buttonGhost,
  buttonDanger,
  buttonOnAccent,
} from '../../src/theme/design-patterns';
import { typography } from '../../src/theme/typography';

export type ButtonVariant = 'primary' | 'primaryMuted' | 'secondary' | 'secondaryAccent' | 'ghost' | 'danger' | 'onAccent';

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
  primaryMuted: ctaPrimaryMuted,
  secondary: buttonSecondary,
  secondaryAccent: buttonSecondaryAccent,
  ghost: buttonGhost,
  danger: buttonDanger,
  onAccent: buttonOnAccent,
};

const textColor = {
  primary: colors.iconOnAccent,
  primaryMuted: colors.iconOnAccent,
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
  const color = disabled ? colors.textMedium : textColor[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        btnStyle,
        disabled && { backgroundColor: colors.surfaceTint, borderColor: colors.border, borderWidth: 1 },
        !disabled && pressed && { transform: [{ scale: 0.98 }] },
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
