// ─────────────────────────────────────────────────────────────────────────────
// src/components/newViewer.tsx
// ─────────────────────────────────────────────────────────────────────────────
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
/*  Utility helpers                                                           */
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
  const pixelData =
    bitsAllocated === 16
      ? new Uint16Array(byteArray, offset, frameLen / 2)
      : new Uint8Array(byteArray, offset, frameLen);

  const metadata = {
    patientId: dataSet.string("x00100020") || "Unknown",
    patientName: dataSet.string("x00100010") || "Unknown",
    patientSex: dataSet.string("x00100040") || "Unknown",
    studyDate: dataSet.string("x00080020") || "Unknown",
    studyDescription: dataSet.string("x00081030") || "Unknown",
    seriesDescription: dataSet.string("x0008103E") || "Unknown",
    manufacturer: dataSet.string("x00080070") || "Unknown",
  } as const;

  const image = await imageFromPixelData(cols, rows, pixelData, bitsAllocated);
  return { image, metadata } as const;
}

/* -------------------------------------------------------------------------- */
/*  Public component                                                          */
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

/* --- overlay data‑structures --------------------------------------------- */
type Measurement = { p1: Point; p2: Point };
type Annotation  = { id: number; x: number; y: number; text: string };

/* --- handles exposed to parent ------------------------------------------- */
export interface ViewerHandles {
  zoomIn: () => void;
  zoomOut: () => void;
  brightnessUp: () => void;
  brightnessDown: () => void;
  flipHorizontal: () => void;
  flipVertical: () => void;
  resetView: () => void;
}

/* --- props ---------------------------------------------------------------- */
export interface ViewerProps {
  series: SeriesInfo | null;
  onMetadataExtracted?: (md: Metadata) => void;
  brightnessMode?: boolean;
  measurementMode?: boolean;    // righe + label distanza
  annotationMode?: boolean;     // marker + testo
}

/* ========================================================================== */
/*                            COMPONENT                                       */
/* ========================================================================== */

