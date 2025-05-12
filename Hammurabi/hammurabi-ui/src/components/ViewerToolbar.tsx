// src/components/ViewerToolbar.tsx

import React from 'react';

interface ViewerToolbarProps {
  showSidebar: boolean;
  onToggleSidebar: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  // in futuro potresti aggiungere onRotate?, onPan?, ecc.
}

const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  showSidebar,
  onToggleSidebar,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="viewer-toolbar-container">
      <ul className="toolbar-list">
        {/* File button */}
        <li className="toolbar-item" title="File Menu">
          <img src="/assets/esaote_e.svg" alt="File" />
        </li>

        {/* Zoom In */}
        <li
          className="toolbar-item"
          title="Zoom In"
          onClick={onZoomIn}
          style={{ cursor: onZoomIn ? 'pointer' : 'default' }}
        >
          <img src="/assets/zoom-in-svgrepo-com.svg" alt="Zoom In" />
        </li>

        {/* Zoom Out */}
        <li
          className="toolbar-item"
          title="Zoom Out"
          onClick={onZoomOut}
          style={{ cursor: onZoomOut ? 'pointer' : 'default' }}
        >
          <img src="/assets/zoom-out-svgrepo-com.svg" alt="Zoom Out" />
        </li>

        {/* Rotate button */}
        <li className="toolbar-item" title="Rotate">
          <img src="/assets/rotate-svgrepo-com.svg" alt="Rotate" />
        </li>

        {/* Pan button */}
        <li className="toolbar-item" title="Pan">
          <img src="/assets/pan-svgrepo-com.svg" alt="Pan" />
        </li>

        {/* Annotation button */}
        <li className="toolbar-item" title="Add Annotation">
          <img src="/assets/note-svgrepo-com.svg" alt="Annotation" />
        </li>

        {/* Measure button */}
        <li className="toolbar-item" title="Measure">
          <img src="/assets/measure-svgrepo-com.svg" alt="Measure" />
        </li>

        {/* Fullscreen button */}
        <li className="toolbar-item" title="Fullscreen">
          <img src="/assets/fullscreen-svgrepo-com.svg" alt="Fullscreen" />
        </li>

        {/* Flip Horizontal */}
        <li className="toolbar-item" title="Flip Horizontal">
          <img src="/assets/flip-horizontal-svgrepo-com.svg" alt="Flip H" />
        </li>

        {/* Flip Vertical */}
        <li className="toolbar-item" title="Flip Vertical">
          <img src="/assets/flip-vertical-svgrepo-com.svg" alt="Flip V" />
        </li>

        {/* Reset View */}
        <li className="toolbar-item" title="Reset View">
          <img src="/assets/reset-view-svgrepo-com.svg" alt="Reset View" />
        </li>

        {/* Info icon: toggles the metadata panel */}
        <li
          className="toolbar-item"
          onClick={onToggleSidebar}
          style={{ cursor: 'pointer' }}
          title={showSidebar ? "Hide Metadata Panel" : "Show Metadata Panel"}
        >
          <img src="/assets/info-svgrepo-com.svg" alt="Info" />
        </li>
      </ul>
    </div>
  );
};

export default ViewerToolbar;
