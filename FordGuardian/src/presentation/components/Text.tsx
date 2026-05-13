import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { TYPOGRAPHY, TEXT_VARIANTS, FORD_COLORS } from '../../shared/theme';

interface TextProps {
  children: React.ReactNode;
  variant?: keyof typeof TEXT_VARIANTS;
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'bodyMedium',
  color = FORD_COLORS.FORD_CHARCOAL,
  align = 'left',
  style,
}) => {
  const variantStyle = TEXT_VARIANTS[variant];

  return (
    <RNText style={[styles.text, variantStyle, { color, textAlign: align }, style]}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
  },
});