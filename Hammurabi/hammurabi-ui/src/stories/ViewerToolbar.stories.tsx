// src/stories/ViewerToolbar.stories.tsx
import type { Meta, StoryFn, StoryObj } from "@storybook/react";
import ViewerToolbar, {
  ButtonCfg,
  ToolbarLayout,
} from "../components/ViewerToolbar";
import schema from "../schema/components/ViewerToolbar.schema.json";

/* ------------------------------------------------------------------ */
/*  Common desktop buttons (fallback)                                 */
/* ------------------------------------------------------------------ */
const DESKTOP_BUTTONS: ButtonCfg[] = [
  { id: "logo", icon: "/assets/esaote_e.svg", title: "Esaote" },
  { id: "zoomIn", icon: "/assets/zoom-in-svgrepo-com.svg", title: "Zoom In" },
  { id: "zoomOut", icon: "/assets/zoom-out-svgrepo-com.svg", title: "Zoom Out" },
  { id: "brightnessMode", icon: "/assets/brightness-mode.svg", title: "Brightness" },
  { id: "brightnessUp", icon: "/assets/brightness-up.svg", title: "Brighter" },
  { id: "brightnessDown", icon: "/assets/brightness-down.svg", title: "Darker" },
  { id: "measurements", icon: "/assets/measure-svgrepo-com.svg", title: "Measurements" },
  { id: "flipHorizontal", icon: "/assets/flip-horizontal-svgrepo-com.svg", title: "Flip H" },
  { id: "flipVertical", icon: "/assets/flip-vertical-svgrepo-com.svg", title: "Flip V" },
  { id: "pan", icon: "/assets/pan-svgrepo-com.svg", title: "Pan" },
  { id: "fullscreen", icon: "/assets/fullscreen-svgrepo-com.svg", title: "Fullscreen" },
  { id: "Reset", icon: "/assets/reset-view-svgrepo-com.svg", title: "Reset" },
  { id: "toggleSidebar", icon: "/assets/info-svgrepo-com.svg", title: "Metadata" },
];

/* ------------------------------------------------------------------ */
/*  Args & Meta                                                       */
/* ------------------------------------------------------------------ */
interface Args {
  /* live toggles */
  showSidebar: boolean;
  brightnessMode: boolean;
  measurementMode: boolean;
  annotationMode: boolean;
  panMode: boolean;

  /* visual overrides (only for “Playground”) */
  layout: ToolbarLayout;
  buttons: ButtonCfg[];

  /* schema-variant selector (for “SchemaVariant”) */
  schemaVariant?: "desktop" | "tablet" | "mobile";

  /* action callbacks (logged) */
  onZoomIn: () => void;
  onZoomOut: () => void;
  onBrightnessUp: () => void;
  onBrightnessDown: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onResetView: () => void;
  onFullscreen: () => void;
  onToggleSidebar: () => void;
  onToggleBrightnessMode: () => void;
  onToggleMeasurementMode: () => void;
  onToggleAnnotationMode: () => void;
  onTogglePanMode: () => void;
}

const meta: Meta<Args> = {
  title: "Components/ViewerToolbar",
  component: ViewerToolbar,
  parameters: { layout: "centered" },
  argTypes: {
    /* live state */
    showSidebar: { control: "boolean" },
    brightnessMode: { control: "boolean" },
    measurementMode: { control: "boolean" },
    annotationMode: { control: "boolean" },
    panMode: { control: "boolean" },

    /* manual layout/buttons (Playground only) */
    schemaVariant: {
      control: "radio",
      options: ["desktop", "tablet", "mobile"],
      table: { category: "Schema variant" },
    },
    buttons: {
      control: "object",
      table: { category: "Variant override" },
    },    

    /* callbacks → log */
    onToggleSidebar: { action: "toggleSidebar" },
    onToggleBrightnessMode: { action: "toggleBrightnessMode" },
    onToggleMeasurementMode: { action: "toggleMeasurementMode" },
    onToggleAnnotationMode: { action: "toggleAnnotationMode" },
    onTogglePanMode: { action: "togglePanMode" },
    onZoomIn: { action: "zoomIn" },
    onZoomOut: { action: "zoomOut" },
    onBrightnessUp: { action: "brightnessUp" },
    onBrightnessDown: { action: "brightnessDown" },
    onFlipHorizontal: { action: "flipHorizontal" },
    onFlipVertical: { action: "flipVertical" },
    onResetView: { action: "resetView" },
    onFullscreen: { action: "fullscreen" },
  },
};
export default meta;

/* ------------------------------------------------------------------ */
/*  Generic template                                                  */
/* ------------------------------------------------------------------ */
const BaseTemplate: StoryFn<Args> = ({
  showSidebar,
  brightnessMode,
  measurementMode,
  annotationMode,
  panMode,
  layout,
  buttons,
  ...actions
}) => (
  <ViewerToolbar
    showSidebar={showSidebar}
    brightnessMode={brightnessMode}
    measurementMode={measurementMode}
    annotationMode={annotationMode}
    panMode={panMode}
    variantOverride={{ layout, buttons }}
    {...actions}
  />
);

/* ------------------------------------------------------------------ */
/*  Story 1 – Manual playground                                       */
/* ------------------------------------------------------------------ */
// export const Playground: StoryObj<Args> = BaseTemplate.bind({});
// Playground.args = {
//   showSidebar: true,
//   brightnessMode: false,
//   measurementMode: false,
//   annotationMode: false,
//   panMode: false,
//   layout: "horizontal",
//   buttons: DESKTOP_BUTTONS,
// };

/* ------------------------------------------------------------------ */
/*  Story 2 – Switch schema variants                                  */
/* ------------------------------------------------------------------ */
const SchemaTemplate: StoryFn<Args> = (args, context) => {
  const { schemaVariant = "desktop", ...rest } = args;
  const variant = (schema as any).variants[schemaVariant] ?? {};
  const { layout = "horizontal", buttons = DESKTOP_BUTTONS } = variant;
  return BaseTemplate({
    ...rest,
    layout: layout as ToolbarLayout,
    buttons: buttons as ButtonCfg[],
  }, context);
};

export const SchemaVariant: StoryObj<Args> = SchemaTemplate.bind({});
SchemaVariant.args = {
  schemaVariant: "desktop",
};
