/**
 * Screen – wrapper padrão para telas
 * Usa EXCLUSIVAMENTE theme (screenNeutral, colors.background)
 */

import type { ViewProps } from 'react-native';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { screenNeutral, spacing } from '../../src/theme/design-patterns';

type ScreenProps = ViewProps & {
  scroll?: boolean;
  contentContainerStyle?: object;
  /** Para pull-to-refresh */
  refreshing?: boolean;
  onRefresh?: () => void;
  children: React.ReactNode;
};

export function Screen({
  scroll = true,
  contentContainerStyle,
  style,
  refreshing,
  onRefresh,
  children,
}: ScreenProps) {
  const padding = {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.screenPaddingTop,
    paddingBottom: spacing.screenPaddingBottom,
  };

  if (scroll) {
    return (
      <SafeAreaView style={[screenNeutral, style]} edges={['top']}>
        <ScrollView
          contentContainerStyle={[padding, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} colors={[colors.accent]} tintColor={colors.accent} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[screenNeutral, style]} edges={['top']}>
      <View style={[padding, contentContainerStyle]}>{children}</View>
    </SafeAreaView>
  );
}
