// src/components/DicomMetadataPanel.tsx
import React from 'react';

const DicomMetadataPanel: React.FC = () => {
  return (
    <div id="DICOM_metadata_panel">
      {/* Checkboxes Section */}
      <section id="buttons">
        <h1>Select Info</h1>
        <div
          className="container-fluid d-flex align-items-center"
          id="container-fluid-buttons"
        >
          <div className="form-check me-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="patient_checkbox"
            />
            <label className="form-check-label" htmlFor="patient_checkbox">
              Patient
            </label>
          </div>

          <div className="form-check me-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="study_checkbox"
            />
            <label className="form-check-label" htmlFor="study_checkbox">
              Study
            </label>
          </div>

          <div className="form-check me-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="series_checkbox"
            />
            <label className="form-check-label" htmlFor="series_checkbox">
              Series
            </label>
          </div>

          <div className="form-check me-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="image_checkbox"
            />
            <label className="form-check-label" htmlFor="image_checkbox">
              Image
            </label>
          </div>

          <div className="form-check me-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="equipment_checkbox"
            />
            <label className="form-check-label" htmlFor="equipment_checkbox">
              Equipment
            </label>
          </div>
        </div>
      </section>

      {/* Scrollable container for multiple metadata tables */}
      <div className="overflow-scroll">
        {/* Patient Info */}
        <h1>Patient Information</h1>
        <table className="DICOM_metadata_table" id="DICOM_patient_info_table">
          <tbody>
            <tr>
              <td className="Metadata_key">Patient ID</td>
              <td className="Metadata_value">123</td>
            </tr>
            <tr>
              <td className="Metadata_key">Name</td>
              <td className="Metadata_value">Ronaldo de Assis Moreira</td>
            </tr>
            <tr>
              <td className="Metadata_key">Date of Birth</td>
              <td className="Metadata_value">21/03/1980</td>
            </tr>
            <tr>
              <td className="Metadata_key">Patient Sex</td>
              <td className="Metadata_value">M</td>
            </tr>
          </tbody>
        </table>

        {/* Study Info */}
        <h1>Study Information</h1>
        <table className="DICOM_metadata_table" id="DICOM_study_info_table">
          <tbody>
            <tr>
              <td className="Metadata_key">Instance UID</td>
              <td className="Metadata_value">
                1.3.6.1.4.1.
                <br />
                14519.5.2.1.6834.5010.
                <br />
                119076582718824960697635220329
              </td>
            </tr>
            <tr>
              <td className="Metadata_key">Study Date</td>
              <td className="Metadata_value">28/03/2008</td>
            </tr>
            <tr>
              <td className="Metadata_key">Study Start Time</td>
              <td className="Metadata_value">11:08 AM</td>
            </tr>
            <tr>
              <td className="Metadata_key">Accession Number</td>
              <td className="Metadata_value">2819497684894126</td>
            </tr>
            <tr>
              <td className="Metadata_key">Study Description</td>
              <td className="Metadata_value">p4</td>
            </tr>
          </tbody>
        </table>

        {/* Series Info */}
        <h1>Series Information</h1>
        <table className="DICOM_metadata_table" id="DICOM_series_info_table">
          <tbody>
            <tr>
              <td className="Metadata_key">Instance UID</td>
              <td className="Metadata_value">
                1.3.6.1.4.1.14519.5.2.1.6834.5010.790522551686608875035017785508
              </td>
            </tr>
            <tr>
              <td className="Metadata_key">Study Date</td>
              <td className="Metadata_value">28/03/2008</td>
            </tr>
            <tr>
              <td className="Metadata_key">Study Start Time</td>
              <td className="Metadata_value">11:08 AM</td>
            </tr>
            <tr>
              <td className="Metadata_key">Accession Number</td>
              <td className="Metadata_value">2819497684894126</td>
            </tr>
            <tr>
              <td className="Metadata_key">Study Description</td>
              <td className="Metadata_value">p4</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DicomMetadataPanel;
