// src/pages/ViewerPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import TopBar from '../components/TopBar';
import ViewerToolbar from '../components/ViewerToolbar';
import Viewer from '../components/Viewer';
import Sidebar from '../components/Sidebar';
import { RootState } from '../zustand/store/store';
import { setMetadata } from '../zustand/store/viewerSlice';

const ViewerPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedSeries = useSelector((state: RootState) => state.viewer.selectedSeries);
  const metadata = useSelector((state: RootState) => state.viewer.metadata);
  const [showSidebar, setShowSidebar] = useState(true);

  // If no series is selected, go back to the study list.
  useEffect(() => {
    if (!selectedSeries) {
      navigate('/');
    }
  }, [selectedSeries, navigate]);

  // Toggle the sidebar's visibility.
  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  // Example fallback details if metadata is not extracted yet.
  const patientId = metadata?.patientId ?? '123';
  const studyDesc = metadata?.studyDescription ?? 'CT';
  const seriesDesc = metadata?.seriesDescription ?? '507';
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
      <div
        className="viewer-main-row"
        style={{ flex: 1, maxHeight: 'none', overflow: 'visible' }}
      >
        <div className={showSidebar ? "viewer-container with-sidebar" : "viewer-container full-width"}>
          {selectedSeries && (
            <Viewer series={selectedSeries} onMetadataExtracted={(extracted) => dispatch(setMetadata(extracted))} />
          )}
        </div>
        {showSidebar && (
          // Sidebar displays DICOM metadata.
          <div className="sidebar-container">
            <Sidebar metadata={metadata} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewerPage;
