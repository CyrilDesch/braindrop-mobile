import React from "react";
import { View, ActivityIndicator as RNActivityIndicator } from "react-native";
import { Text } from "../base/Text";
import { useThemeColor } from "../../hooks/useThemeColor";

interface EmbeddingLoadingIndicatorProps {
  message?: string;
  size?: "small" | "large";
}

export function EmbeddingLoadingIndicator({
  message = "Initializing AI features...",
  size = "large",
}: EmbeddingLoadingIndicatorProps) {
  const primaryColor = useThemeColor("primary");
  const backgroundColor = useThemeColor("background");

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor,
        padding: 20,
      }}
    >
      <RNActivityIndicator color={primaryColor} size={size} />
      <Text
        style={{
          marginTop: 16,
          textAlign: "center",
          opacity: 0.7,
        }}
      >
        {message}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontSize: 12,
          textAlign: "center",
          opacity: 0.5,
        }}
      >
        This may take a few moments on first launch
      </Text>
    </View>
  );
}

interface InlineEmbeddingLoadingProps {
  message?: string;
  size?: "small" | "large";
}

export function InlineEmbeddingLoading({
  message = "Preparing AI features...",
  size = "small",
}: InlineEmbeddingLoadingProps) {
  const primaryColor = useThemeColor("primary");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        justifyContent: "center",
      }}
    >
      <RNActivityIndicator color={primaryColor} size={size} />
      <Text
        style={{
          marginLeft: 12,
          opacity: 0.7,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
