import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FORD_COLORS } from '../../shared/theme';

interface TabIconProps {
  name: 'car' | 'bell' | 'account';
  size?: number;
  color?: string;
}

export const TabIcon: React.FC<TabIconProps> = ({
  name,
  size = 24,
  color = FORD_COLORS.DARK_GRAY
}) => {
  const iconNames = {
    car: 'car-outline',
    bell: 'bell-outline',
    account: 'account-outline',
  };

  return (
    <MaterialCommunityIcons
      name={iconNames[name] as any}
      size={size}
      color={color}
    />
  );
};