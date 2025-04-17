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
    <aside className="viewer-sidebar">
      <h3 className="sidebar-title">DICOM Metadata</h3>
      <DicomMetadataPanel metadata={metadata} />
    </aside>
  );
};

export default Sidebar;
