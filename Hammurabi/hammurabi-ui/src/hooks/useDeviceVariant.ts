import { useBreakpointValue } from "@chakra-ui/react";

export type Device = "mobile" | "tablet" | "desktop";

export function useDeviceVariant(): Device {
  return useBreakpointValue<Device>({
    base: "mobile",  // <= sm
    md: "tablet",  // ≥ md
    lg: "desktop", // ≥ lg
  })!;
}
