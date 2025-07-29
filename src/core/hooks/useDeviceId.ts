import { useContext } from "react";
import {
  DeviceIdContext,
  DeviceIdContextType,
} from "../context/DeviceIdContextDef";

/**
 * Hook to access the device ID from the DeviceIdProvider context
 */
export function useDeviceId(): DeviceIdContextType {
  const context = useContext(DeviceIdContext);

  if (context === undefined) {
    throw new Error("useDeviceId must be used within a DeviceIdProvider");
  }

  return context;
}
