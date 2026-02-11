/**
 * Botão flutuante – Assistente Leninha
 * Discreto, elegante, “assistente silencioso”. Sem brilho nem sombra pesada.
 */

import { useRouter } from 'expo-router';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrilhoIcon } from './icons';
import { colors } from '../src/theme/colors';

const SIZE = Platform.OS === 'ios' ? 48 : 46;
const BOTTOM_OFFSET = Platform.OS === 'ios' ? 90 : 85;

export function FloatingIAButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 12) + BOTTOM_OFFSET;

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom }]}>
      <TouchableOpacity
        onPress={() => router.push('/ia-module')}
        activeOpacity={0.8}
        style={styles.button}
      >
        <BrilhoIcon size={22} color={colors.iconOnAccent} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
});
