// src/pages/Viewer2Page.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import layoutSchema from "../schema/pages/Viewer2Page.schema.json"; // il tuo JSON
import TopBar from "../components/TopBar";
import ViewerToolbar from "../components/ViewerToolbar";
import NewViewer, { ViewerHandles } from "../components/newViewer";
import Sidebar from "../components/Sidebar";

// mapping name→componente già esistente
const componentMap: Record<string, React.FC<any> | React.ForwardRefExoticComponent<any>> = {
  TopBar,
  ViewerToolbar,
  NewViewer,
  Sidebar,
};

interface SchemaItem {
  name: string;
  props?: Record<string, any>;
}

const Viewer2Page: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // recupera la serie dal router state (come fai in ViewerPage)
  const selectedSeries = (location.state as { series?: any })?.series ?? null;

  // se non c'è la serie, torna indietro
  useEffect(() => {
    if (!selectedSeries) navigate("/");
  }, [selectedSeries, navigate]);

  // Stati e ref identici a ViewerPage.tsx
  const [metadata, setMetadata] = useState<any>(null);
  const [showSidebar,    setShowSidebar]    = useState(true);
  const [brightnessMode, setBrightnessMode] = useState(false);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [annotationMode, setAnnotationMode]  = useState(false);
  const [panMode,        setPanMode]        = useState(false);

  const viewerRef = useRef<ViewerHandles>(null);

  // funzione per attivare una sola modalità
  const activateMode = useCallback(
    (mode: "brightness" | "measurement" | "annotation" | "pan" | null) => {
      setBrightnessMode(mode === "brightness");
      setMeasurementMode(mode === "measurement");
      setAnnotationMode(mode === "annotation");
      setPanMode(mode === "pan");
    },
    []
  );

  const resetViewer = useCallback(() => {
    activateMode(null);
    viewerRef.current?.resetView();
  }, [activateMode]);

  const enterOrExitFullscreen = () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  // prende il JSON
  const items: SchemaItem[] = (layoutSchema as any).components;

  return (
    <div className="viewer-page-container">
      {items.map((cfg, idx) => {
        const C = componentMap[cfg.name];
        if (!C) {
          console.warn(`Viewer2Page: componente “${cfg.name}” non trovato.`);
          return null;
        }

        // props statiche dal JSON
        const staticProps = cfg.props || {};

        // props dinamiche per ogni componente
        let dynamicProps: Record<string, any> = {};
        switch (cfg.name) {
          case "TopBar":
            // TopBar non richiede props aggiuntive
            dynamicProps = {};
            break;
          
          // da modificare....
          case "ViewerToolbar":
            dynamicProps = {
              showSidebar,
              brightnessMode,
              measurementMode,
              annotationMode,
              panMode,
              onToggleSidebar:        () => setShowSidebar(v => !v),
              onToggleBrightnessMode: () => activateMode(brightnessMode ? null : "brightness"),
              onToggleMeasurementMode:() => activateMode(measurementMode ? null : "measurement"),
              onToggleAnnotationMode: () => activateMode(annotationMode ? null : "annotation"),
              onTogglePanMode:        () => activateMode(panMode ? null : "pan"),
              onZoomIn:               () => viewerRef.current?.zoomIn(),
              onZoomOut:              () => viewerRef.current?.zoomOut(),
              onBrightnessUp:         () => viewerRef.current?.brightnessUp(),
              onBrightnessDown:       () => viewerRef.current?.brightnessDown(),
              onFlipHorizontal:       () => viewerRef.current?.flipHorizontal(),
              onFlipVertical:         () => viewerRef.current?.flipVertical(),
              onResetView:            resetViewer,
              onFullscreen:           enterOrExitFullscreen,
            };
            break;

          case "NewViewer":
            dynamicProps = {
              ref: viewerRef,
              series: selectedSeries,
              onMetadataExtracted: setMetadata,
              brightnessMode,
              measurementMode,
              annotationMode,
              panMode,
            };
            break;

          case "Sidebar":
            dynamicProps = {
              metadata
            };
            break;

          default:
            dynamicProps = {};
        }

        return (
          <C 
            key={idx} 
            {...staticProps} 
            {...dynamicProps} 
          />
        );
      })}
    </div>
  );
};

export default Viewer2Page;
