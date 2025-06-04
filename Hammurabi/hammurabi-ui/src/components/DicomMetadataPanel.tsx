import React, { useMemo, useState } from 'react';

export interface DicomMetadataPanelProps {
  /** Dati DICOM grezzi */
  metadata: Record<string, any> | null;

  /** Mappa categoria → etichetta (override o aggiunte) */
  categories?: Record<string, string>;

  /** Initial visibility of sections */
  defaultVisible?: Record<string, boolean>;

  /** Show category filter checkboxes */
  showCategoryToggles?: boolean;

  /** Show or hide the main title entirely */
  showTitle?: boolean;
  title?: React.ReactNode;

  /** Enable collapsing/expanding individual sections (in addition to checkboxes) */
  collapsibleSections?: boolean;

  /** Custom renderer for a metadata row */
  renderEntry?: (key: string, value: string) => React.ReactNode;

  /** Callback when a category visibility changes */
  onToggleCategory?: (category: string, isVisible: boolean) => void;

  /** Styling */
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_CATEGORIES: Record<string, string> = {
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

const DicomMetadataPanel: React.FC<DicomMetadataPanelProps> = ({
  metadata,
  categories,
  defaultVisible,
  showCategoryToggles = true,
  showTitle = true,
  title = 'Extracted Metadata',
  collapsibleSections = false,
  renderEntry,
  onToggleCategory,
  className,
  style,
}) => {
  const CATEGORIES = useMemo(
    () => ({ ...DEFAULT_CATEGORIES, ...categories }),
    [categories]
  );

  const [visible, setVisible] = useState<Record<string, boolean>>(
    defaultVisible ??
      (Object.fromEntries(
        Object.keys(CATEGORIES).map((cat) => [cat, true])
      ) as Record<string, boolean>)
  );

  const toggle = (cat: string) =>
    setVisible((v) => {
      const next = { ...v, [cat]: !v[cat] };
      onToggleCategory?.(cat, next[cat]);
      return next;
    });

  if (!metadata) return <p>No metadata available</p>;

  /* ------------------------------- PARSING ------------------------------ */
  const entriesByCat: Record<string, [string, string][]> = {};
  Object.entries(metadata).forEach(([key, raw]) => {
    if (raw == null) return;
    const val = Array.isArray(raw) ? raw.join('\\') : String(raw).trim();
    if (
      !val ||
      val === 'Unknown' ||
      /^[\x00-\x1F]+$/.test(val) ||
      val === '[object Object]'
    )
      return;

    let cat = 'acquisition';
    const k = key.toLowerCase();
    if (k.startsWith('patient') && !k.includes('position')) cat = 'identity';
    else if (k.includes('patient')) cat = 'patient';
    else if (
      k.includes('study') ||
      k.includes('contentdate') ||
      k.includes('studydate')
    )
      cat = 'study';
    else if (k.includes('series') || k.includes('referencedimage'))
      cat = 'series';
    else if (
      ['manufacturer', 'model', 'stationname'].some((s) => k.includes(s))
    )
      cat = 'equipment';
    else if (
      k.startsWith('private') ||
      k.startsWith('userdata') ||
      k.startsWith('normalization')
    )
      cat = 'private';
    else if (
      [
        'bodypartexamined',
        'scanningsequence',
        'sequencevariant',
        'scanoptions',
        'mracquisition',
        'slice',
        'echo',
        'repetition',
        'frequency',
        'nucleus',
        'coil',
        'matrix',
        'flip',
        'bandwidth',
        'software',
        'protocol',
      ].some((s) => k.includes(s))
    )
      cat = 'parameters';
    else if (
      [
        'studyinstance',
        'seriesinstance',
        'instance',
        'frame',
        'imagesin',
        'positionreference',
        'slicelocation',
      ].some((s) => k.includes(s))
    )
      cat = 'identifiers';
    else if (
      [
        'imageposition',
        'imageorientation',
        'rows',
        'columns',
        'pixel',
        'photometric',
        'samplesperpixel',
        'bits',
        'highbit',
        'pixrepresentation',
        'lossy',
      ].some((s) => k.includes(s))
    )
      cat = 'geometry';
    else if (k.includes('performedprocedurestep')) cat = 'procedure';

    entriesByCat[cat] = entriesByCat[cat] || [];
    entriesByCat[cat].push([key, val]);
  });

  /* --------------------------------- UI --------------------------------- */
  return (
    <div className={`dicom-metadata-panel ${className ?? ''}`} style={style}>
      {showTitle && <h5>{title}</h5>}

      {showCategoryToggles && (
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
      )}

      {Object.entries(CATEGORIES).map(([cat, label]) =>
        visible[cat] && entriesByCat[cat] ? (
          <section key={cat} className="mb-4">
            {collapsibleSections ? (
              <details open>
                <summary className="h6 mb-2">{label}</summary>
                <SectionTable
                  entries={entriesByCat[cat]}
                  renderEntry={renderEntry}
                />
              </details>
            ) : (
              <>
                <h6>{label}</h6>
                <SectionTable
                  entries={entriesByCat[cat]}
                  renderEntry={renderEntry}
                />
              </>
            )}
          </section>
        ) : null
      )}
    </div>
  );
};

const SectionTable: React.FC<{
  entries: [string, string][];
  renderEntry?: (k: string, v: string) => React.ReactNode;
}> = ({ entries, renderEntry }) => (
  <table className="table table-sm">
    <tbody>
      {entries.map(([k, v]) => (
        <tr key={k}>
          <td>
            <code>{k}</code>
          </td>
          <td>{renderEntry ? renderEntry(k, v) : v}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default DicomMetadataPanel;
