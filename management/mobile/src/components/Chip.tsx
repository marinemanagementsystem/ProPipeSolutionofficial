import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ChipProps {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'default',
  size = 'small',
  style,
}) => {
  const { colors } = useTheme();

  const getVariantStyles = (): { bg: string; text: string; border: string } => {
    switch (variant) {
      case 'primary':
        return {
          bg: `${colors.primary}20`,
          text: colors.primary,
          border: `${colors.primary}40`,
        };
      case 'success':
        return {
          bg: `${colors.success}20`,
          text: colors.success,
          border: `${colors.success}40`,
        };
      case 'warning':
        return {
          bg: `${colors.warning}20`,
          text: colors.warning,
          border: `${colors.warning}40`,
        };
      case 'error':
        return {
          bg: `${colors.error}20`,
          text: colors.error,
          border: `${colors.error}40`,
        };
      case 'info':
        return {
          bg: `${colors.info}20`,
          text: colors.info,
          border: `${colors.info}40`,
        };
      default:
        return {
          bg: colors.surfaceVariant,
          text: colors.textSecondary,
          border: colors.border,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.chip,
        size === 'small' ? styles.small : styles.medium,
        {
          backgroundColor: variantStyles.bg,
          borderColor: variantStyles.border,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          size === 'small' ? styles.labelSmall : styles.labelMedium,
          { color: variantStyles.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  small: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  medium: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  label: {
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 11,
  },
  labelMedium: {
    fontSize: 13,
  },
});

export default Chip;
