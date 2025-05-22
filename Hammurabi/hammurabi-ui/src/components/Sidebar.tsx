import React from "react";
import DicomMetadataPanel from "./DicomMetadataPanel";
import { useComponentVariant } from "../hooks/useComponentVariant";

export interface SidebarProps {
  metadata: Record<string, any> | null;
  // added for storybook controls:
  width?: string | number;
  height?: string | number;
  collapsible?: boolean;
}

interface Variant {
  width: string | number;
  height: string | number;
  collapsible?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  metadata,
  width: widthOverride,
  height: heightOverride,
  collapsible: collapsibleOverride,
}) => {
  const { width: widthSchema, height: heightSchema, collapsible: collapsibleSchema } =
    useComponentVariant<Variant>("Sidebar");

  const width = widthOverride ?? widthSchema;
  const height = heightOverride ?? heightSchema;
  const collapsible = collapsibleOverride ?? collapsibleSchema ?? false;

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
