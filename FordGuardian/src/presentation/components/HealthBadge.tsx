import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { HealthStatus } from '../../domain/entities/Vehicle';
import { FORD_COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../shared/theme';
import { HEALTH_STATUS_LABELS } from '../../shared/constants';

interface BadgeProps {
  status: HealthStatus;
  style?: ViewStyle;
}

const getStatusColor = (status: HealthStatus) => {
  switch (status) {
    case 'normal':
      return FORD_COLORS.HEALTH_NORMAL;
    case 'attention':
      return FORD_COLORS.HEALTH_ATTENTION;
    case 'critical':
      return FORD_COLORS.HEALTH_CRITICAL;
    default:
      return FORD_COLORS.DARK_GRAY;
  }
};

export const HealthBadge: React.FC<BadgeProps> = ({ status, style }) => {
  const color = getStatusColor(status);
  const label = HEALTH_STATUS_LABELS[status];

  return (
    <View style={[styles.badge, { backgroundColor: color }, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    color: FORD_COLORS.WHITE,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});