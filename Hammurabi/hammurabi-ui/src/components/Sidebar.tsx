// src/components/Sidebar.tsx

import React from "react";
import DicomMetadataPanel from "./DicomMetadataPanel";
import { useComponentVariant } from "../hooks/useComponentVariant";

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

/* Schema variant type */
interface Variant {
  width: string | number;
  collapsible?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ metadata }) => {
  /* schema‑driven styles */
  const { width } = useComponentVariant<Variant>("Sidebar");

  return (
    <aside className="viewer-sidebar" style={width ? { width } : undefined}>
      <h3 className="sidebar-title">DICOM Metadata</h3>
      <DicomMetadataPanel metadata={metadata} />
    </aside>
  );
};

export default Sidebar;
