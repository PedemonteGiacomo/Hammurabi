// src/pages/SelectionPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NestedDicomTable, { SeriesInfo } from '../components/NestedDicomTable';
import InputsPanel from '../components/InputsPanel';
import TopBar from '../components/TopBar';

const SelectionPage: React.FC = () => {
  const [selectedSeries, setSelectedSeries] = useState<SeriesInfo | null>(null);
  const navigate = useNavigate();

  // Callback from the table when the user selects a series
  const handleSelectSeries = (series: SeriesInfo) => {
    setSelectedSeries(series);
  };

  // Navigate to the viewer page with the selected series info passed as state
  const openViewer = () => {
    if (selectedSeries) {
      navigate('/viewer', { state: { series: selectedSeries } });
    }
  };

  return (
    <div style={{ backgroundColor: '#0d1117', color: 'white', minHeight: '100vh' }}>
      <TopBar />
      <div style={{ padding: '1rem' }}>
        <InputsPanel />
        <NestedDicomTable onSelectSeries={handleSelectSeries} />
        {selectedSeries && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button className="btn btn-primary" onClick={openViewer}>
              Open Viewer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectionPage;
