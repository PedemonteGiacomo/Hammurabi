import React, { useRef } from "react";   
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

/* ────────────────────────────────────────────────────────────── */
/*  FULLSCREEN MODE                                              */
/* ────────────────────────────────────────────────────────────── */
export const Fullscreen: Story = {
  name: 'Fullscreen demo',
  render: (args) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    const openFullscreen = () => {
      const el = wrapperRef.current;
      if (!el) return;

      const req =
        el.requestFullscreen ||
        // Safari
        (el as any).webkitRequestFullscreen ||
        // Firefox
        (el as any).mozRequestFullScreen ||
        // IE / Edge
        (el as any).msRequestFullscreen;

      req?.call(el);
    };

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          height: '100%',
        }}
      >
        <button
          onClick={openFullscreen}
          style={{
            padding: '14px 28px',
            fontSize: '1.05rem',
            fontWeight: 600,
            color: '#fff',
            background: 'linear-gradient(135deg,#0062ff 0%,#00c8ff 100%)',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
            transition: 'transform 0.15s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          🖥️  Open the Viewer in fullscreen mode
        </button>

        <div
          ref={wrapperRef}
          style={{
            width: '100%',
            height: 'calc(100% - 72px)', // spazio per il bottone
            background: '#000',
          }}
        >
          <NewViewer {...args} />
        </div>
      </div>
    );
  },
  args: {
    series: series50,
    showSlider: true,
    showLoopBtn: true,
    fps: 20,
    loop: false,
  },
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

