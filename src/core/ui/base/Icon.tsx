import React from "react";
import { Pressable } from "react-native";
import * as ExpoIcons from "@expo/vector-icons";
import { useThemeColor } from "src/core/hooks/useThemeColor";
import type { ComponentType } from "react";
import { SvgProps } from "react-native-svg";
import { ThemedColorName } from "@ui/constants/Colors";

type CommonIconProps = {
  size?: number;
  colorName?: ThemedColorName;
  style?: any;
};

// Variant “expo vector-icons”
type VectorIconProps = {
  name: string;
  iconFamily?: keyof typeof ExpoIcons;
  svg?: never;
};

// Variant “local svg”
type LocalSvgIconProps = {
  svg: ComponentType<SvgProps>;
  name?: never;
  iconFamily?: never;
  localName?: never;
};

export type IconProps = (VectorIconProps | LocalSvgIconProps) &
  CommonIconProps & {
    onPress?: () => void;
    colorOverride?: string;
  };

export function Icon({
  iconFamily = "MaterialIcons",
  name,
  size = 24,
  colorName = "text",
  style,
  onPress,
  svg: SvgComponent,
  colorOverride,
}: IconProps) {
  const color = useThemeColor(colorName);
  const finalColor = colorOverride ?? color;

  // local svg
  if (SvgComponent) {
    return (
      <Pressable disabled={!onPress} onPress={onPress} style={style}>
        <SvgComponent
          fill={finalColor}
          height={size}
          stroke={finalColor}
          width={size}
        />
      </Pressable>
    );
  }

  // expo vector-icons
  const IconSet = (ExpoIcons as any)[iconFamily];
  if (!IconSet) {
    throw new Error(`Icon family "${iconFamily}" not found`);
  }
  if (!name) {
    throw new Error("Prop 'name' required for a vector-icons icon");
  }

  return (
    <Pressable disabled={!onPress} onPress={onPress} style={style}>
      <IconSet color={finalColor} name={name} size={size} />
    </Pressable>
  );
}
