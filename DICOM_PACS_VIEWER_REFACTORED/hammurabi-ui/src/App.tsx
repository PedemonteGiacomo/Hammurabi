// src/App.tsx
import React from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import InputsPanel from './components/InputsPanel';
import Viewer from './components/Viewer';

function App() {
  return (
    <>
      {/* The top navigation bar (red with logos) */}
      <TopBar />
      <main>
        {/* The sidebar with checkboxes + metadata */}
        <Sidebar />

        {/* The input fields for patient/study/series/instance */}
        <InputsPanel />

        {/* The main DICOM viewer */}
        <Viewer />
      </main>

      <footer></footer>
    </>
  );
}

export default App;
