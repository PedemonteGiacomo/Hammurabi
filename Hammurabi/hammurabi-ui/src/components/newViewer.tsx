// src/components/newViewer.tsx

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
import { Navigation } from "../newViewport/components/Navigation";
import { Circle } from "../newViewport/components/Overlays";
import { SeriesInfo } from "./NestedDicomTable";
import { useComponentVariant } from "../hooks/useComponentVariant";

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
  console.log(`[NewViewer] fetch ${filePath}`);
  const encodedPath = filePath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  const url = `${window.location.origin}${encodedPath}`;
  console.log(`[NewViewer] fetching DICOM at ${url}`);
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

export interface ViewerHandles {
  zoomIn: () => void;
  zoomOut: () => void;
  brightnessUp: () => void;
  brightnessDown: () => void;
}

export interface ViewerProps {
  series: SeriesInfo | null;
  onMetadataExtracted?: (md: Metadata) => void;
  brightnessMode?: boolean;
}

const NewViewer = forwardRef<ViewerHandles, ViewerProps>(
  ({ series, onMetadataExtracted, brightnessMode = false }, ref) => {
    /* ───── schema‑driven variant ───── */
    const variant = useComponentVariant<{
      showControls: string[];
      overlayCircles: boolean;
    }>("NewViewer");

    const showSlider = variant.showControls?.includes("slider");
    const showFpsInput = variant.showControls?.includes("fpsInput");
    const showLoopButton = variant.showControls?.includes("loopButton");

    const imageFilePaths = series?.imageFilePaths ?? [];
    const numberOfImages = series?.numberOfImages ?? 0;

    /* ───── frame loading state ───── */
    const [idx, setIdx] = useState(0);
    const [frames, setFrames] = useState<(HTMLImageElement | null)[]>(() =>
      Array(imageFilePaths.length).fill(null),
    );
    const [loadedCount, setLoadedCount] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [fps, setFps] = useState(20);

    /* ───── zoom & pan state ───── */
    const [zoomStep, setZoomStep] = useState(0);
    const [panFactor, setPanFactor] = useState<{ x: number; y: number }>({
      x: 0,
      y: 0,
    });

    /* ───── brightness & contrast state ───── */
    const [brightness, setBrightness] = useState(50);
    const [contrast, setContrast] = useState(50);

    /* viewport ref */
    const viewportRef = useRef<FrameViewportRef>(null);

    /* expose controls */
    useImperativeHandle(
      ref,
      () => ({
        zoomIn: () => setZoomStep((z) => Math.min(z + 1, 10)),
        zoomOut: () => setZoomStep((z) => Math.max(z - 1, 0)),
        brightnessUp: () => setBrightness((b) => Math.min(b + 10, 100)),
        brightnessDown: () => setBrightness((b) => Math.max(b - 10, 0)),
      }),
      [],
    );

    /* clamp helper */
    const clamp = useCallback(
      (n: number) => Math.max(0, Math.min(n, numberOfImages - 1)),
      [numberOfImages],
    );

    /* navigation callbacks */
    const onFrameChange = useCallback(
      (requested: number) => {
        const c = clamp(requested);
        setIdx(c);
      },
      [clamp],
    );

    const onLoopChange = useCallback((l: boolean) => setIsLooping(l), []);
    const onFpsChange = useCallback((v: number) => setFps(v), []);

    /* load first frame */
    const firstFrameUrl = imageFilePaths[0] ?? "";
    useEffect(() => {
      if (!firstFrameUrl) return;
      let cancelled = false;

      setIdx(0);
      setFrames(Array(imageFilePaths.length).fill(null));
      setLoadedCount(0);

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

      return () => void (cancelled = true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstFrameUrl]);

    /* load subsequent frames */
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

      return () => void (cancelled = true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx, frames[idx]]);

    /* which image to show */
    const displayed = useMemo<HTMLImageElement | null>(() => {
      if (!series) return null;
      return frames[idx] ?? frames[0];
    }, [series, frames, idx]);

    /* fallbacks */
    if (!series) {
      return <div className="dicom-viewer-container">Seleziona una serie…</div>;
    }
    if (!displayed) {
      return <div className="dicom-viewer-container">Caricamento immagini…</div>;
    }

    /* render */
    return (
      <div
        className="dicom-viewer-container"
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <FrameViewport
            ref={viewportRef}
            frame={displayed}
            cursor={{ imageArea: "crosshair", viewportArea: "default" }}
            zoomStep={zoomStep}
            panFactor={panFactor}
            brightness={brightness}
            contrast={contrast}
            onZoomStepChange={(z) => setZoomStep(z)}
            onPanFactorChange={(p) => setPanFactor(p)}
            onBrightnessChange={
              brightnessMode ? (b) => setBrightness(b) : undefined
            }
            onContrastChange={
              brightnessMode ? (c) => setContrast(c) : undefined
            }
          >
            {variant.overlayCircles && (
              <Circle
                cx={displayed.naturalWidth / 2}
                cy={displayed.naturalHeight / 2}
                r={4}
              />
            )}
          </FrameViewport>
        </div>

        {showSlider && (
          <Navigation
            frameIndex={idx}
            numberOfFrames={numberOfImages}
            numberOfAvailableFrames={loadedCount}
            isLooping={showLoopButton ? isLooping : false}
            frameRate={showFpsInput ? fps : 20}
            hasArrowButtons
            onFrameIndexChange={onFrameChange}
            onIsLoopingChange={showLoopButton ? onLoopChange : undefined}
            onFrameRateChange={showFpsInput ? onFpsChange : undefined}
          />
        )}
      </div>
    );
  },
);

export default NewViewer;
