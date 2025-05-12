// src/components/NewViewer.tsx
// -----------------------------------------------------------------------------
// Replacement for the old Cornerstone-based <Viewer>. It uses the Viewport kit
// that lives in **src/newViewport/** (FrameViewport, Navigation, etc.).
// The component keeps the public API identical to the old one so that
// <ViewerPage> and the rest of the UI do **not** need to change → you can just
// rename the import.
//
// ⚠️  This implementation focuses on single‑frame MONOCHROME2 images (8‑ or 16‑
//     bit). If you also need RGB or palette‑color support just extend the helper
//     `decodePixelData`.
// -----------------------------------------------------------------------------

import React, { useState, useEffect, useCallback, useMemo } from "react";
import dicomParser from "dicom-parser";

import { FrameViewport } from "../newViewport/components/FrameViewport";
import { Navigation } from "../newViewport/components/Navigation";
import { Circle } from "../newViewport/components/Overlays";
import { SeriesInfo } from "./NestedDicomTable";

/* -------------------------------------------------------------------------- */
/*  Utility helpers                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Converts the raw pixel data to an "8‑bit per channel" ImageData and returns an
 * *HTMLImageElement* that can be consumed by <FrameViewport>.
 */
async function imageFromPixelData(
  width: number,
  height: number,
  pixelData: Uint8Array | Uint16Array,
  bitsAllocated: number,
  photometricInterpretation: string,
): Promise<HTMLImageElement> {
  // 🖼️ 1. Put pixel data in a Canvas.
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to acquire 2D context");

  const imageData = ctx.createImageData(width, height);
  const out = imageData.data; // RGBA, 8‑bit per channel

  // Very naive grayscale conversion; window/level is handled by FrameViewport
  // itself, so we just stretch the full range to 0‑255.
  const maxSampleValue = bitsAllocated === 16 ? 65535 : 255;

  for (let i = 0; i < pixelData.length; i++) {
    const value = bitsAllocated === 16 ? (pixelData as Uint16Array)[i] : (pixelData as Uint8Array)[i];
    const v8 = (value / maxSampleValue) * 255;
    const o = i * 4;
    out[o] = out[o + 1] = out[o + 2] = v8;
    out[o + 3] = 255; // fully opaque
  }

  ctx.putImageData(imageData, 0, 0);

  // 2. Convert canvas to an Image element (required by FrameViewport).
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = canvas.toDataURL();
  });
}

/**
 * Loads a single DICOM file, decodes pixel data and returns an HTMLImageElement
 * plus a metadata object (patient/study/series fields used by the sidebar).
 */
async function loadDicomImage(filePath: string) {
  const response = await fetch(filePath);
  const arrayBuffer = await response.arrayBuffer();
  const dataSet = dicomParser.parseDicom(new Uint8Array(arrayBuffer));

  // --- metadata ----------------------------------------------------------------
  const metadata = {
    patientId: dataSet.string("x00100020") || "Unknown",
    patientName: dataSet.string("x00100010") || "Unknown",
    patientSex: dataSet.string("x00100040") || "Unknown",
    studyDate: dataSet.string("x00080020") || "Unknown",
    studyDescription: dataSet.string("x00081030") || "Unknown",
    seriesDescription: dataSet.string("x0008103E") || "Unknown",
    manufacturer: dataSet.string("x00080070") || "Unknown",
  } as const;

  // --- pixel data --------------------------------------------------------------
  const cols = dataSet.uint16("x00280011");
  const rows = dataSet.uint16("x00280010");
  if (cols === undefined || rows === undefined) {
    throw new Error("Missing rows or cols in DICOM metadata");
  }
  const bitsAllocated = dataSet.uint16("x00280100");
  if (bitsAllocated === undefined) {
    throw new Error("bitsAllocated is missing from DICOM metadata");
  }
  const pi = (dataSet.string("x00280004") || "MONOCHROME2").toUpperCase();
  
  const pixelDataElement = dataSet.elements.x7fe00010;
  if (!pixelDataElement) throw new Error("PixelData element missing");
  const pixelDataOffset = pixelDataElement.dataOffset;
  const byteArray = dataSet.byteArray;
  const frameLength = rows * cols * (bitsAllocated / 8);
  const pixelData =
    bitsAllocated === 16
      ? new Uint16Array(
          byteArray.buffer,
          pixelDataOffset,
          frameLength / 2,
        )
      : new Uint8Array(byteArray.buffer, pixelDataOffset, frameLength);

  const image = await imageFromPixelData(cols, rows, pixelData, bitsAllocated, pi);

  return { image, metadata } as const;
}

