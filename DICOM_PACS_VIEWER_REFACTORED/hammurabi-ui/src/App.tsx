// src/App.tsx
import React, { useState } from 'react';
import NestedDicomTable from './components/NestedDicomTable';
import Viewer, { SeriesInfo } from './components/Viewer';
import Sidebar from './components/Sidebar';

function App() {
  const [selectedSeries, setSelectedSeries] = useState<SeriesInfo | null>(null);
  const [extractedMetadata, setExtractedMetadata] = useState<any>(null);

  const handleSelectSeries = (series: SeriesInfo) => {
    setSelectedSeries(series);
    setExtractedMetadata(null); // reset metadata when a new series is selected
  };

  return (
    <>
      <main style={{ display: 'flex', flexDirection: 'column' }}>
        <NestedDicomTable onSelectSeries={handleSelectSeries} />
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Viewer series={selectedSeries} onMetadataExtracted={setExtractedMetadata} />
          <Sidebar metadata={extractedMetadata} />
        </div>
      </main>
      <footer></footer>
    </>
  );
}

export default App;
