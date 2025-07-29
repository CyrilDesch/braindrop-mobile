import React, { useState } from "react";
import { StyleSheet, Pressable, Dimensions } from "react-native";
import { View } from "../base/View";
import { Text } from "../base/Text";
import { Icon } from "../base/Icon";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FABAction } from "./types";

// Import icons
import PlusIcon from "../../../../assets/icons/edit.svg"; // We'll use edit icon as plus for now

const { width } = Dimensions.get("window");

interface FloatingActionButtonProps {
  actions: FABAction[];
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Action Button Component - separated to avoid hooks in map
interface ActionButtonProps {
  action: FABAction;
  overlayOpacity: Animated.SharedValue<number>;
  onPress: (action: FABAction) => void;
}

function ActionButton({ action, overlayOpacity, onPress }: ActionButtonProps) {
  const actionStyle = useAnimatedStyle(() => {
    const translateY = interpolate(overlayOpacity.value, [0, 1], [50, 0]);
    const opacity = interpolate(overlayOpacity.value, [0, 1], [0, 1]);

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <AnimatedPressable
      onPress={() => onPress(action)}
      style={[
        styles.actionButton,
        actionStyle,
        { backgroundColor: action.color || "#007AFF" },
      ]}
    >
      <Icon colorName={"background"} size={20} svg={action.icon} />
      <Text
        colorName={"background"}
        style={styles.actionText}
        variant={"caption"}
      >
        {action.title}
      </Text>
    </AnimatedPressable>
  );
}

export default function FloatingActionButton({
  actions,
}: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();
  const [isExpanded, setIsExpanded] = useState(false);

  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const overlayOpacity = useSharedValue(0);

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);

    // Main button animations
    rotation.value = withSpring(newExpanded ? 45 : 0, { damping: 15 });
    scale.value = withSpring(newExpanded ? 1.1 : 1, { damping: 15 });

    // Overlay animation
    overlayOpacity.value = withTiming(newExpanded ? 1 : 0, { duration: 200 });
  };

  const handleActionPress = (action: FABAction) => {
    setIsExpanded(false);
    rotation.value = withSpring(0, { damping: 15 });
    scale.value = withSpring(1, { damping: 15 });
    overlayOpacity.value = withTiming(0, { duration: 200 });
    action.onPress();
  };

  // Animated styles
  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    pointerEvents: overlayOpacity.value > 0 ? "auto" : "none",
  }));

  return (
    <>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable
          onPress={() => setIsExpanded(false)}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Action buttons */}
      {isExpanded && (
        <View style={[styles.actionContainer, { bottom: insets.bottom + 100 }]}>
          {actions.map((action) => (
            <ActionButton
              key={action.id}
              action={action}
              onPress={handleActionPress}
              overlayOpacity={overlayOpacity}
            />
          ))}
        </View>
      )}

      {/* Main FAB */}
      <AnimatedPressable
        onPress={toggleExpanded}
        style={[styles.fab, mainButtonStyle, { bottom: insets.bottom + 20 }]}
      >
        <Icon colorName={"background"} size={24} svg={PlusIcon} />
      </AnimatedPressable>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 998,
  },
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
  actionContainer: {
    position: "absolute",
    right: 20,
    alignItems: "center",
    gap: 12,
    zIndex: 999,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    minWidth: 120,
  },
  actionText: {
    fontWeight: "600",
  },
});
