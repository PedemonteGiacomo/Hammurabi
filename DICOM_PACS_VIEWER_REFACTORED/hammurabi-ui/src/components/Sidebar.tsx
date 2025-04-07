// src/components/Sidebar.tsx
import React from 'react';
import DicomMetadataPanel from './DicomMetadataPanel';

const Sidebar: React.FC = () => {
  return (
    <aside>
      <DicomMetadataPanel />
    </aside>
  );
};

export default Sidebar;
