import {
  // eslint-disable-next-line no-restricted-imports
  Text as DefaultText,
  View as DefaultView,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  TextInput as DefaultTextInput,
  TextInputProps,
  ActivityIndicator,
  ActivityIndicatorProps,
} from "react-native";
import { useThemeColor } from "../../hooks/useThemeColor";
import React from "react";
import Reanimated, { AnimatedProps } from "react-native-reanimated";
import { Theme } from "@ui/constants/Colors";

type ThemeProps = {
  colorName?: keyof typeof Theme.light & keyof typeof Theme.dark;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps &
  DefaultView["props"] & {
    hasBackground?: boolean;
    hasBorder?: boolean;
    borderColorName?: keyof typeof Theme.light & keyof typeof Theme.dark;
  };
export type LayoutViewProps = ThemeProps &
  DefaultView["props"] & {
    hasBackground?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
  };
export type ButtonProps = ThemeProps &
  PressableProps & { isInline?: boolean; isOutline?: boolean };
export type ReanimatedTextProps = ThemeProps &
  AnimatedProps<TextProps> &
  TextProps;
export type ReanimatedViewProps = ThemeProps &
  AnimatedProps<ViewProps> &
  ViewProps;
export type ThemedTextInputProps = ThemeProps & TextInputProps;
export type ThemedActivityIndicatorProps = ThemeProps & ActivityIndicatorProps;

export const ThemedText = React.forwardRef<DefaultText, TextProps>(
  (props, ref) => {
    const { style, colorName, ...otherProps } = props;
    const color = useThemeColor(colorName ?? "text");

    return <DefaultText ref={ref} style={[{ color }, style]} {...otherProps} />;
  },
);

export function ThemedView(props: ViewProps) {
  const {
    style,
    colorName,
    borderColorName,
    hasBackground,
    hasBorder,
    ...otherProps
  } = props;
  const backgroundColor = useThemeColor(colorName ?? "background");
  const borderColor = useThemeColor(borderColorName ?? "border1");

  return (
    <DefaultView
      style={[
        { backgroundColor: hasBackground ? backgroundColor : "transparent" },
        {
          borderColor: hasBorder ? borderColor : "transparent",
          borderWidth: hasBorder ? 1 : 0,
        },
        style,
      ]}
      {...otherProps}
    />
  );
}

export const ThemedButton = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>((props, ref) => {
  const { style, colorName, isInline, isOutline, ...otherProps } = props;
  const backgroundColor = useThemeColor(colorName ?? "primary");

  return (
    <Pressable
      ref={ref}
      style={({ pressed }) => [
        isInline
          ? {}
          : {
              backgroundColor: isOutline ? "transparent" : backgroundColor,
              borderColor: backgroundColor,
            },
        { opacity: pressed ? 1 : 1 },
        { transform: [{ scale: pressed ? 0.99 : 1 }] },
        typeof style === "function" ? style({ pressed }) : style,
      ]}
      {...otherProps}
    />
  );
});

export const ThemedReanimatedText = React.forwardRef<
  React.ElementRef<typeof Reanimated.Text>,
  ReanimatedTextProps
>((props, ref) => {
  const { style, colorName, ...otherProps } = props;
  const color = useThemeColor(colorName ?? "text");

  return (
    <Reanimated.Text ref={ref} style={[{ color }, style]} {...otherProps} />
  );
});

export const ThemedReanimatedView = React.forwardRef<
  React.ElementRef<typeof Reanimated.View>,
  ReanimatedViewProps
>((props, ref) => {
  const {
    style,
    colorName,
    borderColorName,
    hasBackground,
    hasBorder,
    ...otherProps
  } = props;
  const backgroundColor = useThemeColor(colorName ?? "background");
  const borderColor = useThemeColor(borderColorName ?? "border1");

  return (
    <Reanimated.View
      ref={ref}
      style={[
        {
          backgroundColor:
            hasBackground !== false ? backgroundColor : "transparent",
          borderColor: hasBorder !== false ? borderColor : "transparent",
        },
        style,
      ]}
      {...otherProps}
    />
  );
});

export const ThemedTextInput = React.forwardRef<
  DefaultTextInput,
  ThemedTextInputProps
>((props, ref) => {
  const { style, colorName, ...otherProps } = props;
  const textColor = useThemeColor(colorName ?? "text");
  const backgroundColor = useThemeColor(colorName ?? "background");

  return (
    <DefaultTextInput
      ref={ref}
      placeholderTextColor={textColor + "80"}
      style={[
        {
          color: textColor,
          backgroundColor,
        },
        style,
      ]}
      {...otherProps}
    />
  );
});

export const ThemedActivityIndicator = ({
  colorName,
  ...otherProps
}: ThemedActivityIndicatorProps) => {
  const color = useThemeColor(colorName ?? "text");

  return <ActivityIndicator color={color} size={"small"} {...otherProps} />;
};
