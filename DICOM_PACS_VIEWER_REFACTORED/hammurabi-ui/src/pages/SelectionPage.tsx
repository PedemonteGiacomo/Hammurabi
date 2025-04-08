// src/pages/SelectionPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import InputsPanel from '../components/InputsPanel';
import NestedDicomTable, { SeriesInfo } from '../components/NestedDicomTable';

const SelectionPage: React.FC = () => {
  const [selectedSeries, setSelectedSeries] = useState<SeriesInfo | null>(null);
  const navigate = useNavigate();

  // Callback from the NestedDicomTable, triggered when user clicks "View"
  const handleSelectSeries = (series: SeriesInfo) => {
    setSelectedSeries(series);
  };

  // Navigate to the viewer page with the selected series
  const openViewer = () => {
    if (selectedSeries) {
      navigate('/viewer', { state: { series: selectedSeries } });
    }
  };

  return (
    <div className="selection-page-container">
      <TopBar />

      <div className="study-list-wrapper">
        {/* 
          If you want the search input fields at the top (like "Patient ID," etc.), 
          uncomment the InputsPanel line below:
        */}
        {/* <InputsPanel /> */}

        <div className="study-list-header">
          <h2>Study List</h2>
        </div>

        {/* The nested table itself */}
        <NestedDicomTable onSelectSeries={handleSelectSeries} />

        {selectedSeries && (
          <div style={{ textAlign: 'center', margin: '1rem' }}>
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
