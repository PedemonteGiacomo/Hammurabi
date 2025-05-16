import React, { useState } from 'react';

interface DicomMetadataPanelProps {
  metadata: Record<string, any> | null;
}

const CATEGORIES: Record<string, string> = {
  patient: 'Patient',
  study: 'Study',
  series: 'Series',
  equipment: 'Equipment',
  acquisition: 'Acquisition',
  identity: 'Patient Identity',
  private: 'Private Tags',
  parameters: 'Imaging Parameters',
  identifiers: 'Study/Series IDs',
  geometry: 'Geometry & Pixmap',
  procedure: 'Procedure Step',
};

const DicomMetadataPanel: React.FC<DicomMetadataPanelProps> = ({ metadata }) => {
  const [visible, setVisible] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(CATEGORIES).map(cat => [cat, true])) as Record<string, boolean>
  );

  const toggle = (cat: string) =>
    setVisible(v => ({ ...v, [cat]: !v[cat] }));

  if (!metadata) return <p>No metadata available</p>;

  const entriesByCat: Record<string, [string, string][]> = {};
  Object.entries(metadata).forEach(([key, raw]) => {
    if (raw == null) return;
    const val = Array.isArray(raw) ? raw.join('\\') : String(raw).trim();
    if (
      !val ||
      val === 'Unknown' ||
      /^[\x00-\x1F]+$/.test(val) ||
      val === '[object Object]'
    ) return;

    let cat = 'acquisition';
    const k = key.toLowerCase();
    if (k.startsWith('patient') && !k.includes('position')) cat = 'identity';
    else if (k.includes('patient')) cat = 'patient';
    else if (k.includes('study') || k.includes('contentdate') || k.includes('studydate')) cat = 'study';
    else if (k.includes('series') || k.includes('referencedimage')) cat = 'series';
    else if (['manufacturer', 'model', 'stationname'].some(s => k.includes(s))) cat = 'equipment';
    else if (k.startsWith('private') || k.startsWith('userdata') || k.startsWith('normalization')) cat = 'private';
    else if (['bodypartexamined', 'scanningsequence', 'sequencevariant', 'scanoptions', 'mracquisition', 'slice', 'echo', 'repetition', 'frequency', 'nucleus', 'coil', 'matrix', 'flip', 'bandwidth', 'software', 'protocol'].some(s => k.includes(s))) cat = 'parameters';
    else if (['studyinstance', 'seriesinstance', 'instance', 'frame', 'imagesin', 'positionreference', 'sliceLocation'].some(s => k.includes(s))) cat = 'identifiers';
    else if (['imageposition', 'imageorientation', 'rows', 'columns', 'pixel', 'photometric', 'samplesperpixel', 'bits', 'highbit', 'pixrepresentation', 'lossy'].some(s => k.includes(s))) cat = 'geometry';
    else if (k.includes('performedprocedurestep')) cat = 'procedure';

    entriesByCat[cat] = entriesByCat[cat] || [];
    entriesByCat[cat].push([key, val]);
  });

  return (
    <div className="dicom-metadata-panel">
      <h5>Extracted Metadata</h5>

      <div className="metadata-checkbox-row mb-3">
        {Object.entries(CATEGORIES).map(([cat, label]) => (
          <div key={cat} className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              id={`cb-${cat}`}
              checked={visible[cat]}
              onChange={() => toggle(cat)}
            />
            <label className="form-check-label" htmlFor={`cb-${cat}`}>
              {label}
            </label>
          </div>
        ))}
      </div>

      {Object.entries(CATEGORIES).map(([cat, label]) =>
        visible[cat] && entriesByCat[cat] ? (
          <section key={cat} className="mb-4">
            <h6>{label}</h6>
            <table className="table table-sm">
              <tbody>
                {entriesByCat[cat].map(([k, v]) => (
                  <tr key={k}>
                    <td><code>{k}</code></td>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null
      )}
    </div>
  );
};

export default DicomMetadataPanel;
