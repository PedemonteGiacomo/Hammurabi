// src/components/NestedDicomTable.tsx
import React, { useState } from "react";
import dicomData from "../data/dicomData_updated.json";

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
 * - onSelectSeries: function called when user clicks "View" on a series
 */
interface NestedDicomTableProps {
  onSelectSeries: (series: SeriesInfo) => void;
  onSelectSeries2: (series: SeriesInfo) => void;
}

const NestedDicomTable: React.FC<NestedDicomTableProps> = ({ onSelectSeries, onSelectSeries2 }) => {
  // Control which patients/studies are expanded
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

  // Convert raw JSON data to typed array
  const patients: PatientInfo[] = dicomData as PatientInfo[];

  return (
    <div className="nested-dicom-table-container">
      <table className="study-list-table">
        <thead>
          <tr>
            <th style={{ width: '30%' }}>Patient ID</th>
            <th>Studies / Series Info</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => {
            const isPatientExpanded = expandedPatients.includes(patient.patientID);

            return (
              <React.Fragment key={patient.patientID}>
                {/* Top-level row for each Patient */}
                <tr
                  onClick={() => togglePatient(patient.patientID)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{patient.patientID}</td>
                  <td>
                    {isPatientExpanded ? "▼ Hide Studies" : "▶ Show Studies"}
                  </td>
                </tr>

                {/* If expanded, show that patient’s studies */}
                {isPatientExpanded &&
                  patient.studies.map((study) => {
                    const isStudyExpanded = expandedStudies.includes(study.studyUID);
                    // Filter out any series that have no images
                    const seriesWithImages = study.series.filter(
                      (s) => s.imageFilePaths && s.imageFilePaths.length > 0
                    );
                    // If no series with images, skip
                    if (seriesWithImages.length === 0) return null;

                    return (
                      <React.Fragment key={study.studyUID}>
                        {/* Study row */}
                        <tr
                          onClick={() => toggleStudy(study.studyUID)}
                          style={{ cursor: "pointer" }}
                        >
                          <td style={{ paddingLeft: "2rem" }}>
                            <strong>Study UID:</strong> {study.studyUID}
                          </td>
                          <td>
                            <strong>Date:</strong> {study.studyDate} |{" "}
                            <strong>Description:</strong> {study.studyDescription} |{" "}
                            {isStudyExpanded ? "▼ Hide Series" : "▶ Show Series"}
                          </td>
                        </tr>

                        {/* Series rows (if expanded) */}
                        {isStudyExpanded &&
                          seriesWithImages.map((series) => (
                            <tr key={series.seriesUID}>
                              <td style={{ paddingLeft: "4rem" }}>
                                <em>Series UID:</em> {series.seriesUID}
                              </td>
                              <td>
                                <em>Description:</em> {series.seriesDescription} |{" "}
                                <em>Images:</em> {series.numberOfImages}{" "}
                                + <button
                                  className="btn btn-sm btn-primary"
                                  style={{ marginLeft: "1rem" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectSeries(series);
                                  }}
                                >
                                  View
                                </button>
                                {onSelectSeries2 && (
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    style={{ marginLeft: "0.5rem" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectSeries2!(series);
                                    }}
                                  >
                                    View 2
                                  </button>)}
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
