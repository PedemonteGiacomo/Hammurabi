// src/pages/ViewerPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Viewer, { SeriesInfo } from '../components/Viewer';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import ViewerToolbar from '../components/ViewerToolbar';

interface LocationState {
  series: SeriesInfo;
}

const ViewerPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | undefined;
  const [extractedMetadata, setExtractedMetadata] = useState<any>(null);

  // Redirect to the selection page if no series is provided.
  useEffect(() => {
    if (!state || !state.series) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state || !state.series) {
    return null; // or a loading spinner
  }

  return (
    <div style={{ backgroundColor: '#0d1117', color: 'white', minHeight: '100vh' }}>
      <TopBar />
      <ViewerToolbar />
      <div style={{ display: 'flex', flexDirection: 'row', padding: '1rem' }}>
        <Viewer series={state.series} onMetadataExtracted={setExtractedMetadata} />
        <Sidebar metadata={extractedMetadata} />
      </div>
    </div>
  );
};

export default ViewerPage;
