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

  // Example metadata or fallback
  const patientId = extractedMetadata?.patientId ?? '123';
  const studyDesc = extractedMetadata?.studyDescription ?? 'CT';
  const seriesDesc = extractedMetadata?.seriesDescription ?? '507';
  const instanceNumber = '41'; // or from your code

  return (
    <div className="viewer-page-container">
      {/* Red top bar */}
      <TopBar />

      {/* "Black row" for Patient / Study / Series / Instance */}
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

      {/* Red icon toolbar row */}
      <ViewerToolbar />

      {/* 
        The main viewer row, with a limited or fixed height.
        'limited-height' is a CSS class that will restrict this row's height.
      */}
      <div className="viewer-main-row limited-height">
        <Viewer series={state.series} onMetadataExtracted={setExtractedMetadata} />
        <Sidebar metadata={extractedMetadata} />
      </div>
    </div>
  );
};

export default ViewerPage;
