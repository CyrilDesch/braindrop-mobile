import {
  ThemedActivityIndicatorProps,
  ThemedActivityIndicator,
} from "@ui/base/Themed";

export const ActivityIndicator = ({
  ...otherProps
}: ThemedActivityIndicatorProps) => {
  return <ThemedActivityIndicator {...otherProps} />;
};
