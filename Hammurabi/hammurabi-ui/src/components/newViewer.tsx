// ──────────────────────────────────────────────────────────────
// src/components/newViewer.tsx
// ──────────────────────────────────────────────────────────────
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";
import dicomParser from "dicom-parser";

import {
  FrameViewport,
  type FrameViewportRef,
} from "../newViewport/components/FrameViewport";
import {
  Circle,
  Polyline,
  Text,
} from "../newViewport/components/Overlays";
import { Navigation } from "../newViewport/components/Navigation";
import { SeriesInfo } from "./NestedDicomTable";
import { useComponentVariant } from "../hooks/useComponentVariant";
import {
  Point,
  ViewportPointerEvent,
} from "../newViewport/types";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

async function imageFromPixelData(
  width: number,
  height: number,
  pixelData: Uint8Array | Uint16Array,
  bitsAllocated: number,
): Promise<HTMLImageElement> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to acquire 2D context");

  const imageData = ctx.createImageData(width, height);
  const out = imageData.data;
  const maxSampleValue = bitsAllocated === 16 ? 65535 : 255;

  for (let i = 0; i < pixelData.length; i++) {
    const v =
      bitsAllocated === 16
        ? (pixelData as Uint16Array)[i]
        : (pixelData as Uint8Array)[i];
    const v8 = (v / maxSampleValue) * 255;
    const o = i * 4;
    out[o] = out[o + 1] = out[o + 2] = v8;
    out[o + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = canvas.toDataURL();
  });
}

async function loadDicomImage(filePath: string) {
  const encodedPath = filePath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  const url = `${window.location.origin}${encodedPath}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}, status ${res.status}`);
  }
  const buffer = await res.arrayBuffer();
  const dataSet = dicomParser.parseDicom(new Uint8Array(buffer));

  const cols = dataSet.uint16("x00280011");
  const rows = dataSet.uint16("x00280010");
  const bitsAllocated = dataSet.uint16("x00280100");
  const pde = dataSet.elements.x7fe00010;
  if (cols == null || rows == null || bitsAllocated == null || !pde) {
    throw new Error("Missing DICOM image data");
  }

  const offset = pde.dataOffset;
  const frameLen = rows * cols * (bitsAllocated / 8);
  const byteArray = dataSet.byteArray.buffer;
  const pixelData = bitsAllocated === 16
    ? new Uint16Array(byteArray, offset, frameLen / 2)
    : new Uint8Array(byteArray, offset, frameLen);

  const metadata = {
    // — patient & study & series basics —
    specificCharacterSet: dataSet.string("x00080005"),
    imageType: dataSet.string("x00080008")?.split("\\") || undefined,
    sopClassUID: dataSet.string("x00080016"),
    sopInstanceUID: dataSet.string("x00080018"),
    studyDate: dataSet.string("x00080020"),
    seriesDate: dataSet.string("x00080021"),
    acquisitionDate: dataSet.string("x00080022"),
    contentDate: dataSet.string("x00080023"),
    studyTime: dataSet.string("x00080030"),
    seriesTime: dataSet.string("x00080031"),
    acquisitionTime: dataSet.string("x00080032"),
    contentTime: dataSet.string("x00080033"),
    accessionNumber: dataSet.string("x00080050"),
    modality: dataSet.string("x00080060"),
    manufacturer: dataSet.string("x00080070"),
    referringPhysicianName: dataSet.string("x00080090"),
    stationName: dataSet.string("x00081010"),
    studyDescription: dataSet.string("x00081030") || dataSet.string("x00181030"),
    seriesDescription: dataSet.string("x0008103E") || dataSet.string("x0008103e"),
    manufacturerModelName: dataSet.string("x00081090"),
    referencedImageSequence: dataSet.elements.x00081140 && dataSet.string("x00081140"),

    // — patient identity —
    patientName: dataSet.string("x00100010"),
    patientId: dataSet.string("x00100020"),
    patientBirthDate: dataSet.string("x00100030"),
    patientSex: dataSet.string("x00100040"),

    // — private tags (if you want) —
    privateCreator: dataSet.string("x00110010"),
    userData: dataSet.elements.x00111001,
    normalizationCoefficient: dataSet.string("x00111002"),
    receivingGain: dataSet.elements.x00111003 && dataSet.uint16("x00111003"),
    meanImageNoise: dataSet.string("x00111004"),
    privateTagData: dataSet.string("x00111008"),

    // — imaging parameters —
    bodyPartExamined: dataSet.string("x00180015"),
    scanningSequence: dataSet.string("x00180020"),
    sequenceVariant: dataSet.string("x00180021"),
    scanOptions: dataSet.string("x00180022"),
    mRAcquisitionType: dataSet.string("x00180023"),
    sequenceName: dataSet.string("x00180024"),
    sliceThickness: dataSet.string("x00180050"),
    repetitionTime: dataSet.string("x00180080"),
    echoTime: dataSet.string("x00180081"),
    numberOfAverages: dataSet.string("x00180083"),
    imagingFrequency: dataSet.string("x00180084"),
    imagedNucleus: dataSet.string("x00180085"),
    echoNumbers: dataSet.string("x00180086"),
    magneticFieldStrength: dataSet.string("x00180087"),
    spacingBetweenSlices: dataSet.string("x00180088"),
    echoTrainLength: dataSet.string("x00180091"),
    pixelBandwidth: dataSet.string("x00180095"),
    deviceSerialNumber: dataSet.string("x00181000"),
    softwareVersions: dataSet.string("x00181020"),
    protocolName: dataSet.string("x00181030"),
    receiveCoilName: dataSet.string("x00181250"),
    acquisitionMatrix: dataSet.string("x00181310"),
    inPlanePhaseEncodingDirection:
      dataSet.string("x00181312"),
    flipAngle: dataSet.string("x00181314"),
    patientPosition: dataSet.string("x00185100"),

    // — study/series identifiers —
    studyInstanceUID: dataSet.string("x0020000D"),
    seriesInstanceUID: dataSet.string("x0020000E") || dataSet.string("x0020000e"),
    studyID: dataSet.string("x00200010"),
    seriesNumber: dataSet.string("x00200011"),
    instanceNumber: dataSet.string("x00200013"),
    frameOfReferenceUID: dataSet.string("x00200052"),
    imagesInAcquisition: dataSet.string("x00201002"),
    positionReferenceIndicator: dataSet.string("x00201040"),
    sliceLocation: dataSet.string("x00201041"),

    // — geometry & pixmap —
    imagePositionPatient: dataSet.string("x00200032")?.split("\\").map(Number),
    imageOrientationPatient: dataSet.string("x00200037")?.split("\\").map(Number),
    samplesPerPixel: dataSet.string("x00280002"),
    photometricInterpretation: dataSet.string("x00280004"),
    rows: dataSet.string("x00280010"),
    columns: dataSet.string("x00280011"),
    pixelSpacing: dataSet.string("x00280030")?.split("\\").map(Number),
    bitsAllocated: dataSet.string("x00280100"),
    bitsStored: dataSet.string("x00280101"),
    highBit: dataSet.string("x00280102"),
    pixelRepresentation: dataSet.string("x00280103"),
    windowCenter: dataSet.string("x00281050"),
    windowWidth: dataSet.string("x00281051"),
    lossyImageCompression: dataSet.string("x00282110"),

    // — performed procedure step —
    performedProcedureStepStartDate:
      dataSet.string("x00400244"),
    performedProcedureStepStartTime:
      dataSet.string("x00400245"),
    performedProcedureStepID: dataSet.string("x00400253"),
  } as const;


  const image = await imageFromPixelData(cols, rows, pixelData, bitsAllocated);
  return { image, metadata } as const;
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface Metadata {
  patientId?: string;
  patientName?: string;
  patientSex?: string;
  studyDate?: string;
  studyDescription?: string;
  seriesDescription?: string;
  manufacturer?: string;
}

