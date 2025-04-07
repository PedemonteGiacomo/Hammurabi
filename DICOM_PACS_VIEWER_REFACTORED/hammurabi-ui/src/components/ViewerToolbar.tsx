// src/components/ViewerToolbar.tsx
import React from 'react';

const ViewerToolbar: React.FC = () => {
  return (
    <div id="toolbar">
      <div className="container-fluid d-flex align-items-center" id="container-fluid-toolbar">
        <ul className="d-flex list-unstyled mb-0">
          <li className="toolbar_icon" id="esaote_file_button_list_item">
            <img
              id="esaote_file_button"
              src="/assets/esaote_e.svg"
              alt="Esaote Logo"
            />
          </li>
          <li>
            <img className="toolbar_icon" src="/assets/zoom-in-svgrepo-com.svg" alt="Zoom icon" />
          </li>
          <li>
            <img className="toolbar_icon" src="/assets/rotate-svgrepo-com.svg" alt="Rotate icon" />
          </li>
          <li>
            <img className="toolbar_icon" src="/assets/pan-svgrepo-com.svg" alt="Pan icon" />
          </li>
          <li>
            <img className="toolbar_icon" src="/assets/note-svgrepo-com.svg" alt="Annotation icon" />
          </li>
          <li>
            <img className="toolbar_icon" src="/assets/measure-svgrepo-com.svg" alt="Measure icon" />
          </li>
          <li>
            <img className="toolbar_icon" src="/assets/fullscreen-svgrepo-com.svg" alt="Fullscreen icon" />
          </li>
          <li>
            <img className="toolbar_icon" src="/assets/flip-horizontal-svgrepo-com.svg" alt="Flip Horizontal icon" />
          </li>
          <li>
            <img className="toolbar_icon" src="/assets/flip-vertical-svgrepo-com.svg" alt="Flip Vertical icon" />
          </li>
          <li>
            <img className="toolbar_icon" src="/assets/reset-view-svgrepo-com.svg" alt="Reset View icon" />
          </li>
          <li>
            <img className="toolbar_icon" src="/assets/info-svgrepo-com.svg" alt="Info icon" />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ViewerToolbar;
