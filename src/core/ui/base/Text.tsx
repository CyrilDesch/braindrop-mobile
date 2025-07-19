import React from "react";
// eslint-disable-next-line no-restricted-imports
import { Text as DefaultText } from "react-native";
import { TextProps, ThemedText } from "./Themed";
import { typography } from "../constants/Typography";

export interface CustomTextProps extends TextProps {
  variant?: keyof typeof typography;
}

export type TextRef = DefaultText;

export const Text = React.forwardRef<TextRef, CustomTextProps>((props, ref) => {
  const { variant, style, ...rest } = props;
  const defaultStyle = typography[variant ?? "body1"];

  return <ThemedText ref={ref} {...rest} style={[defaultStyle, style]} />;
});
