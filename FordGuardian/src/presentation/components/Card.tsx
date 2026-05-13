import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BORDER_RADIUS, FORD_COLORS, SPACING } from '../../shared/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: FORD_COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});