// src/pages/ViewerPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ViewerToolbar from '../components/ViewerToolbar';
import Viewer, { SeriesInfo } from '../components/Viewer';
import Sidebar from '../components/Sidebar';

interface LocationState {
  series: SeriesInfo;
}

const ViewerPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [extractedMetadata, setExtractedMetadata] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const state = location.state as LocationState | undefined;

  // If no series is provided, go back to the study list.
  useEffect(() => {
    if (!state?.series) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state?.series) {
    return null;
  }

  // Toggle the sidebar's visibility.
  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  // Example metadata fallback values
  const patientId = extractedMetadata?.patientId ?? '123';
  const studyDesc = extractedMetadata?.studyDescription ?? 'CT';
  const seriesDesc = extractedMetadata?.seriesDescription ?? '507';
  const instanceNumber = '41';

  return (
    <div className="viewer-page-container">
      {/* Top bar */}
      <TopBar />

      {/* Info row displaying patient/study/series/instance details */}
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

      {/* Toolbar with clickable icons including the info icon */}
      <ViewerToolbar onToggleSidebar={toggleSidebar} showSidebar={showSidebar} />

      {/* Main viewer row */}
      <div className="viewer-main-row limited-height">
        {/* Adjust viewer container width based on sidebar presence */}
        <div className={showSidebar ? "viewer-container with-sidebar" : "viewer-container full-width"}>
          <Viewer series={state.series} onMetadataExtracted={setExtractedMetadata} />
        </div>
        {showSidebar && (
          <div className="sidebar-container">
            <Sidebar metadata={extractedMetadata} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewerPage;
