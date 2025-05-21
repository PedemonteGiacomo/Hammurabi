// ...existing code...
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Remove: import { useDispatch } from 'react-redux';
// Remove: import { setSelectedSeries } from '../zustand/store/viewerSlice';
import TopBar from '../components/TopBar';
import NestedDicomTable, { SeriesInfo } from '../components/NestedDicomTable';

const SelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSeries, setSelectedSeries] = useState<SeriesInfo | null>(null);

  // When a series is selected, store it in local state and navigate to the viewer page.
  const handleSelectSeries = (series: SeriesInfo) => {
    navigate('/viewer', { state: { series } });
  };

  const handleSelectSeries2 = (series: SeriesInfo) => {
    navigate('/viewer2', { state: { series } });
  };

  return (
    <div className="selection-page-container">
      <TopBar />
      <div className="study-list-wrapper">
        <div className="study-list-header">
          <h2>Studies</h2>
        </div>
        <NestedDicomTable onSelectSeries={handleSelectSeries} onSelectSeries2={handleSelectSeries2} />
      </div>
    </div>
  );
};

export default SelectionPage;


