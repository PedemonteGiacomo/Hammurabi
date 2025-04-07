// src/components/DicomMetadataPanel.tsx
import React, { useState } from 'react';

interface DicomMetadataPanelProps {
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

const DicomMetadataPanel: React.FC<DicomMetadataPanelProps> = ({ metadata }) => {
  // Checkbox state for each metadata section.
  const [showPatient, setShowPatient] = useState(true);
  const [showStudy, setShowStudy] = useState(true);
  const [showSeries, setShowSeries] = useState(true);
  const [showEquipment, setShowEquipment] = useState(true);

  const handleCheckboxChange = (setter: React.Dispatch<React.SetStateAction<boolean>>) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setter(event.target.checked);
  };

  return (
    <div id="DICOM_metadata_panel" style={{ flex: 1, padding: '1rem' }}>
      <section id="buttons">
        <h1>Select Info</h1>
        <div className="container-fluid d-flex align-items-center" id="container-fluid-buttons">
          <div className="form-check me-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="patient_checkbox"
              checked={showPatient}
              onChange={handleCheckboxChange(setShowPatient)}
            />
            <label className="form-check-label" htmlFor="patient_checkbox">Patient</label>
          </div>
          <div className="form-check me-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="study_checkbox"
              checked={showStudy}
              onChange={handleCheckboxChange(setShowStudy)}
            />
            <label className="form-check-label" htmlFor="study_checkbox">Study</label>
          </div>
          <div className="form-check me-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="series_checkbox"
              checked={showSeries}
              onChange={handleCheckboxChange(setShowSeries)}
            />
            <label className="form-check-label" htmlFor="series_checkbox">Series</label>
          </div>
          <div className="form-check me-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="equipment_checkbox"
              checked={showEquipment}
              onChange={handleCheckboxChange(setShowEquipment)}
            />
            <label className="form-check-label" htmlFor="equipment_checkbox">Equipment</label>
          </div>
        </div>
      </section>

      <div className="overflow-scroll" style={{ marginTop: '1rem' }}>
        {metadata ? (
          <div>
            <h2>Extracted Metadata</h2>
            {showPatient && (
              <div>
                <p><strong>Patient ID:</strong> {metadata.patientId}</p>
                <p><strong>Patient Name:</strong> {metadata.patientName}</p>
                <p><strong>Patient Sex:</strong> {metadata.patientSex}</p>
              </div>
            )}
            {showStudy && (
              <div>
                <p><strong>Study Date:</strong> {metadata.studyDate}</p>
                <p><strong>Study Description:</strong> {metadata.studyDescription}</p>
              </div>
            )}
            {showSeries && (
              <div>
                <p><strong>Series Description:</strong> {metadata.seriesDescription}</p>
              </div>
            )}
            {showEquipment && (
              <div>
                <p><strong>Manufacturer:</strong> {metadata.manufacturer}</p>
              </div>
            )}
          </div>
        ) : (
          <p>No metadata available</p>
        )}
      </div>
    </div>
  );
};

export default DicomMetadataPanel;
