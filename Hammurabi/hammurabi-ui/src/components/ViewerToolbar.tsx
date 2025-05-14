// src/components/ViewerToolbar.tsx
import React from "react";
import { useComponentVariant } from "../hooks/useComponentVariant";

interface ViewerToolbarProps {
  /* state */
  showSidebar: boolean;
  brightnessMode: boolean;
  measurementMode: boolean;

  /* toggles */
  onToggleSidebar: () => void;
  onToggleBrightnessMode: () => void;
  onToggleMeasurementMode: () => void;

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

type Variant = {
  buttons: ButtonCfg[];
  layout: "horizontal" | "compact" | "stacked";
};

const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  showSidebar,
  brightnessMode,
  measurementMode,
  onToggleSidebar,
  onToggleBrightnessMode,
  onToggleMeasurementMode,
  onZoomIn,
  onZoomOut,
  onBrightnessUp,
  onBrightnessDown,
  onFlipHorizontal,
  onFlipVertical,
  onResetView,
  onFullscreen,
}) => {
  const { buttons = [], layout } =
    useComponentVariant<Variant>("ViewerToolbar");

  const handlers: Record<string, (() => void) | undefined> = {
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
    toggleSidebar: onToggleSidebar,
  };

  const isActive = (id: string): boolean =>
    (id === "brightnessMode" && brightnessMode) ||
    (id === "toggleSidebar" && showSidebar) ||
    (id === "measurements" && measurementMode);

  const btns: ButtonCfg[] =
    buttons.length > 0
      ? buttons
      : [
          { id: "zoomIn", title: "Zoom In", icon: "/assets/zoom-in-svgrepo-com.svg" },
          { id: "zoomOut", title: "Zoom Out", icon: "/assets/zoom-out-svgrepo-com.svg" },
          { id: "measurements", title: "Measure", icon: "/assets/measure-svgrepo-com.svg" },
          { id: "toggleSidebar", title: "Metadata", icon: "/assets/info-svgrepo-com.svg" },
        ];

  return (
    <div
      className={`viewer-toolbar-container layout-${layout || "horizontal"}`}
    >
      <ul className="toolbar-list">
        {btns.map((b) => {
          const click = handlers[b.id];
          return (
            <li
              key={b.id}
              className={`toolbar-item ${isActive(b.id) ? "active" : ""}`}
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
