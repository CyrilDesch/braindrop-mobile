import { useColorScheme } from "react-native";
import { Theme } from "../ui/constants/Colors";

export function useThemeColor(
  colorName: keyof typeof Theme.light & keyof typeof Theme.dark,
) {
  let theme = useColorScheme() ?? "light";
  //theme = "light";
  return Theme[theme][colorName];
}
