// src/pages/ViewerPage.tsx

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ViewerToolbar from '../components/ViewerToolbar';
import NewViewer, { ViewerHandles } from '../components/newViewer';
import Sidebar from '../components/Sidebar';
import { SeriesInfo } from '../components/NestedDicomTable';

const ViewerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // serie passata da SelectionPage (potrebbe essere undefined)
  const selectedSeries = (location.state as { series?: SeriesInfo })?.series ?? null;

  const [metadata, setMetadata] = useState<any | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // NEW: brightness‐mode toggle
  const [brightnessMode, setBrightnessMode] = useState(false);

  // ref per controllare zoom/brightness via NewViewer
  const viewerRef = useRef<ViewerHandles>(null);

  // Se non c'è nessuna serie selezionata, torniamo alla lista
  useEffect(() => {
    if (!selectedSeries) {
      navigate('/');
    }
  }, [selectedSeries, navigate]);

  const toggleSidebar = () => setShowSidebar(v => !v);
  const toggleBrightnessMode = () => setBrightnessMode(v => !v);

  // fallback per i dati info
  const patientId      = metadata?.patientId        ?? '—';
  const studyDesc      = metadata?.studyDescription ?? '—';
  const seriesDesc     = metadata?.seriesDescription ?? '—';
  const instanceNumber = '—';

  return (
    <div className="viewer-page-container">
      {/* Top bar */}
      <TopBar />

      {/* Info row */}
      <div className="viewer-info-row">
        <div className="viewer-info-block">
          <span className="info-label">Patient ID</span>
          <span className="info-value">{patientId}</span>
        </div>
        <div className="viewer-info-block">
          <span className="info-label">Study</span>
          <span className="info-value">{studyDesc}</span>
        </div>
        <div className="viewer-info-block">
          <span className="info-label">Series</span>
          <span className="info-value">{seriesDesc}</span>
        </div>
        <div className="viewer-info-block">
          <span className="info-label">Instance</span>
          <span className="info-value">{instanceNumber}</span>
        </div>
      </div>

      {/* Toolbar con zoom & luminosità */}
      <ViewerToolbar
        showSidebar={showSidebar}
        onToggleSidebar={toggleSidebar}
        onZoomIn={() => viewerRef.current?.zoomIn()}
        onZoomOut={() => viewerRef.current?.zoomOut()}
        onBrightnessUp={() => viewerRef.current?.brightnessUp()}
        onBrightnessDown={() => viewerRef.current?.brightnessDown()}
        brightnessMode={brightnessMode}
        onToggleBrightnessMode={toggleBrightnessMode}
      />

      {/* Main viewer row */}
      <div className="viewer-main-row">
        <div className={showSidebar ? "viewer-container with-sidebar" : "viewer-container full-width"}>
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
