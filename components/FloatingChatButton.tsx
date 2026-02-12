/**
 * Bolha de chat – Leninha (rosto da Oficina Glam) com mensagem simpática
 * Abre o chat/IA ao tocar. Adaptável iOS e Android.
 */

import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';

const BOTTOM_OFFSET = Platform.OS === 'ios' ? 90 : 85;

export function FloatingChatButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 12) + BOTTOM_OFFSET;

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom }]}>
      <Pressable
        onPress={() => router.push('/ia-module')}
        style={({ pressed }) => [styles.bubble, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}
      >
        <Image
          source={require('../assets/brand/symbol.png')}
          style={styles.avatar}
          contentFit="contain"
        />
        <View style={styles.messageWrap}>
          <Text style={styles.message} numberOfLines={2}>
            Em que posso ajudar?
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: Platform.OS === 'ios' ? 20 : 16,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 28,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 18,
    maxWidth: 220,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  messageWrap: {
    flex: 1,
  },
  message: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.text,
  },
});
