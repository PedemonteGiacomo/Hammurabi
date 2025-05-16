// src/pages/ViewerPage.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TopBar from "../components/TopBar";
import ViewerToolbar from "../components/ViewerToolbar";
import NewViewer, { ViewerHandles } from "../components/newViewer";
import Sidebar from "../components/Sidebar";
import { SeriesInfo } from "../components/NestedDicomTable";
import { useDeviceVariant } from "../hooks/useDeviceVariant";

const ViewerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedSeries =
    (location.state as { series?: SeriesInfo })?.series ?? null;

  /* ---------- state ---------- */
  const [metadata, setMetadata] = useState<any | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [brightnessMode, setBrightnessMode] = useState(false);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [panMode, setPanMode] = useState(false);

  const viewerRef = useRef<ViewerHandles>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  /* redirect se manca la serie */
  useEffect(() => {
    if (!selectedSeries) navigate("/");
  }, [selectedSeries, navigate]);

  /* device variant */
  const device = useDeviceVariant(); // "mobile" | "tablet" | "desktop"

  /* -------- centralizza i toggles per un solo tool attivo -------- */
  const activateMode = useCallback(
    (
      mode: "brightness" | "measurement" | "annotation" | "pan" | null
    ) => {
      setBrightnessMode(mode === "brightness");
      setMeasurementMode(mode === "measurement");
      setAnnotationMode(mode === "annotation");
      setPanMode(mode === "pan");
    },
    []
  );

  /* -------- reset -------- */
  const resetViewer = useCallback(() => {
    activateMode(null);
    viewerRef.current?.resetView();
  }, [activateMode]);

  /* ---- fullscreen ---- */
  const enterOrExitFullscreen = () => {
    const el = viewerContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  };

  const infos: [string, string][] = [
    ["Patient ID", metadata?.patientId ?? "—"],
    ["Study", metadata?.studyDescription ?? "—"],
    ["Series", metadata?.seriesDescription ?? "—"],
  ];

  return (
    <div className="viewer-page-container">
      <TopBar />

      {/* info sopra il viewer */}
      <div className="viewer-info-row">
        {infos.map(([label, value]) => (
          <div key={label} className="viewer-info-block">
            <span className="info-label">{label}</span>
            <span className="info-value">{value}</span>
          </div>
        ))}
      </div>

      <ViewerToolbar
        /* stato */
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
        /* azioni viewport */
        onZoomIn={() => viewerRef.current?.zoomIn()}
        onZoomOut={() => viewerRef.current?.zoomOut()}
        onBrightnessUp={() => viewerRef.current?.brightnessUp()}
        onBrightnessDown={() => viewerRef.current?.brightnessDown()}
        onFlipHorizontal={() => viewerRef.current?.flipHorizontal()}
        onFlipVertical={() => viewerRef.current?.flipVertical()}
        onResetView={resetViewer}
        onFullscreen={enterOrExitFullscreen}
      />

      {/* main: viewer + sidebar */}
      <div
        className="viewer-main-row"
        style={{
          flexDirection: device === "desktop" ? "row" : "column",
        }}
      >
        <div
          ref={viewerContainerRef}
          className={
            showSidebar
              ? "viewer-container with-sidebar"
              : "viewer-container full-width"
          }
        >
          {selectedSeries && (
            <NewViewer
              ref={viewerRef}
              series={selectedSeries}
              onMetadataExtracted={setMetadata}
              brightnessMode={brightnessMode}
              measurementMode={measurementMode}
              annotationMode={annotationMode}
              panMode={panMode}
            />
          )}
        </div>

        {showSidebar && (
          <div className="sidebar-container">
            <Sidebar metadata={metadata} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewerPage;
