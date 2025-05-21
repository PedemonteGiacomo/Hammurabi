// .storybook/main.js
import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  stories: [
    "../src/components/**/*.stories.@(ts|tsx|js|jsx|mdx)",
    "../src/pages/**/*.stories.@(ts|tsx|js|jsx|mdx)"
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app",
    "@storybook/addon-interactions"
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {}
  },
  staticDirs: [
    "../public"    // così asset come /assets/*.svg/jpg saranno serviti
  ]
};

export default config;
