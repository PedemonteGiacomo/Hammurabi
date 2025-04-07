// src/components/NestedDicomTable.tsx

import React, { useState } from "react";
import dicomData from "../data/dicomData_updated.json"; // adjust path if needed

// Type definitions
export interface SeriesInfo {
  seriesUID: string;
  seriesDescription: string;
  numberOfImages: number;
  imageFilePaths: string[];
}

export interface StudyInfo {
  studyUID: string;
  studyDescription: string;
  studyDate: string;
  series: SeriesInfo[];
}

export interface PatientInfo {
  patientID: string;
  studies: StudyInfo[];
}

/**
 * Props for NestedDicomTable:
 * - onSelectSeries: function called when the user clicks "View" on a series
 */
interface NestedDicomTableProps {
  onSelectSeries: (series: SeriesInfo) => void;
}

const NestedDicomTable: React.FC<NestedDicomTableProps> = ({ onSelectSeries }) => {
  // Expanded/collapsed state for patients and studies:
  const [expandedPatients, setExpandedPatients] = useState<string[]>([]);
  const [expandedStudies, setExpandedStudies] = useState<string[]>([]);

  const togglePatient = (patientID: string) => {
    setExpandedPatients((prev) =>
      prev.includes(patientID)
        ? prev.filter((id) => id !== patientID)
        : [...prev, patientID]
    );
  };

  const toggleStudy = (studyUID: string) => {
    setExpandedStudies((prev) =>
      prev.includes(studyUID)
        ? prev.filter((uid) => uid !== studyUID)
        : [...prev, studyUID]
    );
  };

  // Convert the raw JSON data to a typed array
  const patients: PatientInfo[] = dicomData as PatientInfo[];

  return (
    <div style={{ margin: "1rem", color: "white" }}>
      <h2>Nested DICOM Table</h2>
      <table className="table table-dark table-bordered">
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Study / Series Info</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => {
            const isPatientExpanded = expandedPatients.includes(patient.patientID);
            return (
              <React.Fragment key={patient.patientID}>
                {/* Patient Row */}
                <tr onClick={() => togglePatient(patient.patientID)} style={{ cursor: "pointer" }}>
                  <td>{patient.patientID}</td>
                  <td>
                    {isPatientExpanded ? "▼ Hide Studies" : "▶ Show Studies"}
                  </td>
                </tr>

                {isPatientExpanded &&
                  patient.studies.map((study) => {
                    // Filter out series without any image file paths
                    const seriesWithImages = study.series.filter(
                      (series) => series.imageFilePaths && series.imageFilePaths.length > 0
                    );

                    // If there are no series with images in this study, skip rendering it.
                    if (seriesWithImages.length === 0) return null;

                    const isStudyExpanded = expandedStudies.includes(study.studyUID);
                    return (
                      <React.Fragment key={study.studyUID}>
                        {/* Study Row */}
                        <tr onClick={() => toggleStudy(study.studyUID)} style={{ cursor: "pointer" }}>
                          <td style={{ paddingLeft: "2rem" }}>
                            <strong>Study UID:</strong> {study.studyUID}
                          </td>
                          <td>
                            <strong>Date:</strong> {study.studyDate} |{" "}
                            <strong>Description:</strong> {study.studyDescription} |{" "}
                            {isStudyExpanded ? "▼ Hide Series" : "▶ Show Series"}
                          </td>
                        </tr>

                        {/* Series rows */}
                        {isStudyExpanded &&
                          seriesWithImages.map((series) => (
                            <tr key={series.seriesUID}>
                              <td style={{ paddingLeft: "4rem" }}>
                                <em>Series UID:</em> {series.seriesUID}
                              </td>
                              <td>
                                <em>Description:</em> {series.seriesDescription} |{" "}
                                <em>Images:</em> {series.numberOfImages}{" "}
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ marginLeft: "1rem" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectSeries(series);
                                  }}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default NestedDicomTable;
