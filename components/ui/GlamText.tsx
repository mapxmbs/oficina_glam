/**
 * GlamText – texto que usa EXCLUSIVAMENTE typography do theme
 * Nunca definir fontSize ou fontFamily na tela.
 */

import type { TextProps } from 'react-native';
import { Text } from 'react-native';
import { colors } from '../../src/theme/colors';
import { typography, type TypographyKey } from '../../src/theme/typography';

type GlamTextVariant = keyof typeof typography;

type GlamTextProps = TextProps & {
  variant?: GlamTextVariant;
  /** Cor do texto – usar tokens do theme */
  color?: keyof typeof colors | string;
  children: React.ReactNode;
};

const colorMap: Partial<Record<string, string>> = {
  text: colors.text,
  textSecondary: colors.textSecondary,
  textTertiary: colors.textTertiary,
  accent: colors.accent,
  iconOnAccent: colors.iconOnAccent,
  iconPrimary: colors.iconPrimary,
  iconMuted: colors.iconMuted,
  danger: colors.danger,
};

export function GlamText({
  variant = 'body',
  color = 'text',
  style,
  children,
  ...rest
}: GlamTextProps) {
  const typo = typography[variant as TypographyKey] ?? typography.body;
  const resolvedColor = colorMap[color as keyof typeof colors] ?? (typeof color === 'string' ? color : colors.text);

  return (
    <Text style={[typo, { color: resolvedColor }, style]} {...rest}>
      {children}
    </Text>
  );
}
