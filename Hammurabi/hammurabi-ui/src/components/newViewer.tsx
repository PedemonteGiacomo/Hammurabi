// ──────────────────────────────────────────────────────────────
// src/components/newViewer.tsx  ✔️ full‑metadata support + page‑scroll lock
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
import { Circle, Polyline, Text } from "../newViewport/components/Overlays";
import { Navigation } from "../newViewport/components/Navigation";
import { SeriesInfo } from "./NestedDicomTable";
import { useComponentVariant } from "../hooks/useComponentVariant";
import { Point, ViewportPointerEvent } from "../newViewport/types";
import { noop } from "framer-motion";

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
  return new Promise((r) => {
    const img = new Image();
    img.onload = () => r(img);
    img.src = canvas.toDataURL();
  });
}

async function loadDicomImage(filePath: string) {
  const url =
    window.location.origin +
    filePath
      .split("/")
      .map(encodeURIComponent)
      .join("/");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch ${url}: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const dataSet = dicomParser.parseDicom(new Uint8Array(buffer));

  const cols = dataSet.uint16("x00280011");
  const rows = dataSet.uint16("x00280010");
  const bitsAllocated = dataSet.uint16("x00280100");
  const pde = dataSet.elements.x7fe00010;
  if (!cols || !rows || !bitsAllocated || !pde)
    throw new Error("Missing DICOM image data");

  const frameLen = rows * cols * (bitsAllocated / 8);
  const byteArray = dataSet.byteArray.buffer;
  const pixelData =
    bitsAllocated === 16
      ? new Uint16Array(byteArray, pde.dataOffset, frameLen / 2)
      : new Uint8Array(byteArray, pde.dataOffset, frameLen);

  const image = await imageFromPixelData(cols, rows, pixelData, bitsAllocated);

  /* ───── full metadata pass-through (subset categorised) ───── */
  const metadata: Record<string, any> = {
    /* patient / study / series */
    specificCharacterSet: dataSet.string("x00080005"),
    imageType: dataSet.string("x00080008")?.split("\\"),
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
    referencedImageSequence: dataSet.string("x00081140"),

    /* patient identity */
    patientName: dataSet.string("x00100010"),
    patientId: dataSet.string("x00100020"),
    patientBirthDate: dataSet.string("x00100030"),
    patientSex: dataSet.string("x00100040"),

    /* private tags */
    privateCreator: dataSet.string("x00110010"),
    userData: dataSet.elements.x00111001,
    normalizationCoefficient: dataSet.string("x00111002"),
    receivingGain: dataSet.uint16("x00111003"),
    meanImageNoise: dataSet.string("x00111004"),
    privateTagData: dataSet.string("x00111008"),

    /* imaging parameters */
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
    inPlanePhaseEncodingDirection: dataSet.string("x00181312"),
    flipAngle: dataSet.string("x00181314"),
    patientPosition: dataSet.string("x00185100"),

    /* identifiers */
    studyInstanceUID: dataSet.string("x0020000D"),
    seriesInstanceUID: dataSet.string("x0020000E") || dataSet.string("x0020000e"),
    studyID: dataSet.string("x00200010"),
    seriesNumber: dataSet.string("x00200011"),
    instanceNumber: dataSet.string("x00200013"),
    frameOfReferenceUID: dataSet.string("x00200052"),
    imagesInAcquisition: dataSet.string("x00201002"),
    positionReferenceIndicator: dataSet.string("x00201040"),
    sliceLocation: dataSet.string("x00201041"),

    /* geometry & pixmap */
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

    /* performed procedure step */
    performedProcedureStepStartDate: dataSet.string("x00400244"),
    performedProcedureStepStartTime: dataSet.string("x00400245"),
    performedProcedureStepID: dataSet.string("x00400253"),
  };

  return { image, metadata } as const;
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
export type Metadata = Record<string, any>; // full dynamic map
interface Measurement { p1: Point; p2: Point; }
interface Annotation  { id: number; x: number; y: number; text: string; }

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
  /* modes */
  brightnessMode?: boolean;
  measurementMode?: boolean;
  annotationMode?: boolean;
  panMode?: boolean;
  /* initial values */
  initialFrame?: number;
  initialZoomStep?: number;
  initialBrightness?: number;
  initialContrast?: number;
  fps?: number;
  loop?: boolean;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  /* UI */
  showSlider?: boolean;
  showFpsInput?: boolean;
  showLoopBtn?: boolean;
  overlayCircles?: boolean;
  onMetadataExtracted?: (md: Metadata) => void;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
const NewViewer = forwardRef<ViewerHandles, ViewerProps>((props, ref) => {
  /* ── unpack / variant merge ── */
  const variant = useComponentVariant<{
    showControls: string[];
    overlayCircles: boolean;
  }>("NewViewer");

  const {
    series,
    brightnessMode = false,
    measurementMode = false,
    annotationMode = false,
    panMode = false,

    initialFrame = 0,
    initialZoomStep = 0,
    initialBrightness = 96,
    initialContrast = 50,
    fps: fpsProp = 20,
    loop = false,
    flipHorizontal = false,
    flipVertical = false,

    showSlider: showSliderProp,
    showFpsInput: showFpsInputProp,
    showLoopBtn: showLoopBtnProp,
    overlayCircles: overlayCirclesProp,

    onMetadataExtracted,
  } = props;

  const showSlider   = showSliderProp   ?? variant.showControls.includes("slider");
  const showFpsInput = showFpsInputProp ?? variant.showControls.includes("fpsInput");
  const showLoopBtn  = showLoopBtnProp  ?? variant.showControls.includes("loopButton");
  const overlayCircles = overlayCirclesProp ?? variant.overlayCircles ?? false;

  const paths    = series?.imageFilePaths ?? [];
  const nFrames  = series?.numberOfImages ?? 0;

  /* ── state ── */
  const [idx, setIdx]               = useState(initialFrame);
  const [frames, setFrames]         = useState<(HTMLImageElement | null)[]>(() => Array(paths.length).fill(null));
  const [loadedCount, setLoaded]    = useState(0);
  const [allLoaded,  setAllLoaded]  = useState(false);
  const [isLooping,  setIsLooping]  = useState(loop);
  const [fps,       setFps]         = useState(fpsProp);

  const [zoomStep,   setZoomStep]   = useState(initialZoomStep);
  const [panFactor,  setPanFactor]  = useState<{x:number;y:number}>({ x: 0, y: 0 });

  const [brightness, setBrightness] = useState(initialBrightness);
  const [contrast,   setContrast]   = useState(initialContrast);

  const [flipH, setFlipH]           = useState(flipHorizontal);
  const [flipV, setFlipV]           = useState(flipVertical);

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [tempPoint,    setTempPoint]    = useState<Point|null>(null);
  const [previewPoint, setPreviewPoint] = useState<Point|null>(null);
  const [annotations,  setAnnotations]  = useState<Annotation[]>([]);

  /* ── refs ── */
  const viewportRef  = useRef<FrameViewportRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── lock page scroll (global wheel listener) ── */
  useEffect(() => {
    const stopScroll = (e: WheelEvent) => {
      const el = containerRef.current;
      if (el && el.contains(e.target as Node)) {
        e.preventDefault(); // blocca lo scroll della pagina
      }
    };
    window.addEventListener("wheel", stopScroll, { passive: false });
    return () => window.removeEventListener("wheel", stopScroll);
  }, []);

  /* ── imperative handles ── */
  useImperativeHandle(ref, () => ({
    zoomIn: () => setZoomStep((z) => Math.min(z + 1, 10)),
    zoomOut: () => setZoomStep((z) => Math.max(z - 1, 0)),
    brightnessUp: () => setBrightness((b) => Math.min(b + 10, 100)),
    brightnessDown: () => setBrightness((b) => Math.max(b - 10, 0)),
    flipHorizontal: () => setFlipH((f) => !f),
    flipVertical: () => setFlipV((f) => !f),
    resetView: () => {
      setZoomStep(initialZoomStep);
      setPanFactor({ x: 0, y: 0 });
      setBrightness(initialBrightness);
      setContrast(initialContrast);
      setFlipH(flipHorizontal);
      setFlipV(flipVertical);
      setMeasurements([]);
      setAnnotations([]);
      setTempPoint(null);
      setPreviewPoint(null);
      setIdx(initialFrame);
    },
  }), [flipHorizontal, flipVertical, initialBrightness, initialContrast, initialFrame, initialZoomStep]);

  /* ── load images ── */
  useEffect(() => {
    if (!series) return;
    let cancel = false;

    setIdx(initialFrame);
    setFrames(Array(nFrames).fill(null));
    setLoaded(0);
    setAllLoaded(false);

    (async () => {
      const tasks = paths.map((p, i) =>
        loadDicomImage(p)
          .then(({ image, metadata }) => {
            if (cancel) return;
            setFrames((f) => {
              const nxt = [...f];
              nxt[i] = image;
              return nxt;
            });
            setLoaded((c) => {
              const nxt = c + 1;
              if (i === 0) onMetadataExtracted?.(metadata);
              return nxt;
            });
          })
          .catch(console.error),
      );
      await Promise.all(tasks);
      if (!cancel) setAllLoaded(true);
    })();

    return () => { cancel = true; };
  }, [series, paths, nFrames, initialFrame, onMetadataExtracted]);

  const displayed = useMemo(() => (series ? frames[idx] ?? frames[0] : null), [series, frames, idx]);

  /* ── pointer handlers ── */
  const handlePointerDown = useCallback((ev: ViewportPointerEvent) => {
    if (!ev.isOverImage || ev.button !== 0) return;
    if (panMode) return;

    if (annotationMode) {
      const text = prompt("Annotation text?") ?? "";
      setAnnotations((a) => [...a, { id: Date.now(), x: ev.position.x, y: ev.position.y, text }]);
      return;
    }

    if (measurementMode) {
      if (!tempPoint) {
        setTempPoint(ev.position);
        setPreviewPoint(null);
      } else {
        setMeasurements((m) => [...m, { p1: tempPoint, p2: ev.position }]);
        setTempPoint(null);
        setPreviewPoint(null);
      }
    }
  }, [annotationMode, measurementMode, panMode, tempPoint]);

  const handlePointerMove = useCallback((ev: ViewportPointerEvent) => {
    if (measurementMode && tempPoint) setPreviewPoint(ev.position);
  }, [measurementMode, tempPoint]);

  /* ── overlays ── */
  const measurementOverlays = useMemo(() => {
    if (!measurementMode && measurements.length === 0) return null;
    const items: React.ReactNode[] = [];
    const add = (m: Measurement, prev: boolean, k: string) => {
      const { p1, p2 } = m;
      const dx = p2.x - p1.x,
        dy = p2.y - p1.y;
      const mid = { x: p1.x + dx / 2, y: p1.y + dy / 2 };
      items.push(
        <Polyline key={`pl-${k}`} points={`${p1.x},${p1.y} ${p2.x},${p2.y}`} stroke={prev ? "orange" : "#00eaff"} strokeWidth={prev ? 1.5 : 2} strokeDasharray={prev ? "4 4" : undefined} />,
        <Circle key={`c1-${k}`} cx={p1.x} cy={p1.y} r={3} fill="#00eaff" />,
        <Circle key={`c2-${k}`} cx={p2.x} cy={p2.y} r={3} fill="#00eaff" />,
      );
    };
    measurements.forEach((m, i) => add(m, false, String(i)));
    if (tempPoint && previewPoint) add({ p1: tempPoint, p2: previewPoint }, true, "prev");
    return items;
  }, [measurements, measurementMode, tempPoint, previewPoint]);

  const annotationOverlays = useMemo(() => (
    annotationMode ? annotations.flatMap((a) => [
      <Circle key={`ac-${a.id}`} cx={a.x} cy={a.y} r={5} fill="yellow" />,
      <Text key={`at-${a.id}`} x={a.x + 8} y={a.y - 8} fontSize={12} fill="yellow">{a.text}</Text>,
    ]) : null
  ), [annotationMode, annotations]);

  /* ── fallbacks ── */
  if (!series)    return <div className="dicom-viewer-container">Seleziona una serie…</div>;
  if (!displayed) return <div className="dicom-viewer-container">Caricamento immagini…</div>;

  /* ── render ── */
  return (
    <div
      ref={containerRef}
      className="dicom-viewer-container"
      style={{ display: "flex", flexDirection: "column", height: "100%", overscrollBehavior: "contain" }}
    >
      <div style={{ flex: 1, position: "relative" }}>
        <FrameViewport
          ref={viewportRef}
          frame={displayed}
          cursor={{ imageArea: panMode ? "grab" : "crosshair", viewportArea: panMode ? "grab" : "crosshair" }}
          zoomStep={zoomStep}
          panFactor={panFactor}
          brightness={brightness}
          contrast={contrast}
          flipHorizontal={flipH}
          flipVertical={flipV}
          onZoomStepChange={setZoomStep}
          onPanFactorChange={brightnessMode ? noop : setPanFactor}
          onBrightnessChange={brightnessMode ? setBrightness : undefined}
          onContrastChange={brightnessMode ? setContrast : undefined}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
        >
          {overlayCircles && <Circle cx={displayed.naturalWidth / 2} cy={displayed.naturalHeight / 2} r={4} />}
          {measurementOverlays}
          {annotationOverlays}
        </FrameViewport>
      </div>

      {showSlider && (
        <Navigation
          frameIndex={idx}
          numberOfFrames={nFrames}
          numberOfAvailableFrames={loadedCount}
          isLooping={showLoopBtn ? isLooping && allLoaded : false}
          frameRate={showFpsInput ? fps : 20}
          hasArrowButtons
          onFrameIndexChange={(n) => setIdx(Math.max(0, Math.min(n, nFrames - 1)))}
          onIsLoopingChange={showLoopBtn ? setIsLooping : undefined}
          onFrameRateChange={showFpsInput ? setFps : undefined}
        />
      )}
    </div>
  );
});

export default NewViewer;
