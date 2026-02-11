import Animated from 'react-native-reanimated';
import { BrilhoIcon } from './icons';
import { colors } from '../src/theme/colors';

export function HelloWave() {
  return (
    <Animated.View
      style={{
        marginTop: -6,
        transform: [{ scale: 1.1 }],
      }}
    >
      <BrilhoIcon size={28} color={colors.iconPrimary} />
    </Animated.View>
  );
}
