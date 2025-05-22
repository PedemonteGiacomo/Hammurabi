import React, { useState } from 'react';
import defaultDicomData from '../data/dicomData_updated.json';

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

export interface NestedDicomTableProps {
  /** dataset; se omesso usa il JSON di default */
  data?: PatientInfo[];
  /** callback pulsante VIEW 1 */
  onSelectSeries: (s: SeriesInfo) => void;
  /** callback pulsante VIEW 2 (facoltativo) */
  onSelectSeries2?: (s: SeriesInfo) => void;

  /* ---------- UI/UX extra ---------- */
  showPatientCount?: boolean;
  initiallyExpandedPatients?: string[];
  initiallyExpandedStudies?: string[];
  tableClassName?: string;
  rowHoverColor?: string;
  toggleIcons?: { open: string; closed: string };
  noDataMessage?: string;
}

const NestedDicomTable: React.FC<NestedDicomTableProps> = ({
  data,
  onSelectSeries,
  onSelectSeries2,
  showPatientCount = false,
  initiallyExpandedPatients = [],
  initiallyExpandedStudies = [],
  tableClassName,
  rowHoverColor = '#222',
  toggleIcons = { open: '▼', closed: '▶' },
  noDataMessage = 'No DICOM data',
}) => {
  const patients: PatientInfo[] = (data ?? (defaultDicomData as PatientInfo[]))
    .filter((p) => p.studies?.length);

  const [expandedPatients, setExpandedPatients] =
    useState<string[]>(initiallyExpandedPatients);
  const [expandedStudies, setExpandedStudies] =
    useState<string[]>(initiallyExpandedStudies);

  const toggle = <T extends string>(
    arr: string[],
    set: React.Dispatch<React.SetStateAction<string[]>>,
    id: T,
  ) =>
    set((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  if (!patients.length) return <p>{noDataMessage}</p>;

  return (
    <div className="nested-dicom-table-container">
      <table className={`study-list-table ${tableClassName ?? ''}`}>
        <thead>
          <tr>
            <th style={{ width: '30%' }}>
              Patient ID
              {showPatientCount && ` (${patients.length})`}
            </th>
            <th>Studies / Series Info</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => {
            const pOpen = expandedPatients.includes(patient.patientID);

            return (
              <React.Fragment key={patient.patientID}>
                <tr
                  onClick={() =>
                    toggle(expandedPatients, setExpandedPatients, patient.patientID)
                  }
                  style={{
                    cursor: 'pointer',
                    background: pOpen ? rowHoverColor : undefined,
                  }}
                >
                  <td>{patient.patientID}</td>
                  <td>{pOpen ? `${toggleIcons.open} Hide` : `${toggleIcons.closed} Show`}</td>
                </tr>

                {pOpen &&
                  patient.studies.map((study) => {
                    const sOpen = expandedStudies.includes(study.studyUID);
                    const list = study.series.filter(
                      (s) => s.imageFilePaths?.length,
                    );
                    if (!list.length) return null;

                    return (
                      <React.Fragment key={study.studyUID}>
                        <tr
                          onClick={() =>
                            toggle(expandedStudies, setExpandedStudies, study.studyUID)
                          }
                          style={{ cursor: 'pointer' }}
                        >
                          <td style={{ paddingLeft: '2rem' }}>
                            <strong>Study UID:</strong> {study.studyUID}
                          </td>
                          <td>
                            <strong>Date:</strong> {study.studyDate} |{' '}
                            <strong>Description:</strong>{' '}
                            {study.studyDescription}{' '}
                            {sOpen ? toggleIcons.open : toggleIcons.closed}
                          </td>
                        </tr>

                        {sOpen &&
                          list.map((series) => (
                            <tr key={series.seriesUID}>
                              <td style={{ paddingLeft: '4rem' }}>
                                <em>Series UID:</em> {series.seriesUID}
                              </td>
                              <td>
                                <em>Description:</em> {series.seriesDescription} |{' '}
                                <em>Images:</em> {series.numberOfImages}
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ marginLeft: '1rem' }}
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
                                    style={{ marginLeft: '0.5rem' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectSeries2(series);
                                    }}
                                  >
                                    View 2
                                  </button>
                                )}
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
