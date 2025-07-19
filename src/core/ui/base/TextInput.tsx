import React from "react";

import { TextInput as DefaultTextInput } from "react-native";
import { ThemedTextInput, ThemedTextInputProps } from "./Themed";
import { typography } from "../constants/Typography";

export interface CustomTextInputProps extends ThemedTextInputProps {
  variant?: keyof typeof typography;
}

export type TextInputRef = DefaultTextInput;

export const TextInput = React.forwardRef<TextInputRef, CustomTextInputProps>(
  (props, ref) => {
    const { variant = "body1", style, ...rest } = props;
    const defaultStyle = typography[variant];

    return (
      <ThemedTextInput ref={ref} {...rest} style={[defaultStyle, style]} />
    );
  },
);
