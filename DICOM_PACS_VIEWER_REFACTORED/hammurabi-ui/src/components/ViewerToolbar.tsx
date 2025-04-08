// src/components/ViewerToolbar.tsx
import React from 'react';

const ViewerToolbar: React.FC = () => {
  return (
    <div className="viewer-toolbar-container">
      <ul className="toolbar-list">
        {/* "File" button: e.svg */}
        <li className="toolbar-item">
          <img src="/assets/esaote_e.svg" alt="File" />
        </li>
        {/* Zoom icon: zoom-in-svgrepo-com.svg */}
        <li className="toolbar-item">
          <img src="/assets/zoom-in-svgrepo-com.svg" alt="Zoom" />
        </li>
        {/* Rotate icon: rotate-svgrepo-com.svg */}
        <li className="toolbar-item">
          <img src="/assets/rotate-svgrepo-com.svg" alt="Rotate" />
        </li>
        {/* Pan icon: pan-svgrepo-com.svg */}
        <li className="toolbar-item">
          <img src="/assets/pan-svgrepo-com.svg" alt="Pan" />
        </li>
        {/* Note icon: note-svgrepo-com.svg */}
        <li className="toolbar-item">
          <img src="/assets/note-svgrepo-com.svg" alt="Annotation" />
        </li>
        {/* Measure icon: measure-svgrepo-com.svg */}
        <li className="toolbar-item">
          <img src="/assets/measure-svgrepo-com.svg" alt="Measure" />
        </li>
        {/* Fullscreen icon: fullscreen-svgrepo-com.svg */}
        <li className="toolbar-item">
          <img src="/assets/fullscreen-svgrepo-com.svg" alt="Fullscreen" />
        </li>
        {/* Flip H: flip-horizontal-svgrepo-com.svg */}
        <li className="toolbar-item">
          <img src="/assets/flip-horizontal-svgrepo-com.svg" alt="Flip H" />
        </li>
        {/* Flip V: flip-vertical-svgrepo-com.svg */}
        <li className="toolbar-item">
          <img src="/assets/flip-vertical-svgrepo-com.svg" alt="Flip V" />
        </li>
        {/* Reset View: reset-view-svgrepo-com.svg */}
        <li className="toolbar-item">
          <img src="/assets/reset-view-svgrepo-com.svg" alt="Reset" />
        </li>
        {/* Info icon: info-svgrepo-com.svg */}
        <li className="toolbar-item">
          <img src="/assets/info-svgrepo-com.svg" alt="Info" />
        </li>
      </ul>
    </div>
  );
};

export default ViewerToolbar;
