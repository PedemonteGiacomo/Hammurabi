// .storybook/preview.tsx
import '../src/styles/Hammurabi_style.css';  // il vostro CSS globale
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import type { Preview } from '@storybook/react-webpack5';
import { ChakraProvider } from '@chakra-ui/react';
import { withThemeByClassName } from '@storybook/addon-themes';

const withChakra = (Story) => (
  <ChakraProvider resetCSS={false}>
    <Story />
  </ChakraProvider>
);

const withBootstrapButtons = (Story) => (
  <>
    <style>{`
      .study-list-table button.btn-primary {
        background-color: #0d6efd !important;
        border-color: #0d6efd !important;
        color: #fff !important;
      }
      .study-list-table button.btn-secondary {
        background-color: #6c757d !important;
        border-color: #6c757d !important;
        color: #fff !important;
      }
    `}</style>
    <Story />
  </>
);

const withGlobalInputStyles = (Story) => (
  <>
    <style>{`
      /* override for gli input dentro il viewer */
      .dicom-viewer-container input {
        background-color: #fff !important;
        color: #000 !important;
        border: 1px solid #555 !important;
        padding: 0.25rem 0.5rem !important;
        border-radius: 4px !important;
      }
      .dicom-viewer-container input::placeholder {
        color: #666 !important;
      }
    `}</style>
    <Story />
  </>
);

const preview: Preview = {
  decorators: [
    withChakra,
    withThemeByClassName({
      defaultTheme: 'light',
      themes: { light: '', dark: 'dark' },
    }),
    withGlobalInputStyles,
    withBootstrapButtons,
  ],
  parameters: {
    actions: { argTypesRegex: '^on.*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'fullscreen',
  },
};

export default preview;
