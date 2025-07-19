import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

type AppStateHandler = (status: AppStateStatus) => void;

/**
 * Hook to track and react to app state changes
 *
 * @param onForeground Function to call when app moves to foreground
 * @param onBackground Function to call when app moves to background
 * @returns The current app state
 */
export function useAppState(
  onForeground?: AppStateHandler,
  onBackground?: AppStateHandler,
): AppStateStatus {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const wasInactive = appState === "inactive" || appState === "background";
      const isNowActive = nextAppState === "active";
      const isNowInactive =
        nextAppState === "inactive" || nextAppState === "background";

      // App moved to foreground
      if (wasInactive && isNowActive && onForeground) {
        onForeground(nextAppState);
      }

      // App moved to background
      if (!wasInactive && isNowInactive && onBackground) {
        onBackground(nextAppState);
      }

      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState, onForeground, onBackground]);

  return appState;
}

/**
 * Utility function to initialize app state tracking without a React component
 *
 * @param onBackground Function to call when app moves to background
 * @param onForeground Function to call when app moves to foreground
 * @returns Cleanup function to remove listeners
 */
export function initAppStateHandler(
  onBackground?: AppStateHandler,
  onForeground?: AppStateHandler,
): () => void {
  // State to track previous app state
  let previousState = AppState.currentState;

  // Handle app state changes
  const subscription = AppState.addEventListener("change", (nextAppState) => {
    const wasInactive =
      previousState === "inactive" || previousState === "background";
    const isNowActive = nextAppState === "active";
    const isNowInactive =
      nextAppState === "inactive" || nextAppState === "background";

    // App moved to foreground
    if (wasInactive && isNowActive && onForeground) {
      onForeground(nextAppState);
    }

    // App moved to background
    if (!wasInactive && isNowInactive && onBackground) {
      onBackground(nextAppState);
    }

    previousState = nextAppState;
  });

  // Return cleanup function
  return () => {
    subscription.remove();
  };
}
