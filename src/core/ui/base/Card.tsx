import React from "react";
import { View, ViewStyle } from "react-native";
import { ThemedView, ViewProps } from "./Themed";
import { Theme } from "@ui/constants/Colors";
import { useThemeColor } from "src/core/hooks/useThemeColor";
import { typography } from "@ui/constants/Typography";
import { Text } from "./Text";
import { Pressable } from "react-native";
import CloseIcon from "../../../../assets/icons/close.svg";
import { Icon } from "./Icon";

export type CardType = "info" | "msg";
export type CardProps = {
  type?: CardType;
  title?: string;
  content?: string;
  hasShadow?: boolean;
  style?: ViewStyle;
  textColorName?: keyof typeof Theme.light & keyof typeof Theme.dark;
  textVariant?: keyof typeof typography;
  titleVariant?: keyof typeof typography;
  icon?: (color: string) => React.ReactElement<{ color: string }>;
  children?: React.ReactNode;
  onClose?: () => void;
} & ViewProps;

export function Card(props: CardProps) {
  const {
    style,
    type = "info",
    icon,
    onClose,
    title,
    colorName = "background",
    textColorName = "text",
    borderColorName = "border1",
    content,
    hasShadow = false,
    textVariant = "body1",
    titleVariant = "h3",
    children,
    ...otherProps
  } = props;

  const iconColor = useThemeColor(textColorName);

  return (
    <ThemedView
      borderColorName={borderColorName}
      colorName={colorName}
      hasBackground={true}
      style={[
        {
          borderWidth: 1,
          borderRadius: 13,
          paddingVertical: 16,
          ...(hasShadow && {
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,
            elevation: 0.5,
          }),
        },
        style,
      ]}
      hasBorder
      {...otherProps}
    >
      {(title || icon || onClose) && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 16,
          }}
        >
          {(title || icon) && (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                gap: 10,
                alignItems: "center",
              }}
            >
              {icon && <View>{icon(iconColor)}</View>}
              {title && (
                <Text colorName={textColorName} variant={titleVariant}>
                  {title}
                </Text>
              )}
            </View>
          )}
          {onClose && (
            <Pressable onPress={onClose}>
              <Icon colorOverride={iconColor} size={24} svg={CloseIcon} />
            </Pressable>
          )}
        </View>
      )}
      {children ? (
        children
      ) : (
        <Text colorName={textColorName} variant={textVariant}>
          {content}
        </Text>
      )}
    </ThemedView>
  );
}
