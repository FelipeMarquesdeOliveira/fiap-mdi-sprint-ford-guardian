import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FORD_COLORS, SPACING, TYPOGRAPHY } from '../../shared/theme';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  badge?: number;
  color?: string;
  size?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  badge,
  color = FORD_COLORS.WHITE,
  size = 24,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <MaterialCommunityIcons name={icon as any} size={size} color={color} />
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.sm,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: FORD_COLORS.HEALTH_CRITICAL,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: FORD_COLORS.WHITE,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});