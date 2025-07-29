import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { Icon } from "../base/Icon";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import icons
import PlusIcon from "../../../../assets/icons/edit.svg"; // We'll use edit icon as plus for now

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CreateNoteFAB() {
  const insets = useSafeAreaInsets();

  // Animation values
  const scale = useSharedValue(1);

  const handlePress = () => {
    // Add a nice press animation
    scale.value = withSequence(
      withSpring(0.9, { damping: 15 }),
      withSpring(1, { damping: 15 }),
    );

    // Navigate to create note modal
    router.push("/routes/create-note");
  };

  // Animated styles
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.fab, buttonStyle, { bottom: insets.bottom + 20 }]}
    >
      <Icon colorName={"background"} size={24} svg={PlusIcon} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
});
