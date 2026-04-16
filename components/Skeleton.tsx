import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Radius } from '../constants/theme';

interface Props {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  radius = Radius.sm,
  style,
}: Props) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0.5, { duration: 900 })),
      -1,
      true
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width as ViewStyle['width'], height, borderRadius: radius },
        animStyle,
        style,
      ]}
    />
  );
}

export function PesagemCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width={38} height={38} radius={999} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width="40%" height={12} />
        <Skeleton width="70%" height={16} />
        <Skeleton width="55%" height={12} />
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <Skeleton width={64} height={14} />
        <Skeleton width={40} height={10} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surfaceAlt,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
