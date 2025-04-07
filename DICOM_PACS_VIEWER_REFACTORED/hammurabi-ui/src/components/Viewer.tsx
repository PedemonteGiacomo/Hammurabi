// src/components/Viewer.tsx
import React from 'react';
import ViewerToolbar from './ViewerToolbar';

const Viewer: React.FC = () => {
  return (
    <section id="viewer">
      {/* The Toolbar icons */}
      <ViewerToolbar />

      {/* Placeholder for the DICOM image */}
      <div id="image_canvas">
        {/* For now, we simply replicate the sample image. 
            Later, you will replace this <img> with a Cornerstone viewport. */}
        <img
          src="/assets/DICOM_Sample.jpg"
          alt="Sample DICOM"
          id="dicom_image"
        />
      </div>

      {/* The bottom info panel */}
      <div id="viewer_bottom_info_panel">
        <table id="view_info_table">
          <thead>
            <tr id="header_row">
              <th>Measure</th>
              <th>View</th>
              <th>Color</th>
            </tr>
          </thead>
          <tbody>
            <tr className="data_row">
              <td>X coord: (20; 50)</td>
              <td>Zoom: 88%</td>
              <td>LUT: None</td>
            </tr>
            <tr className="data_row">
              <td>O coord: (235; 357)</td>
              <td>View Center: (223; 305)</td>
              <td>Pixel RGB: (132; 132; 132)</td>
            </tr>
            <tr className="data_row">
              <td>Angle: 57°</td>
              <td>View Rotation: 0°</td>
              <td>Contrast: 73%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Viewer;
