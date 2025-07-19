import React from "react";
import { ThemedView, ViewProps } from "./Themed";

export function View(props: ViewProps) {
  return <ThemedView {...props} />;
}

export default View;
