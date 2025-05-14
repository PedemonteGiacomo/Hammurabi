// src/theme.ts
import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  // here you can override colors, fonts, breakpoints, etc.
  breakpoints: {
    sm: "30em",  // 480px
    md: "48em",  // 768px
    lg: "62em",  // 992px
    xl: "80em",  // 1280px
  },
  components: {
    Button: {
      baseStyle: { rounded: "md" },
      variants: {
        solid: (props: any) => ({
          bg: props.colorMode === "dark" ? "teal.300" : "teal.500",
        }),
      },
    },
  },
});
