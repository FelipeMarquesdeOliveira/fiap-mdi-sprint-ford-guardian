import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { FORD_COLORS } from '../../shared/theme';
import { HealthStatus } from '../../domain/entities/Vehicle';

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress?: number;
  status?: HealthStatus;
}

const getStatusColor = (status: HealthStatus) => {
  switch (status) {
    case 'normal': return FORD_COLORS.HEALTH_NORMAL;
    case 'attention': return FORD_COLORS.HEALTH_ATTENTION;
    case 'critical': return FORD_COLORS.HEALTH_CRITICAL;
    default: return FORD_COLORS.DARK_GRAY;
  }
};

const getProgress = (status: HealthStatus): number => {
  switch (status) {
    case 'normal': return 0.85;
    case 'attention': return 0.55;
    case 'critical': return 0.25;
    default: return 0;
  }
};

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 120,
  strokeWidth = 8,
  status = 'normal',
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const progress = getProgress(status);
  const color = getStatusColor(status);
  const radius = (size - strokeWidth) / 2;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const circumference = 2 * Math.PI * radius;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.backgroundCircle}>
        <View style={[styles.circleBase, {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: FORD_COLORS.MEDIUM_GRAY,
        }]} />
      </View>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          transform: [{
            rotate: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          }],
        }}
      >
        <View style={{
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            width: radius * 1.6,
            height: radius * 1.6,
            borderRadius: radius * 0.8,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: color,
            borderBottomColor: 'transparent',
          }} />
        </View>
      </Animated.View>
      <View style={styles.centerContent}>
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
  },
  circleBase: {
    opacity: 0.2,
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});