type Measurement = { p1: Point; p2: Point };
type Annotation = { id: number; x: number; y: number; text: string };

export interface ViewerHandles {
  zoomIn: () => void;
  zoomOut: () => void;
  brightnessUp: () => void;
  brightnessDown: () => void;
  flipHorizontal: () => void;
  flipVertical: () => void;
  resetView: () => void;
}

export interface ViewerProps {
  series: SeriesInfo | null;
  onMetadataExtracted?: (md: Metadata) => void;
  brightnessMode?: boolean;
  measurementMode?: boolean;
  annotationMode?: boolean;
  panMode?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

const NewViewer = forwardRef<ViewerHandles, ViewerProps>(
  (
    {
      series,
      onMetadataExtracted,
      brightnessMode = false,
      measurementMode = false,
      annotationMode = false,
      panMode = false,
    },
    ref,
  ) => {
    /* ───── schema variant ───── */
    const variant = useComponentVariant<{
      showControls: string[];
      overlayCircles: boolean;
    }>("NewViewer");

    const showSlider = variant.showControls?.includes("slider");
    const showFpsInput = variant.showControls?.includes("fpsInput");
    const showLoopBtn = variant.showControls?.includes("loopButton");

    const imageFilePaths = series?.imageFilePaths ?? [];
    const numberOfImages = series?.numberOfImages ?? 0;

    /* ───── viewport state ───── */
    const [idx, setIdx] = useState(0);
    const [frames, setFrames] = useState<(HTMLImageElement | null)[]>(() =>
      Array(imageFilePaths.length).fill(null));
    const [loadedCount, setLoaded] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [fps, setFps] = useState(20);

    const [zoomStep, setZoomStep] = useState(0);
    const [panFactor, setPanFactor] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const [brightness, setBrightness] = useState(50);
    const [contrast, setContrast] = useState(50);

    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);

    /* ───── overlays state ───── */
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [tempPoint, setTempPoint] = useState<Point | null>(null);
    const [previewPoint, setPreviewPoint] = useState<Point | null>(null);

    const [annotations, setAnnotations] = useState<Annotation[]>([]);

    /* ───── refs ───── */
    const containerRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<FrameViewportRef>(null);
    const prevZoomWhenPan = useRef<number>(0);

    /* -------------------------------------------------------------------- */
    /*  Scroll lock                                                         */
    /* -------------------------------------------------------------------- */
    useEffect(() => {
      const stop = (e: WheelEvent) => {
        if (containerRef.current?.contains(e.target as Node)) e.preventDefault();
      };
      window.addEventListener("wheel", stop, { passive: false });
      return () => window.removeEventListener("wheel", stop);
    }, []);

    /* -------------------------------------------------------------------- */
    /*  Pan‑mode: forza zoom≥1                                              */
    /* -------------------------------------------------------------------- */
    useEffect(() => {
      if (panMode) {
        if (zoomStep === 0) {
          prevZoomWhenPan.current = 0;
          setZoomStep(1);
        }
      } else {
        if (prevZoomWhenPan.current === 0 && zoomStep === 1) {
          setZoomStep(0);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panMode]);

    /* -------------------------------------------------------------------- */
    /*  Imperative handles                                                  */
    /* -------------------------------------------------------------------- */
    useImperativeHandle(ref, () => ({
      zoomIn: () => setZoomStep(z => Math.min(z + 1, 10)),
      zoomOut: () => setZoomStep(z => Math.max(z - 1, 0)),
      brightnessUp: () => setBrightness(b => Math.min(b + 10, 100)),
      brightnessDown: () => setBrightness(b => Math.max(b - 10, 0)),
      flipHorizontal: () => setFlipH(f => !f),
      flipVertical: () => setFlipV(f => !f),
      resetView: () => {
        setZoomStep(0); setPanFactor({ x: 0, y: 0 });
        setBrightness(50); setContrast(50);
        setFlipH(false); setFlipV(false);
        setMeasurements([]); setAnnotations([]);
        setTempPoint(null); setPreviewPoint(null);
      }
    }), []);

    /* -------------------------------------------------------------------- */
    /*  Frame loading                                                       */
    /* -------------------------------------------------------------------- */
    const firstFrameUrl = imageFilePaths[0] ?? "";
    useEffect(() => {
      if (!firstFrameUrl) return;
      let cancelled = false;

      // reset stato
      setIdx(0); setFrames(Array(imageFilePaths.length).fill(null));
      setLoaded(0); setZoomStep(0); setPanFactor({ x: 0, y: 0 });
      setBrightness(50); setContrast(50);
      setFlipH(false); setFlipV(false);
      setMeasurements([]); setAnnotations([]);
      setTempPoint(null); setPreviewPoint(null);

      (async () => {
        try {
          const { image, metadata } = await loadDicomImage(firstFrameUrl);
          if (cancelled) return;
          setFrames(p => { const n = [...p]; n[0] = image; return n; });
          setLoaded(1);
          onMetadataExtracted?.(metadata);
        } catch (err) { console.error("[NewViewer] first frame", err); }
      })();

      return () => { cancelled = true; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstFrameUrl]);

    useEffect(() => {
      if (!series || idx === 0 || frames[idx]) return;
      let cancelled = false;
      (async () => {
        try {
          const { image } = await loadDicomImage(imageFilePaths[idx]);
          if (cancelled) return;
          setFrames(p => { const n = [...p]; n[idx] = image; return n; });
          setLoaded(c => c + 1);
        } catch (err) { console.error(`[NewViewer] frame ${idx}`, err); }
      })();
      return () => { cancelled = true; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx, frames[idx]]);

    const displayed = useMemo(() => {
      if (!series) return null;
      return frames[idx] ?? frames[0];
    }, [series, frames, idx]);

    /* -------------------------------------------------------------------- */
    /*  Pointer handlers                                                    */
    /* -------------------------------------------------------------------- */
    const handlePointerDown = useCallback((ev: ViewportPointerEvent) => {
      if (!ev.isOverImage || ev.button !== 0) return;
      if (panMode) return; // drag gestito nativamente

      if (annotationMode) {
        const { x, y } = ev.position;
        const text = prompt("Annotation text?") ?? "";
        setAnnotations(a => [...a, { id: Date.now(), x, y, text }]);
        return;
      }

      if (measurementMode) {
        if (!tempPoint) {
          setTempPoint(ev.position);
          setPreviewPoint(null);
        } else {
          setMeasurements(m => [...m, { p1: tempPoint, p2: ev.position }]);
          setTempPoint(null); setPreviewPoint(null);
        }
      }
    }, [annotationMode, measurementMode, tempPoint, panMode]);

    const handlePointerMove = useCallback((ev: ViewportPointerEvent) => {
      if (measurementMode && tempPoint) {
        setPreviewPoint(ev.position);
      }
    }, [measurementMode, tempPoint]);

    /* -------------------------------------------------------------------- */
    /*  Overlays                                                            */
    /* -------------------------------------------------------------------- */
    const measurementOverlays = useMemo(() => {
      if (!measurementMode) return null;
      const items: React.ReactNode[] = [];
      const add = (m: Measurement, prev: boolean, i: number) => {
        const { p1, p2 } = m;
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mid: { x: number; y: number } = { x: p1.x + dx / 2, y: p1.y + dy / 2 };

        items.push(
          <Polyline key={`pl-${prev ? 'prev' : i}`}
            points={`${p1.x},${p1.y} ${p2.x},${p2.y}`}
            stroke={prev ? "orange" : "#00eaff"}
            strokeWidth={prev ? 1.5 : 2}
            strokeDasharray={prev ? "4 4" : undefined} />
        );
        items.push(<Circle key={`c1-${prev ? 'prev' : i}`} cx={p1.x} cy={p1.y} r={3}
          fill={prev ? "orange" : "#00eaff"} />);
        items.push(<Circle key={`c2-${prev ? 'prev' : i}`} cx={p2.x} cy={p2.y} r={3}
          fill={prev ? "orange" : "#00eaff"} />);
        items.push(<Text key={`t-${prev ? 'prev' : i}`} x={mid.x} y={mid.y - 8}
          fontSize={12} fill={prev ? "orange" : "white"} textAnchor="middle">
          {`${dist.toFixed(0)} px`}
        </Text>);
      };
      measurements.forEach((m, i) => add(m, false, i));
      if (tempPoint && previewPoint) add({ p1: tempPoint, p2: previewPoint }, true, 0);
      return items;
    }, [measurementMode, measurements, tempPoint, previewPoint]);

    const annotationOverlays = useMemo(() => (
      annotationMode
        ? annotations.flatMap(a => [
          <Circle key={`ac-${a.id}`} cx={a.x} cy={a.y} r={5} fill="yellow" />,
          <Text key={`at-${a.id}`} x={a.x + 8} y={a.y - 8}
            fontSize={12} fill="yellow">{a.text}</Text>,
        ])
        : null
    ), [annotationMode, annotations]);

    /* -------------------------------------------------------------------- */
    /*  Render                                                              */
    /* -------------------------------------------------------------------- */
    if (!series) return <div className="dicom-viewer-container">Seleziona una serie…</div>;
    if (!displayed) return <div className="dicom-viewer-container">Caricamento immagini…</div>;

    return (
      <div ref={containerRef} className="dicom-viewer-container"
        style={{ display: "flex", flexDirection: "column", height: "100%", overscrollBehavior: "contain" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <FrameViewport
            ref={viewportRef}
            frame={displayed}
            cursor={{
              imageArea: panMode ? "grab"
                : (annotationMode || measurementMode) ? "crosshair" : "default",
              viewportArea: panMode ? "grab" : "default",
            }}
            zoomStep={zoomStep}
            panFactor={panFactor}
            brightness={brightness}
            contrast={contrast}
            flipHorizontal={flipH}
            flipVertical={flipV}
            onZoomStepChange={setZoomStep}
            onPanFactorChange={setPanFactor}
            onBrightnessChange={brightnessMode ? setBrightness : undefined}
            onContrastChange={brightnessMode ? setContrast : undefined}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
          >
            {variant.overlayCircles && (
              <Circle cx={displayed.naturalWidth / 2}
                cy={displayed.naturalHeight / 2} r={4} />
            )}
            {measurementOverlays}
            {annotationOverlays}
          </FrameViewport>
        </div>

        {showSlider && (
          <Navigation
            frameIndex={idx}
            numberOfFrames={numberOfImages}
            numberOfAvailableFrames={loadedCount}
            isLooping={showLoopBtn ? isLooping : false}
            frameRate={showFpsInput ? fps : 20}
            hasArrowButtons
            onFrameIndexChange={n => setIdx(Math.max(0, Math.min(n, numberOfImages - 1)))}
            onIsLoopingChange={showLoopBtn ? setIsLooping : undefined}
            onFrameRateChange={showFpsInput ? setFps : undefined}
          />
        )}
      </div>
    );
  },
);

export default NewViewer;
