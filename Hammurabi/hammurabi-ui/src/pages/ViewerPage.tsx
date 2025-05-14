// src/pages/ViewerPage.tsx
import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TopBar from "../components/TopBar";
import ViewerToolbar from "../components/ViewerToolbar";
import NewViewer, { ViewerHandles } from "../components/newViewer";
import Sidebar from "../components/Sidebar";
import { SeriesInfo } from "../components/NestedDicomTable";

const ViewerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedSeries =
    (location.state as { series?: SeriesInfo })?.series ?? null;

  const [metadata, setMetadata] = useState<any | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [brightnessMode, setBrightnessMode] = useState(false);

  const viewerRef = useRef<ViewerHandles>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  /* torna indietro se non c’è serie */
  useEffect(() => {
    if (!selectedSeries) navigate("/");
  }, [selectedSeries, navigate]);

  /* -------- toolbar handlers ------------------------------------------- */
  const toggleSidebar = () => setShowSidebar((v) => !v);
  const toggleBrightnessMode = () => setBrightnessMode((v) => !v);

  const enterOrExitFullscreen = () => {
    const el = viewerContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  /* -------- valori di comodo per l’info‑row ----------------------------- */
  const patientId = metadata?.patientId ?? "—";
  const studyDesc = metadata?.studyDescription ?? "—";
  const seriesDesc = metadata?.seriesDescription ?? "—";

  return (
    <div className="viewer-page-container">
      {/* top‑bar */}
      <TopBar />

      {/* info‑row */}
      <div className="viewer-info-row">
        {[
          ["Patient ID", patientId],
          ["Study", studyDesc],
          ["Series", seriesDesc],
        ].map(([label, val]) => (
          <div key={label} className="viewer-info-block">
            <span className="info-label">{label}</span>
            <span className="info-value">{val}</span>
          </div>
        ))}
      </div>

      {/* toolbar */}
      <ViewerToolbar
        showSidebar={showSidebar}
        brightnessMode={brightnessMode}
        onToggleSidebar={toggleSidebar}
        onToggleBrightnessMode={toggleBrightnessMode}
        onZoomIn={() => viewerRef.current?.zoomIn()}
        onZoomOut={() => viewerRef.current?.zoomOut()}
        onBrightnessUp={() => viewerRef.current?.brightnessUp()}
        onBrightnessDown={() => viewerRef.current?.brightnessDown()}
        onFlipHorizontal={() => viewerRef.current?.flipHorizontal()}
        onFlipVertical={() => viewerRef.current?.flipVertical()}
        onResetView={() => viewerRef.current?.resetView()}
        onFullscreen={enterOrExitFullscreen}
      />

      {/* main area */}
      <div className="viewer-main-row">
        <div
          ref={viewerContainerRef}
          className={
            showSidebar ? "viewer-container with-sidebar" : "viewer-container full-width"
          }
        >
          {selectedSeries && (
            <NewViewer
              ref={viewerRef}
              series={selectedSeries}
              onMetadataExtracted={setMetadata}
              brightnessMode={brightnessMode}
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
