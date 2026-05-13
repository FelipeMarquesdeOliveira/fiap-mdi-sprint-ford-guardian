import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FORD_COLORS } from '../../shared/theme';

interface FordLogoProps {
  size?: number;
  color?: string;
}

export const FordLogo: React.FC<FordLogoProps> = ({
  size = 40,
  color = FORD_COLORS.FORD_BLUE
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.oval, { backgroundColor: color }]} />
      <View style={[styles.horizontalBar, { backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  oval: {
    width: '100%',
    height: '60%',
    borderRadius: 100,
    opacity: 0.9,
  },
  horizontalBar: {
    position: 'absolute',
    width: '60%',
    height: '15%',
    borderRadius: 4,
  },
});