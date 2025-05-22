// src/components/ViewerToolbar.tsx
import React from "react";
import { useComponentVariant } from "../hooks/useComponentVariant";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
export type ButtonCfg = { id: string; icon: string; title: string };

export type ToolbarLayout = "horizontal" | "compact" | "stacked";

interface Variant {
  buttons: ButtonCfg[];
  layout: ToolbarLayout;
}

export interface ViewerToolbarProps {
  /* ----- visual state (toggles) ----- */
  showSidebar: boolean;
  brightnessMode: boolean;
  measurementMode: boolean;
  annotationMode: boolean;
  panMode: boolean;

  /* ----- callbacks for toggles ----- */
  onToggleSidebar: () => void;
  onToggleBrightnessMode: () => void;
  onToggleMeasurementMode: () => void;
  onToggleAnnotationMode: () => void;
  onTogglePanMode: () => void;

  /* ----- viewport actions ----- */
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onBrightnessUp?: () => void;
  onBrightnessDown?: () => void;
  onFlipHorizontal?: () => void;
  onFlipVertical?: () => void;
  onResetView?: () => void;
  onFullscreen?: () => void;

  /* ----- story-only customisation ----- */
  /**
   * Override **layout** or **buttons** at runtime
   * without touching JSON schemas.
   * _Purely optional – used by Storybook controls._
   */
  variantOverride?: Partial<Variant>;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  showSidebar,
  brightnessMode,
  measurementMode,
  annotationMode,
  panMode,
  onToggleSidebar,
  onToggleBrightnessMode,
  onToggleMeasurementMode,
  onToggleAnnotationMode,
  onTogglePanMode,
  onZoomIn,
  onZoomOut,
  onBrightnessUp,
  onBrightnessDown,
  onFlipHorizontal,
  onFlipVertical,
  onResetView,
  onFullscreen,
  variantOverride,
}) => {
  /* 1. JSON schema-driven variant ↓ */
  const base = useComponentVariant<Variant>("ViewerToolbar");

  /* 2. story-time overrides beat schema ↓ */
  const { buttons = [], layout } = {
    ...base,
    ...variantOverride,
    buttons:
      variantOverride?.buttons && variantOverride.buttons.length > 0
        ? variantOverride.buttons
        : base.buttons,
  };

  /* id → handler map */
  const handlers: Record<string, (() => void) | undefined> = {
    logo: onResetView,
    zoomIn: onZoomIn,
    zoomOut: onZoomOut,
    brightnessMode: onToggleBrightnessMode,
    brightnessUp: onBrightnessUp,
    brightnessDown: onBrightnessDown,
    flipHorizontal: onFlipHorizontal,
    flipVertical: onFlipVertical,
    Reset: onResetView,
    fullscreen: onFullscreen,
    measurements: onToggleMeasurementMode,
    annotations: onToggleAnnotationMode,
    pan: onTogglePanMode,
    toggleSidebar: onToggleSidebar,
  };

  const isActive = (id: string) =>
    (id === "brightnessMode" && brightnessMode) ||
    (id === "measurements" && measurementMode) ||
    (id === "annotations" && annotationMode) ||
    (id === "pan" && panMode) ||
    (id === "toggleSidebar" && showSidebar);

  /* fallback if no JSON yet */
  const fallback: ButtonCfg[] = [
    { id: "logo", title: "Reset View", icon: "/assets/esaote_e.svg" },
    { id: "zoomIn", title: "Zoom In", icon: "/assets/zoom-in-svgrepo-com.svg" },
    { id: "zoomOut", title: "Zoom Out", icon: "/assets/zoom-out-svgrepo-com.svg" },
    { id: "pan", title: "Pan", icon: "/assets/pan-svgrepo-com.svg" },
    { id: "toggleSidebar", title: "Metadata", icon: "/assets/info-svgrepo-com.svg" },
  ];

  const btns = buttons.length > 0 ? buttons : fallback;

  return (
    <div className={`viewer-toolbar-container layout-${layout ?? "horizontal"}`}>
      <ul className="toolbar-list">
        {btns.map((b) => {
          const click = handlers[b.id];
          const active = isActive(b.id);
          return (
            <li
              key={b.id}
              className={`toolbar-item ${active ? "active" : ""}`}
              title={b.title}
              onClick={click}
              style={{
                cursor: click ? "pointer" : "default",
                opacity: click ? 1 : 0.4,
              }}
            >
              <img src={b.icon} alt={b.id} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ViewerToolbar;
