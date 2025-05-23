// ──────────────────────────────────────────────────────────────
// src/stories/ViewerPlayground.stories.tsx
// ──────────────────────────────────────────────────────────────
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  Fragment,
} from "react";
import type { Meta, StoryFn } from "@storybook/react";

import ViewerToolbar from "../components/ViewerToolbar";
import NewViewer, { ViewerHandles } from "../components/newViewer";
import Sidebar from "../components/Sidebar";
import type { SeriesInfo } from "../components/NestedDicomTable";
import { useDeviceVariant } from "../hooks/useDeviceVariant";

/* -------------------------------------------------------------------------- */
/*  Dummy series (50 frame)                                                   */
/* -------------------------------------------------------------------------- */
const series50: SeriesInfo = {
  seriesUID: "1.2.840.loop.50",
  seriesDescription: "Dummy 50-frame series",
  numberOfImages: 50,
  imageFilePaths: Array.from({ length: 50 }, (_, i) =>
    `/assets/esaote_magnifico/ForMIP/1_3_76_2_1_1_4_1_3_9044_778600979_${i + 1}.dcm`,
  ),
};

/* -------------------------------------------------------------------------- */
/*  Story args ⇢  controlli interattivi                                        */
/* -------------------------------------------------------------------------- */
type Args = {
  showSidebar: boolean;
  brightnessMode: boolean;
  measurementMode: boolean;
  annotationMode: boolean;
  panMode: boolean;
};

/* -------------------------------------------------------------------------- */
/*  Template                                                                  */
/* -------------------------------------------------------------------------- */
const Template: StoryFn<Args> = ({
  showSidebar: showSidebarArg,
  brightnessMode: brightnessArg,
  measurementMode: measureArg,
  annotationMode: annotArg,
  panMode: panArg,
}) => {
  /* ------------------------------------------------------------------ */
  /*  ❶ state synchronised with Storybook controls                       */
  /* ------------------------------------------------------------------ */
  const [showSidebar, setShowSidebar]       = useState(showSidebarArg);
  const [brightnessMode, setBrightness]     = useState(brightnessArg);
  const [measurementMode, setMeasurement]   = useState(measureArg);
  const [annotationMode, setAnnotation]     = useState(annotArg);
  const [panMode, setPan]                   = useState(panArg);
  const [metadata, setMetadata]             = useState<Record<string, any>|null>(null);

  useEffect(() => setShowSidebar(showSidebarArg), [showSidebarArg]);
  useEffect(() => setBrightness(brightnessArg),  [brightnessArg]);
  useEffect(() => setMeasurement(measureArg),    [measureArg]);
  useEffect(() => setAnnotation(annotArg),       [annotArg]);
  useEffect(() => setPan(panArg),                [panArg]);

  /* ------------------------------------------------------------------ */
  /*  ❷ helpers                                                          */
  /* ------------------------------------------------------------------ */
  const activateMode = useCallback(
    (mode: "brightness" | "measurement" | "annotation" | "pan" | null) => {
      setBrightness(mode === "brightness");
      setMeasurement(mode === "measurement");
      setAnnotation(mode === "annotation");
      setPan(mode === "pan");
    },
    [],
  );

  const viewerRef          = useRef<ViewerHandles>(null);
  const viewerWrapperRef   = useRef<HTMLDivElement>(null);

  const resetViewer = useCallback(() => {
    activateMode(null);
    viewerRef.current?.resetView();
  }, [activateMode]);

  const toggleFullscreen = () => {
    const el = viewerWrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  /* ------------------------------------------------------------------ */
  /*  ❸ responsive layout (same rule used in real page)                 */
  /* ------------------------------------------------------------------ */
  const device = useDeviceVariant();            // "mobile" | "tablet" | "desktop"
  const columnLayout = device !== "desktop";    // stack on mobile / tablet

  /* ------------------------------------------------------------------ */
  /*  ❹ render                                                           */
  /* ------------------------------------------------------------------ */
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0d1117",
      }}
    >
      {/* ── Toolbar (identica a ViewerPage) ────────────────────────── */}
      <ViewerToolbar
        showSidebar={showSidebar}
        brightnessMode={brightnessMode}
        measurementMode={measurementMode}
        annotationMode={annotationMode}
        panMode={panMode}
        /* toggles */
        onToggleSidebar={() => setShowSidebar((v) => !v)}
        onToggleBrightnessMode={() =>
          activateMode(brightnessMode ? null : "brightness")
        }
        onToggleMeasurementMode={() =>
          activateMode(measurementMode ? null : "measurement")
        }
        onToggleAnnotationMode={() =>
          activateMode(annotationMode ? null : "annotation")
        }
        onTogglePanMode={() => activateMode(panMode ? null : "pan")}
        /* viewport actions */
        onZoomIn={() => viewerRef.current?.zoomIn()}
        onZoomOut={() => viewerRef.current?.zoomOut()}
        onBrightnessUp={() => viewerRef.current?.brightnessUp()}
        onBrightnessDown={() => viewerRef.current?.brightnessDown()}
        onFlipHorizontal={() => viewerRef.current?.flipHorizontal()}
        onFlipVertical={() => viewerRef.current?.flipVertical()}
        onResetView={resetViewer}
        onFullscreen={toggleFullscreen}
      />

      {/* ── Main area: viewer + sidebar ───────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: columnLayout ? "column" : "row",
          overflow: "hidden",
          gap: "1rem",
          padding: "1rem",
        }}
      >
        {/* — VIEWER — */}
        <div
          ref={viewerWrapperRef}
          style={{
            flex: columnLayout ? "none" : showSidebar ? 2 : 1,
            height: columnLayout ? "50vh" : "100%",
            background: "#000",
            border: "2px solid #c2181e",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <NewViewer
            ref={viewerRef}
            series={series50}
            onMetadataExtracted={setMetadata}
            brightnessMode={brightnessMode}
            measurementMode={measurementMode}
            annotationMode={annotationMode}
            panMode={panMode}
          />
        </div>

        {/* — SIDEBAR —  (below viewer on mobile/tablet, right on desktop) */}
        {showSidebar && (
          <div
            style={{
              flex: 1,
              maxHeight: columnLayout ? "50vh" : "100%",
              overflowY: "auto",
              border: "2px solid #c2181e",
              borderRadius: 4,
            }}
          >
            <Sidebar metadata={metadata} height="100%" width="100%"/>
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Storybook metadata                                                         */
/* -------------------------------------------------------------------------- */
export default {
  title: "Playground/Viewer Playground",
  component: Fragment,                         // dummy
  parameters: { layout: "fullscreen" },
  argTypes: {
    showSidebar:      { control: "boolean" },
    brightnessMode:   { control: "boolean" },
    measurementMode:  { control: "boolean" },
    annotationMode:   { control: "boolean" },
    panMode:          { control: "boolean" },
  },
} as Meta<Args>;

export const Playground = Template.bind({});
Playground.args = {
  showSidebar:     true,
  brightnessMode:  false,
  measurementMode: false,
  annotationMode:  false,
  panMode:         false,
};
