import React from "react";
import { useComponentVariant } from "../hooks/useComponentVariant";

interface ViewerToolbarProps {
  /* state */
  showSidebar: boolean;
  brightnessMode: boolean;
  measurementMode: boolean;
  annotationMode: boolean;
  panMode: boolean;

  /* toggles */
  onToggleSidebar: () => void;
  onToggleBrightnessMode: () => void;
  onToggleMeasurementMode: () => void;
  onToggleAnnotationMode: () => void;
  onTogglePanMode: () => void;

  /* viewport actions */
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onBrightnessUp?: () => void;
  onBrightnessDown?: () => void;
  onFlipHorizontal?: () => void;
  onFlipVertical?: () => void;
  onResetView?: () => void;
  onFullscreen?: () => void;
}

type ButtonCfg = { id: string; icon: string; title: string };
type Variant = { buttons: ButtonCfg[]; layout: "horizontal" | "compact" | "stacked" };

const ViewerToolbar: React.FC<ViewerToolbarProps> = (props) => {
  const {
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
  } = props;

  const { buttons = [], layout } = useComponentVariant<Variant>("ViewerToolbar");

  /* id → handler */
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

  const isActive = (id: string): boolean =>
    (id === "brightnessMode" && brightnessMode) ||
    (id === "measurements" && measurementMode) ||
    (id === "annotations" && annotationMode) ||
    (id === "pan" && panMode) ||
    (id === "toggleSidebar" && showSidebar);

  /* fallback minimale */
  const btns: ButtonCfg[] =
    buttons.length > 0
      ? buttons
      : [
        { id: "logo", title: "Reset View", icon: "/assets/esaote_e.svg" },
        { id: "zoomIn", title: "Zoom In", icon: "/assets/zoom-in-svgrepo-com.svg" },
        { id: "zoomOut", title: "Zoom Out", icon: "/assets/zoom-out-svgrepo-com.svg" },
        { id: "pan", title: "Pan", icon: "/assets/pan-svgrepo-com.svg" },
        { id: "toggleSidebar", title: "Metadata", icon: "/assets/info-svgrepo-com.svg" },
      ];

  return (
    <div className={`viewer-toolbar-container layout-${layout || "horizontal"}`}>
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
              style={{ cursor: click ? "pointer" : "default", opacity: click ? 1 : .4 }}
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
