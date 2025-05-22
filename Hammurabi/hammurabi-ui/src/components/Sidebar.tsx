import React from 'react';
import DicomMetadataPanel, {
  DicomMetadataPanelProps,
} from './DicomMetadataPanel';
import { useComponentVariant } from '../hooks/useComponentVariant';

export interface SidebarProps {
  /* --- Data --- */
  metadata: Record<string, any> | null;

  /* --- Size & layout --- */
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  position?: 'left' | 'right';

  /* --- Behaviour --- */
  collapsible?: boolean;          // abilita scroll interno
  resizable?: boolean;
  defaultCollapsed?: boolean;

  /* --- Styling --- */
  bgColor?: string;
  title?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;

  /* --- Events --- */
  onCollapseChange?: (collapsed: boolean) => void;
  onResize?: (size: { width: string | number; height: string | number }) => void;

  /* --- Forward to DicomMetadataPanel --- */
  panelProps?: Omit<DicomMetadataPanelProps, 'metadata'>;
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
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  position = 'left',
  collapsible: collapsibleOverride,
  resizable = false,
  defaultCollapsed = false,
  bgColor,
  title = 'DICOM Metadata',
  className,
  style,
  onCollapseChange,
  onResize,
  panelProps,
}) => {
  /* ---------------- schema da Variante ---------------- */
  const {
    width: widthSchema,
    height: heightSchema,
    collapsible: collapsibleSchema,
  } = useComponentVariant<Variant>('Sidebar');

  const width = widthOverride ?? widthSchema;
  const height = heightOverride ?? heightSchema;
  const collapsible = collapsibleOverride ?? collapsibleSchema ?? false;

  /* ---------------------- inline styles --------------------- */
  const sidebarStyle: React.CSSProperties = {
    width,
    height,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    overflowY: collapsible ? 'auto' : 'visible',
    background: bgColor,
    ...(position === 'right' ? { order: 2 } : {}),
    ...style,
  };

  /* ---------------------- event handlers -------------------- */
  const handleResize = (newSize: { w: number; h: number }) => {
    onResize?.({
      width: newSize.w,
      height: newSize.h,
    });
  };

  /* ------------------------- UI ----------------------------- */
  return (
    <aside className={`viewer-sidebar ${className ?? ''}`} style={sidebarStyle}>
      {title && <h3 className="sidebar-title">{title}</h3>}

      {/* TODO: collapsible / resizable behaviour; lasciato al container */}
      <DicomMetadataPanel metadata={metadata} {...panelProps} />
    </aside>
  );
};

export default Sidebar;
