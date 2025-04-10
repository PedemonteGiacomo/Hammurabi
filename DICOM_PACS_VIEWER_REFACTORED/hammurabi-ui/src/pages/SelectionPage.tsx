// src/pages/SelectionPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedSeries } from '../zustand/store/viewerSlice';
import TopBar from '../components/TopBar';
import NestedDicomTable, { SeriesInfo } from '../components/NestedDicomTable';

const SelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // When a series is selected, store it globally and navigate to the viewer page.
  const handleSelectSeries = (series: SeriesInfo) => {
    dispatch(setSelectedSeries(series));
    navigate('/viewer');
  };

  return (
    <div className="selection-page-container">
      <TopBar />
      <div className="study-list-wrapper">
        <div className="study-list-header">
          <h2>Study List</h2>
        </div>
        <NestedDicomTable onSelectSeries={handleSelectSeries} />
      </div>
    </div>
  );
};

export default SelectionPage;
