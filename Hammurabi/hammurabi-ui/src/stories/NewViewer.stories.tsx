import type { Meta, StoryObj } from "@storybook/react";
import NewViewer, { ViewerProps } from "../components/newViewer";
import type { SeriesInfo } from "../components/NestedDicomTable";

const series50: SeriesInfo = {
  seriesUID: "1.2.840.loop.50",
  seriesDescription: "Dummy 50-frame series",
  numberOfImages: 50,
  imageFilePaths: Array.from({ length: 50 }, (_, i) =>
    `/assets/esaote_magnifico/ForMIP/1_3_76_2_1_1_4_1_3_9044_778600979_${i + 1}.dcm`,
  ),
};

const meta: Meta<ViewerProps> = {
  title: "Components/NewViewer",
  component: NewViewer,
  decorators: [
    (Story) => (
      <div style={{ width: "100%", height: 500, background: "#000" }}>
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "fullscreen" },
  argTypes: {
    /* modes */
    brightnessMode: { control: "boolean" },
    measurementMode: { control: "boolean" },
    annotationMode: { control: "boolean" },
    panMode: { control: "boolean" },

    /* ui flags */
    showSlider: { control: "boolean" },
    showFpsInput: { control: "boolean" },
    showLoopBtn: { control: "boolean" },
    overlayCircles: { control: "boolean" },

    /* initial values */
    initialFrame: { control: { type: "number", min: 0, step: 1 } },
    initialZoomStep: { control: { type: "number", min: 0, max: 10, step: 1 } },
    initialBrightness: { control: { type: "range", min: 0, max: 100 } },
    initialContrast: { control: { type: "range", min: 0, max: 100 } },
    fps: { control: { type: "number", min: 1, step: 1 } },
    loop: { control: "boolean" },
    flipHorizontal: { control: "boolean" },
    flipVertical: { control: "boolean" },

    /* hide series & callback from controls panel */
    series: { table: { disable: true } },
    onMetadataExtracted: { table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<ViewerProps>;

export const Basic: Story = {
  args: {
    series: series50,
    showSlider: true,
    showLoopBtn: true,
    showFpsInput: true,
    overlayCircles: true,
    fps: 20,
    loop: false,
  },
};

export const Brightness: Story = {
  args: {
    series: series50,
    brightnessMode: true,
    measurementMode: false,
    overlayCircles: false,
  },
};

export const Measurements: Story = {
  args: {
    series: series50,
    brightnessMode: false,
    measurementMode: true,
    overlayCircles: false,
  },
};

export const Pan: Story = {
  args: {
    series: series50,
    panMode: true,
    initialZoomStep: 2
  },
};
