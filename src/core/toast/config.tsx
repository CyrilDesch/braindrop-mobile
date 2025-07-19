import { typography } from "@ui";
import React from "react";
import {
  BaseToast,
  BaseToastProps,
  ToastConfig,
} from "react-native-toast-message";

const toastProps: BaseToastProps = {
  text1Style: {
    ...typography.h4,
    fontSize: 16,
  },
  text2Style: {
    ...typography.body1,
    fontSize: 14,
  },
  text2NumberOfLines: 0,
  style: {
    height: "auto",
    paddingVertical: 15,
    paddingHorizontal: 0,
  },
};

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      {...toastProps}
      style={[
        toastProps.style,
        {
          borderLeftColor: "#69C779",
        },
      ]}
    />
  ),
  error: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      {...toastProps}
      style={[
        toastProps.style,
        {
          borderLeftColor: "#FE6301",
        },
      ]}
    />
  ),
  warning: (props) => (
    <BaseToast
      {...props}
      {...toastProps}
      style={[
        toastProps.style,
        {
          borderLeftColor: "#FFC107",
        },
      ]}
    />
  ),
};
