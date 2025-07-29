import React from "react";
import { LayoutViewProps, ThemedView } from "./Themed";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform } from "react-native";

export function LayoutView(props: LayoutViewProps) {
  const {
    style,
    containerStyle,
    hasBackground = true,
    children,
    ...otherProps
  } = props;
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      hasBackground={hasBackground}
      style={[
        {
          flex: 1,
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style,
      ]}
      {...otherProps}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[containerStyle, { flex: 1 }]}
      >
        {children}
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
