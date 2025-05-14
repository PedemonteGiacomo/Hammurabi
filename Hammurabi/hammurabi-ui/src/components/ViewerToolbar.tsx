// src/components/ViewerToolbar.tsx

import React from "react";
import { useComponentVariant } from "../hooks/useComponentVariant";

interface ViewerToolbarProps {
  showSidebar: boolean;
  onToggleSidebar: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onBrightnessUp?: () => void;
  onBrightnessDown?: () => void;
  brightnessMode: boolean;
  onToggleBrightnessMode: () => void;
}

type ButtonCfg = { id: string; icon: string; title: string };

type Variant = {
  buttons: ButtonCfg[];
  layout: "horizontal" | "compact" | "stacked";
};

const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  showSidebar,
  onToggleSidebar,
  onZoomIn,
  onZoomOut,
  onBrightnessUp,
  onBrightnessDown,
  brightnessMode,
  onToggleBrightnessMode,
}) => {
  /* schema‑driven variant */
  const { buttons = [], layout } = useComponentVariant<Variant>(
    "ViewerToolbar",
  );

  /* id -> handler mapping  */
  const handlers: Record<string, (() => void) | undefined> = {
    zoomIn: onZoomIn,
    zoomOut: onZoomOut,
    brightnessMode: onToggleBrightnessMode,
    brightnessUp: onBrightnessUp,
    brightnessDown: onBrightnessDown,
    toggleSidebar: onToggleSidebar,
  };

  /* Build button list.  If schema absent fallback to a default minimal set */
  const btns: ButtonCfg[] =
    buttons.length > 0
      ? buttons
      : [
          { id: "zoomIn", title: "Zoom In", icon: "/assets/zoom-in-svgrepo-com.svg" },
          { id: "zoomOut", title: "Zoom Out", icon: "/assets/zoom-out-svgrepo-com.svg" },
          { id: "toggleSidebar", title: "Metadata", icon: "/assets/info-svgrepo-com.svg" },
        ];

  return (
    <div className={`viewer-toolbar-container layout-${layout || "horizontal"}`}>
      <ul className="toolbar-list">
        {btns.map((b) => {
          const click = handlers[b.id];
          const isActive =
            (b.id === "brightnessMode" && brightnessMode) ||
            (b.id === "toggleSidebar" && showSidebar);
          return (
            <li
              key={b.id}
              className={`toolbar-item ${isActive ? "active" : ""}`}
              title={b.title}
              onClick={click}
              style={{ cursor: click ? "pointer" : "default" }}
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
