// src/App.tsx
import React, { useState } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import InputsPanel from './components/InputsPanel';
import Viewer from './components/Viewer';
import NestedDicomTable from './components/NestedDicomTable'; // New

// If you want to define your interfaces here inline:
export interface SeriesInfo {
  seriesUID: string;
  seriesDescription: string;
  numberOfImages: number;
  imageFilePaths: string[];
}

function App() {
  // We'll store the 'selected' series here
  const [selectedSeries, setSelectedSeries] = useState<SeriesInfo | null>(null);

  // Called when user clicks the "View" button on a series
  const handleSelectSeries = (series: SeriesInfo) => {
    setSelectedSeries(series);
  };

  return (
    <>
      {/* <TopBar /> */}
      <main>
        {/* <Sidebar /> */}
        {/* <InputsPanel /> */}

        {/* The Nested Table with expansions */}
        <NestedDicomTable onSelectSeries={handleSelectSeries} />

        {/* The DICOM viewer that shows the current series (if any) */}
        <Viewer series={selectedSeries} />
      </main>
      <footer></footer>
    </>
  );
}

export default App;
