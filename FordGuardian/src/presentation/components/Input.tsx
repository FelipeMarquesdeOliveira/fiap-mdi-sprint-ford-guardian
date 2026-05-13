import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { FORD_COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../shared/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={FORD_COLORS.DARK_GRAY}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: FORD_COLORS.FORD_CHARCOAL,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: FORD_COLORS.LIGHT_GRAY,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: FORD_COLORS.FORD_CHARCOAL,
    borderWidth: 1,
    borderColor: FORD_COLORS.MEDIUM_GRAY,
  },
  inputError: {
    borderColor: FORD_COLORS.ERROR,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: FORD_COLORS.ERROR,
    marginTop: SPACING.xs,
  },
});