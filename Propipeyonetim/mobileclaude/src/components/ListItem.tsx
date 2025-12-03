import React, { ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { SIZES } from "../theme";

interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  rightContent?: ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  bottomBorder?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  leftIcon,
  leftIconColor,
  rightContent,
  showChevron = false,
  onPress,
  bottomBorder = true
}) => {
  const { theme } = useTheme();

  const content = (
    <View
      style={[
        styles.container,
        bottomBorder && {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border
        }
      ]}
    >
      {leftIcon && (
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${leftIconColor || theme.colors.primary}20` }
          ]}
        >
          <Ionicons
            name={leftIcon}
            size={20}
            color={leftIconColor || theme.colors.primary}
          />
        </View>
      )}

      <View style={styles.content}>
        <Text
          style={[styles.title, { color: theme.colors.textPrimary }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
        {description && (
          <Text
            style={[styles.description, { color: theme.colors.textTertiary }]}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}
      </View>

      {rightContent && <View style={styles.rightContent}>{rightContent}</View>}

      {showChevron && !rightContent && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textTertiary}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.sm
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: SIZES.fontMd,
    fontWeight: "500"
  },
  subtitle: {
    fontSize: SIZES.fontSm,
    marginTop: 2
  },
  description: {
    fontSize: SIZES.fontSm,
    marginTop: 4,
    lineHeight: 18
  },
  rightContent: {
    marginLeft: SIZES.sm
  }
});
