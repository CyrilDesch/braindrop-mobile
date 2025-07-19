import { FontAwesome } from "@expo/vector-icons";
import * as Font from "expo-font";
import { useEffect, useState } from "react";

export default function useLoadFonts() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        await Font.loadAsync({
          ...FontAwesome.font,
          "Geist-Regular": require("../../../assets/fonts/Geist-Regular.ttf"),
          "Geist-Medium": require("../../../assets/fonts/Geist-Medium.ttf"),
          "Geist-SemiBold": require("../../../assets/fonts/Geist-SemiBold.ttf"),
          "Geist-Bold": require("../../../assets/fonts/Geist-Bold.ttf"),
          "Geist-Black": require("../../../assets/fonts/Geist-Black.ttf"),
        });
      } catch (e) {
        // Catch errors here
      } finally {
        setLoadingComplete(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
