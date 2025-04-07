// src/components/Sidebar.tsx
import React from 'react';
import DicomMetadataPanel from './DicomMetadataPanel';

interface SidebarProps {
  metadata: {
    patientId?: string;
    patientName?: string;
    patientSex?: string;
    studyDate?: string;
    studyDescription?: string;
    seriesDescription?: string;
    manufacturer?: string;
  } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ metadata }) => {
  return (
    <aside style={{ flex: 1 }}>
      <DicomMetadataPanel metadata={metadata} />
    </aside>
  );
};

export default Sidebar;
