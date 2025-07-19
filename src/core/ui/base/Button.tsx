import React from "react";
import {
  StyleSheet,
  Pressable,
  View,
  TextStyle,
  StyleProp,
} from "react-native";
import { Text } from "./Text";
import { typography } from "../constants/Typography";
import { ButtonProps, ThemedButton } from "./Themed";
import { useThemeColor } from "src/core/hooks/useThemeColor";
import { ActivityIndicator } from "@ui/base/ActivityIndicator";
import { Theme } from "@ui/constants";

export interface CustomButtonProps extends ButtonProps {
  title: string;
  colorName?: keyof typeof Theme.light & keyof typeof Theme.dark;
  size?: "small" | "medium" | "large";
  textColorName?: keyof typeof Theme.light & keyof typeof Theme.dark;
  textVariant?: keyof typeof typography;
  textStyle?: StyleProp<TextStyle>;
  loading?: boolean;
  icon?: (color: string) => React.ReactElement<{ color: string }>;
  iconPosition?: "left" | "right";
}

export const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  CustomButtonProps
>((props, ref) => {
  const {
    title,
    colorName = "primary",
    size = "medium",
    textColorName,
    textVariant = "button",
    style,
    loading = false,
    icon,
    iconPosition = "left",
    isOutline = false,
    isInline = false,
    textStyle,
    ...rest
  } = props;

  const sizeStyles = {
    small: styles.smallButton,
    medium: styles.mediumButton,
    large: styles.largeButton,
  };

  let fixedTextColorName = textColorName
    ? textColorName
    : isInline
    ? "text"
    : "textInverse";
  const iconColor = useThemeColor(fixedTextColorName);

  return (
    <ThemedButton
      ref={ref}
      {...rest}
      colorName={colorName}
      disabled={loading || rest.disabled}
      isInline={isInline}
      isOutline={isOutline}
      style={({ pressed }) => [
        styles.button,
        sizeStyles[size],
        isOutline && styles.outlineButton,
        pressed && !isInline && styles.pressed,
        typeof style === "function" ? style({ pressed }) : style,
      ]}
    >
      <View
        style={[
          styles.contentContainer,
          iconPosition === "right" ? styles.reverseContent : null,
        ]}
      >
        {icon && <View style={[styles.icon]}>{icon(iconColor)}</View>}
        <Text
          colorName={fixedTextColorName}
          style={textStyle}
          variant={textVariant}
        >
          {title}
        </Text>
        {loading && (
          <ActivityIndicator
            colorName={fixedTextColorName}
            size={"small"}
            style={{ position: "absolute", right: -30, marginLeft: 10 }}
          />
        )}
      </View>
    </ThemedButton>
  );
});

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {},
  smallButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  outlineButton: {
    borderWidth: 1.2,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  reverseContent: {
    flexDirection: "row-reverse",
  },
  icon: {
    marginHorizontal: 8,
  },
});
