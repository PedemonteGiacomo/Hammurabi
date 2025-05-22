// src/components/ViewerToolbar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import ViewerToolbar from '../components/ViewerToolbar';

const meta: Meta<typeof ViewerToolbar> = {
  title: 'Components/ViewerToolbar',
  component: ViewerToolbar,
  args: {
    showSidebar: true,
    brightnessMode: false,
    measurementMode: false,
    annotationMode: false,
    panMode: false,
  },
  argTypes: {
    onToggleSidebar: { action: 'toggleSidebar' },
    onToggleBrightnessMode: { action: 'toggleBrightnessMode' },
    onToggleMeasurementMode: { action: 'toggleMeasurementMode' },
    onToggleAnnotationMode: { action: 'toggleAnnotationMode' },
    onTogglePanMode: { action: 'togglePanMode' },
    onZoomIn: { action: 'zoomIn' },
    onZoomOut: { action: 'zoomOut' },
    onBrightnessUp: { action: 'brightnessUp' },
    onBrightnessDown: { action: 'brightnessDown' },
    onFlipHorizontal: { action: 'flipHorizontal' },
    onFlipVertical: { action: 'flipVertical' },
    onResetView: { action: 'resetView' },
    onFullscreen: { action: 'fullscreen' },
  },
};
export default meta;

type Story = StoryObj<typeof ViewerToolbar>;

export const Default: Story = {};

export const AllModesActive: Story = {
  args: {
    showSidebar: true,
    brightnessMode: true,
    measurementMode: true,
    annotationMode: true,
    panMode: true,
  },
};
