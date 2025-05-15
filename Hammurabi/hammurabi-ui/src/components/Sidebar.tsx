// src/components/Sidebar.tsx
import React from "react";
import DicomMetadataPanel from "./DicomMetadataPanel";
import { useComponentVariant } from "../hooks/useComponentVariant";

interface SidebarProps {
  metadata: Record<string, any> | null;
}

interface Variant {
  width: string | number;
  height: string | number;
  collapsible?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ metadata }) => {
  const { width, height, collapsible } =
    useComponentVariant<Variant>("Sidebar");

  return (
    <aside
      className="viewer-sidebar"
      style={{
        width,
        height,
        overflowY: collapsible ? "auto" : "visible",
      }}
    >
      <h3 className="sidebar-title">DICOM Metadata</h3>
      <DicomMetadataPanel metadata={metadata} />
    </aside>
  );
};

export default Sidebar;
