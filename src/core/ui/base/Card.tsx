import React from "react";
import { View, ViewStyle } from "react-native";
import { ThemedView, ViewProps } from "./Themed";
import { Theme } from "@ui/constants/Colors";
import { useThemeColor } from "src/core/hooks/useThemeColor";
import { typography } from "@ui/constants/Typography";
import { Text } from "./Text";

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
} & ViewProps;

export function Card(props: CardProps) {
  const {
    style,
    type = "info",
    icon,
    title,
    colorName = "background",
    textColorName = "text",
    borderColorName = "border1",
    content,
    hasShadow = true,
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
          borderWidth: 2,
          borderRadius: 20,
          padding: 17,
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
      {children ? (
        children
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <>
            {icon && <View style={{ marginRight: 15 }}>{icon(iconColor)}</View>}
            <View style={{ flex: 1 }}>
              {title && (
                <Text colorName={textColorName} variant={titleVariant}>
                  {title}
                </Text>
              )}
              <Text colorName={textColorName} variant={textVariant}>
                {content}
              </Text>
            </View>
          </>
        </View>
      )}
    </ThemedView>
  );
}
