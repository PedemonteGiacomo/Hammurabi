import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TopBar from "../components/TopBar";
import ViewerToolbar from "../components/ViewerToolbar";
import NewViewer, { ViewerHandles } from "../components/newViewer";
import Sidebar from "../components/Sidebar";
import { SeriesInfo } from "../components/NestedDicomTable";

const ViewerPage: React.FC = () => {
  const navigate        = useNavigate();
  const location        = useLocation();
  const selectedSeries  =
    (location.state as { series?: SeriesInfo })?.series ?? null;

  /* ---------- state ---------- */
  const [metadata,        setMetadata]        = useState<any | null>(null);
  const [showSidebar,     setShowSidebar]     = useState(true);
  const [brightnessMode,  setBrightnessMode]  = useState(false);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [annotationMode,  setAnnotationMode]  = useState(false);
  const [panMode,         setPanMode]         = useState(false);

  const viewerRef          = useRef<ViewerHandles>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  /* redirect se manca la serie */
  useEffect(() => { if (!selectedSeries) navigate("/"); }, [selectedSeries, navigate]);

  /* -------- toggles -------- */
  const toggleSidebar        = () => setShowSidebar(v => !v);
  const toggleBrightnessMode = () => setBrightnessMode(v => !v);
  const toggleMeasurementMode= () => { setMeasurementMode(v => !v); setPanMode(false); };
  const toggleAnnotationMode = () => { setAnnotationMode(v => !v);  setPanMode(false); };
  const togglePanMode        = () => {
    setPanMode(v => !v);
    setMeasurementMode(false);
    setAnnotationMode(false);
  };

  /* -------- reset -------- */
  const resetViewer = useCallback(() => {
    setBrightnessMode(false);
    setMeasurementMode(false);
    setAnnotationMode(false);
    setPanMode(false);
    viewerRef.current?.resetView();
  }, []);

  /* ---- fullscreen ---- */
  const enterOrExitFullscreen = () => {
    const el = viewerContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(()=>{});
    else document.exitFullscreen?.().catch(()=>{});
  };

  const infos: [string,string][] = [
    ["Patient ID", metadata?.patientId ?? "—"],
    ["Study",      metadata?.studyDescription ?? "—"],
    ["Series",     metadata?.seriesDescription ?? "—"],
  ];

  return (
    <div className="viewer-page-container">
      <TopBar />
      <div className="viewer-info-row">
        {infos.map(([l,v])=>(
          <div key={l} className="viewer-info-block">
            <span className="info-label">{l}</span>
            <span className="info-value">{v}</span>
          </div>
        ))}
      </div>

      <ViewerToolbar
        /* state */
        showSidebar={showSidebar}
        brightnessMode={brightnessMode}
        measurementMode={measurementMode}
        annotationMode={annotationMode}
        panMode={panMode}
        /* toggles */
        onToggleSidebar={toggleSidebar}
        onToggleBrightnessMode={toggleBrightnessMode}
        onToggleMeasurementMode={toggleMeasurementMode}
        onToggleAnnotationMode={toggleAnnotationMode}
        onTogglePanMode={togglePanMode}
        /* viewport actions */
        onZoomIn={() => viewerRef.current?.zoomIn()}
        onZoomOut={() => viewerRef.current?.zoomOut()}
        onBrightnessUp={() => viewerRef.current?.brightnessUp()}
        onBrightnessDown={() => viewerRef.current?.brightnessDown()}
        onFlipHorizontal={() => viewerRef.current?.flipHorizontal()}
        onFlipVertical={() => viewerRef.current?.flipVertical()}
        onResetView={resetViewer}
        onFullscreen={enterOrExitFullscreen}
      />

      <div className="viewer-main-row">
        <div
          ref={viewerContainerRef}
          className={showSidebar ? "viewer-container with-sidebar"
                                 : "viewer-container full-width"}
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
