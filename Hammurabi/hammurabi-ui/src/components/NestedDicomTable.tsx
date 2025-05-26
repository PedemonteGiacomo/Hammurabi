import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import uiSchemaFull from '../schema/uiSchema.full.json';
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
  /* ---------- UI/UX extra ---------- */
  showPatientCount?: boolean;
  initiallyExpandedPatients?: string[];
  initiallyExpandedStudies?: string[];
  tableClassName?: string;
  rowHoverColor?: string;
  toggleIcons?: { open: string; closed: string };
  noDataMessage?: string;
}

// Helper per scoprire quali pagine hanno NewViewer
function discoverViewerPages(): { key: string; path: string }[] {
  const pages = uiSchemaFull.pages as Record<string, any>;
  const result: { key: string; path: string }[] = [];
  const containsNewViewer = (items: any[]): boolean => {
    return items.some(item => {
      if (item.component === 'NewViewer') return true;
      return item.children && containsNewViewer(item.children);
    });
  };
  for (const [key, def] of Object.entries(pages)) {
    if (Array.isArray(def.children) && containsNewViewer(def.children)) {
      result.push({ key, path: def.path });
    }
  }
  return result;
}

const NestedDicomTable: React.FC<NestedDicomTableProps> = ({
  data,
  showPatientCount = false,
  initiallyExpandedPatients = [],
  initiallyExpandedStudies = [],
  tableClassName,
  rowHoverColor = '#222',
  toggleIcons = { open: '▼', closed: '▶' },
  noDataMessage = 'No DICOM data',
}) => {
  const navigate = useNavigate();
  const patients: PatientInfo[] = (data ?? (defaultDicomData as PatientInfo[])).filter(
    p => p.studies?.length
  );

  const [expandedPatients, setExpandedPatients] =
    useState<string[]>(initiallyExpandedPatients);
  const [expandedStudies, setExpandedStudies] =
    useState<string[]>(initiallyExpandedStudies);

  // Scopri dinamicamente tutte le pagine viewer nel JSON schema
  const viewerPages = React.useMemo(() => discoverViewerPages(), []);

  const toggle = <T extends string>(
    arr: string[],
    set: React.Dispatch<React.SetStateAction<string[]>>,
    id: T
  ) =>
    set(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));

  if (!patients.length) return <p>{noDataMessage}</p>;

  return (
    <div className="nested-dicom-table-container">
      <table className={`study-list-table ${tableClassName ?? ''}`}>
        <thead>
          <tr>
            <th style={{ width: '30%' }}>
              Patient ID{showPatientCount && ` (${patients.length})`}
            </th>
            <th>Studies / Series Info</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => {
            const pOpen = expandedPatients.includes(patient.patientID);
            return (
              <React.Fragment key={patient.patientID}>
                <tr
                  onClick={() =>
                    toggle(expandedPatients, setExpandedPatients, patient.patientID)
                  }
                  style={{ cursor: 'pointer', background: pOpen ? rowHoverColor : undefined }}
                >
                  <td>{patient.patientID}</td>
                  <td>{pOpen ? `${toggleIcons.open} Hide` : `${toggleIcons.closed} Show`}</td>
                </tr>

                {pOpen &&
                  patient.studies.map(study => {
                    const sOpen = expandedStudies.includes(study.studyUID);
                    const list = study.series.filter(s => s.imageFilePaths?.length);
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
                            <strong>Date:</strong> {study.studyDate} | <strong>Description:</strong>{' '}
                            {study.studyDescription}{' '}
                            {sOpen ? toggleIcons.open : toggleIcons.closed}
                          </td>
                        </tr>

                        {sOpen &&
                          list.map(series => (
                            <tr key={series.seriesUID}>
                              <td style={{ paddingLeft: '4rem' }}>
                                <em>Series UID:</em> {series.seriesUID}
                              </td>
                              <td>
                                <em>Description:</em> {series.seriesDescription} | <em>Images:</em>{' '}
                                {series.numberOfImages}
                                {/* Render a button for each viewer page */}
                                {viewerPages.map(vp => (
                                  <button
                                    key={vp.key}
                                    className="btn btn-sm btn-primary"
                                    style={{ marginLeft: '1rem' }}
                                    onClick={e => {
                                      e.stopPropagation();
                                      navigate(vp.path, { state: { series } });
                                    }}
                                  >
                                    View ({vp.key})
                                  </button>
                                ))}
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