/* -------------------------------------------------------------------------- */
/*  Public component                                                          */
/* -------------------------------------------------------------------------- */
export interface ViewerProps {
  series: SeriesInfo | null;
  onMetadataExtracted?: (metadata: {
    patientId?: string;
    patientName?: string;
    patientSex?: string;
    studyDate?: string;
    studyDescription?: string;
    seriesDescription?: string;
    manufacturer?: string;
  }) => void;
}

const NewViewer: React.FC<ViewerProps> = ({ series, onMetadataExtracted }) => {
  // Index of the frame currently shown
  const [frameIndex, setFrameIndex] = useState(0);
  // Loaded HTMLImageElements
  const [frames, setFrames] = useState<HTMLImageElement[]>([]);
  const [availableFrames, setAvailableFrames] = useState(0);

  // Reset when the user selects a different series
  useEffect(() => {
    let isCancelled = false;

    if (!series) {
      setFrames([]);
      return;
    }

    async function load() {
      const imgs: HTMLImageElement[] = [];

      for (const filePath of series!.imageFilePaths) {
        try {
          const { image, metadata } = await loadDicomImage(filePath);
          imgs.push(image);
          // ⚠️ Only emit metadata once (first frame).
          if (imgs.length === 1 && onMetadataExtracted) {
            onMetadataExtracted(metadata);
          }
        } catch (err) {
          // Skip bad frames but log – better UX: show warning to user
          console.error("Cannot load frame", filePath, err);
        }
      }

      if (!isCancelled) {
        setFrames(imgs);
        setAvailableFrames(imgs.length); // may be smaller than series.numberOfImages
        // Center on key image (middle frame)
        setFrameIndex(imgs.length > 0 ? Math.floor(imgs.length / 2) : 0);
      }
    }

    load();
    return () => {
      isCancelled = true;
    };
  }, [series, onMetadataExtracted]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const currentFrame = useMemo(() => frames[frameIndex], [frames, frameIndex]);

  if (!series) {
    return <div className="dicom-viewer-container">Seleziona una serie…</div>;
  }

  if (!currentFrame) {
    return <div className="dicom-viewer-container">Caricamento immagini…</div>;
  }

  return (
    <div className="dicom-viewer-container" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* ------------------  Viewport  ------------------------------------- */}
      <div style={{ flex: 1, position: "relative" }}>
        <FrameViewport
          frame={currentFrame}
          zoomStep={0}
          panFactor={{ x: 0, y: 0 }}
          onZoomStepChange={() => {}}
          onPanFactorChange={() => {}}
          // Example overlay: yellow dot @ image center – remove if not needed
        >
          <Circle cx={currentFrame.naturalWidth / 2} cy={currentFrame.naturalHeight / 2} r={4} />
        </FrameViewport>
      </div>

      {/* ------------------  Navigation slider  ---------------------------- */}
      <Navigation
        frameIndex={frameIndex}
        numberOfFrames={series.numberOfImages}
        numberOfAvailableFrames={availableFrames}
        isLooping={false}
        hasArrowButtons
        onFrameIndexChange={(idx) => setFrameIndex(idx)}
      />
    </div>
  );
};

export default NewViewer;