const NewViewer = forwardRef<ViewerHandles, ViewerProps>(
  (
    {
      series,
      onMetadataExtracted,
      brightnessMode = false,
      measurementMode = false,
      annotationMode = false,
    },
    ref,
  ) => {
    /* ---------------------------------------------------------------------- */
    /* 1. blocca lo scroll della pagina                                        */
    /* ---------------------------------------------------------------------- */
    const containerRef = useRef<HTMLDivElement>(null);
    const viewportRef  = useRef<FrameViewportRef>(null);

    useEffect(() => {
      const stopScroll = (e: WheelEvent) => {
        const el = containerRef.current;
        if (el && el.contains(e.target as Node)) e.preventDefault();
      };
      window.addEventListener("wheel", stopScroll, { passive: false });
      return () => window.removeEventListener("wheel", stopScroll);
    }, []);

    /* ---------------------------------------------------------------------- */
    /* 2. varianti schema‑driven                                              */
    /* ---------------------------------------------------------------------- */
    const variant = useComponentVariant<{
      showControls: string[];
      overlayCircles: boolean;
    }>("NewViewer");

    const showSlider   = variant.showControls?.includes("slider");
    const showFpsInput = variant.showControls?.includes("fpsInput");
    const showLoopBtn  = variant.showControls?.includes("loopButton");

    const imageFilePaths = series?.imageFilePaths ?? [];
    const numberOfImages = series?.numberOfImages ?? 0;

    /* ---------------------------------------------------------------------- */
    /* 3. stato generale viewport                                             */
    /* ---------------------------------------------------------------------- */
    const [idx, setIdx] = useState(0);
    const [frames, setFrames] = useState<(HTMLImageElement | null)[]>(
      () => Array(imageFilePaths.length).fill(null),
    );
    const [loadedCount, setLoadedCount] = useState(0);
    const [isLooping, setIsLooping]     = useState(false);
    const [fps, setFps]                 = useState(20);

    const [zoomStep, setZoomStep] = useState(0);
    const [panFactor, setPanFactor] = useState<{ x: number; y: number }>({
      x: 0,
      y: 0,
    });

    const [brightness, setBrightness] = useState(50);
    const [contrast,   setContrast]   = useState(50);

    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);

    /* ---------------------------------------------------------------------- */
    /* 4. stato measurements + annotations                                    */
    /* ---------------------------------------------------------------------- */
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [tempPoint, setTempPoint]       = useState<Point | null>(null);
    const [previewPoint, setPreviewPoint] = useState<Point | null>(null);

    const [annotations, setAnnotations]   = useState<Annotation[]>([]);

    useEffect(() => {
      if (!measurementMode) {
        setTempPoint(null);
        setPreviewPoint(null);
      }
    }, [measurementMode]);

    /* ---------------------------------------------------------------------- */
    /* 5. imperative handles                                                  */
    /* ---------------------------------------------------------------------- */
    useImperativeHandle(
      ref,
      () => ({
        zoomIn:        () => setZoomStep((z) => Math.min(z + 1, 10)),
        zoomOut:       () => setZoomStep((z) => Math.max(z - 1, 0)),
        brightnessUp:  () => setBrightness((b) => Math.min(b + 10, 100)),
        brightnessDown:() => setBrightness((b) => Math.max(b - 10, 0)),
        flipHorizontal:() => setFlipH((f) => !f),
        flipVertical:  () => setFlipV((f) => !f),
        resetView: () => {
          setZoomStep(0);
          setPanFactor({ x: 0, y: 0 });
          setBrightness(50);
          setContrast(50);
          setFlipH(false);
          setFlipV(false);
          setMeasurements([]);
          setAnnotations([]);
          setTempPoint(null);
          setPreviewPoint(null);
        },
      }),
      [],
    );

    /* ---------------------------------------------------------------------- */
    /* 6. caricamento frames                                                  */
    /* ---------------------------------------------------------------------- */
    const firstFrameUrl = imageFilePaths[0] ?? "";
    useEffect(() => {
      if (!firstFrameUrl) return;
      let cancelled = false;

      setIdx(0);
      setFrames(Array(imageFilePaths.length).fill(null));
      setLoadedCount(0);
      setZoomStep(0);
      setPanFactor({ x: 0, y: 0 });
      setBrightness(50);
      setContrast(50);
      setFlipH(false);
      setFlipV(false);
      setMeasurements([]);
      setAnnotations([]);
      setTempPoint(null);
      setPreviewPoint(null);

      (async () => {
        try {
          const { image, metadata } = await loadDicomImage(firstFrameUrl);
          if (cancelled) return;
          setFrames((prev) => {
            const nxt = [...prev];
            nxt[0] = image;
            return nxt;
          });
          setLoadedCount(1);
          onMetadataExtracted?.(metadata);
        } catch (err) {
          console.error("[NewViewer] failed to load initial frame", err);
        }
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
          setFrames((prev) => {
            const nxt = [...prev];
            nxt[idx] = image;
            return nxt;
          });
          setLoadedCount((c) => c + 1);
        } catch (err) {
          console.error(`[NewViewer] failed to load frame ${idx}`, err);
        }
      })();

      return () => { cancelled = true; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx, frames[idx]]);

    const displayed = useMemo<HTMLImageElement | null>(() => {
      if (!series) return null;
      return frames[idx] ?? frames[0];
    }, [series, frames, idx]);

    /* ---------------------------------------------------------------------- */
    /* 7. handlers pointer                                                    */
    /* ---------------------------------------------------------------------- */
    const handlePointerDown = useCallback(
      (ev: ViewportPointerEvent) => {
        if (!ev.isOverImage || ev.button !== 0) return;

        /* -- Annotation Mode ------------------------------------------------ */
        if (annotationMode) {
          const { x, y } = ev.position;
          const text = prompt("Annotation text?") ?? "";
          setAnnotations((prev) => [
            ...prev,
            { id: Date.now(), x, y, text },
          ]);
          return;
        }

        /* -- Measurement Mode ---------------------------------------------- */
        if (measurementMode) {
          const pt = ev.position;
          if (!tempPoint) {
            setTempPoint(pt);
            setPreviewPoint(null);
          } else {
            setMeasurements((m) => [...m, { p1: tempPoint, p2: pt }]);
            setTempPoint(null);
            setPreviewPoint(null);
          }
        }
      },
      [annotationMode, measurementMode, tempPoint],
    );

    const handlePointerMove = useCallback(
      (ev: ViewportPointerEvent) => {
        if (!measurementMode || !tempPoint) return;
        setPreviewPoint(ev.position);
      },
      [measurementMode, tempPoint],
    );

    /* ---------------------------------------------------------------------- */
    /* 8. overlays                                                            */
    /* ---------------------------------------------------------------------- */
    const measurementOverlays = useMemo(() => {
      if (!measurementMode) return null;

      const items: React.ReactNode[] = [];

      const addMeasure = (m: Measurement, preview = false, idx = 0) => {
        const { p1, p2 } = m;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const label = `${dist.toFixed(0)} px`;
        const mid: Point = { x: p1.x + dx / 2, y: p1.y + dy / 2 };

        items.push(
          <Polyline
            key={`pl-${preview ? "prev" : idx}`}
            points={`${p1.x},${p1.y} ${p2.x},${p2.y}`}
            stroke={preview ? "orange" : "#00eaff"}
            strokeWidth={preview ? 1.5 : 2}
            strokeDasharray={preview ? "4 4" : undefined}
          />,
        );
        items.push(
          <Circle
            key={`c1-${preview ? "prev" : idx}`}
            cx={p1.x}
            cy={p1.y}
            r={3}
            fill={preview ? "orange" : "#00eaff"}
          />,
        );
        items.push(
          <Circle
            key={`c2-${preview ? "prev" : idx}`}
            cx={p2.x}
            cy={p2.y}
            r={3}
            fill={preview ? "orange" : "#00eaff"}
          />,
        );
        items.push(
          <Text
            key={`txt-${preview ? "prev" : idx}`}
            x={mid.x}
            y={mid.y - 8}
            fontSize={12}
            fill={preview ? "orange" : "white"}
            textAnchor="middle"
          >
            {label}
          </Text>,
        );
      };

      measurements.forEach((m, i) => addMeasure(m, false, i));
      if (tempPoint && previewPoint) {
        addMeasure({ p1: tempPoint, p2: previewPoint }, true);
      }
      return items;
    }, [measurementMode, measurements, tempPoint, previewPoint]);

    const annotationOverlays = useMemo(
      () =>
        annotationMode
          ? annotations.flatMap((a) => [
              <Circle key={`c-${a.id}`} cx={a.x} cy={a.y} r={5} fill="yellow" />,
              <Text
                key={`t-${a.id}`}
                x={a.x + 8}
                y={a.y - 8}
                fontSize={12}
                fill="yellow"
              >
                {a.text}
              </Text>,
            ])
          : null,
      [annotationMode, annotations],
    );

    /* ---------------------------------------------------------------------- */
    /* 9. rendering                                                           */
    /* ---------------------------------------------------------------------- */
    if (!series)
      return (
        <div className="dicom-viewer-container">Seleziona una serie…</div>
      );
    if (!displayed)
      return (
        <div className="dicom-viewer-container">Caricamento immagini…</div>
      );

    return (
      <div
        ref={containerRef}
        className="dicom-viewer-container"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overscrollBehavior: "contain",
        }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <FrameViewport
            ref={viewportRef}
            frame={displayed}
            cursor={{
              imageArea:
                annotationMode || measurementMode ? "crosshair" : "default",
              viewportArea: annotationMode ? "crosshair" : "default",
            }}
            zoomStep={zoomStep}
            panFactor={panFactor}
            brightness={brightness}
            contrast={contrast}
            flipHorizontal={flipH}
            flipVertical={flipV}
            onZoomStepChange={(z) => setZoomStep(z)}
            onPanFactorChange={(p) => setPanFactor(p)}
            onBrightnessChange={
              brightnessMode ? (b) => setBrightness(b) : undefined
            }
            onContrastChange={
              brightnessMode ? (c) => setContrast(c) : undefined
            }
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
          >
            {/* cerchio debug da schema */}
            {variant.overlayCircles && (
              <Circle
                cx={displayed.naturalWidth / 2}
                cy={displayed.naturalHeight / 2}
                r={4}
              />
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
            onFrameIndexChange={(n) =>
              setIdx(Math.max(0, Math.min(n, numberOfImages - 1)))
            }
            onIsLoopingChange={
              showLoopBtn ? (l) => setIsLooping(l) : undefined
            }
            onFrameRateChange={
              showFpsInput ? (v) => setFps(v) : undefined
            }
          />
        )}
      </div>
    );
  },
);

export default NewViewer;
