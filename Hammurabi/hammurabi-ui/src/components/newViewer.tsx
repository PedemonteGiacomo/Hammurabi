// src/components/NewViewer.tsx
// -----------------------------------------------------------------------------
// Replacement for the old Cornerstone-based <Viewer>. It uses the Viewport kit
// that lives in **src/newViewport/** (FrameViewport, Navigation, etc.).
// The component keeps the public API identical to the old one so that
// <ViewerPage> and the rest of the UI do **not** need to change → you can just
// rename the import.
//
// ⚠️  This implementation focuses on single-frame MONOCHROME2 images (8- or 16-
//     bit). If you also need RGB or palette-color support just extend the helper
//     `decodePixelData`.
// -----------------------------------------------------------------------------

import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
  } from "react";
  import dicomParser from "dicom-parser";
  
  import { FrameViewport } from "../newViewport/components/FrameViewport";
  import { Navigation } from "../newViewport/components/Navigation";
  import { Circle } from "../newViewport/components/Overlays";
  import { SeriesInfo } from "./NestedDicomTable";
  
  /* -------------------------------------------------------------------------- */
  /*  Utility helpers                                                           */
  /* -------------------------------------------------------------------------- */
  
  /**
   * Converts the raw pixel data to an "8-bit per channel" ImageData and returns an
   * *HTMLImageElement* that can be consumed by <FrameViewport>.
   */
  async function imageFromPixelData(
    width: number,
    height: number,
    pixelData: Uint8Array | Uint16Array,
    bitsAllocated: number,
    photometricInterpretation: string,
  ): Promise<HTMLImageElement> {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to acquire 2D context");
  
    const imageData = ctx.createImageData(width, height);
    const out = imageData.data; // RGBA, 8-bit per channel
    const maxSampleValue = bitsAllocated === 16 ? 65535 : 255;
  
    for (let i = 0; i < pixelData.length; i++) {
      const value =
        bitsAllocated === 16
          ? (pixelData as Uint16Array)[i]
          : (pixelData as Uint8Array)[i];
      const v8 = (value / maxSampleValue) * 255;
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
  
  /**
   * Loads a single DICOM file, decodes pixel data and returns an HTMLImageElement
   * plus a metadata object (patient/study/series fields used by the sidebar).
   */
  async function loadDicomImage(filePath: string) {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const dataSet = dicomParser.parseDicom(new Uint8Array(arrayBuffer));
  
    const metadata = {
      patientId: dataSet.string("x00100020") || "Unknown",
      patientName: dataSet.string("x00100010") || "Unknown",
      patientSex: dataSet.string("x00100040") || "Unknown",
      studyDate: dataSet.string("x00080020") || "Unknown",
      studyDescription: dataSet.string("x00081030") || "Unknown",
      seriesDescription: dataSet.string("x0008103E") || "Unknown",
      manufacturer: dataSet.string("x00080070") || "Unknown",
    } as const;
  
    const cols = dataSet.uint16("x00280011");
    const rows = dataSet.uint16("x00280010");
    if (cols === undefined || rows === undefined) {
      throw new Error("Missing rows or cols in DICOM metadata");
    }
    const bitsAllocated = dataSet.uint16("x00280100");
    if (bitsAllocated === undefined) {
      throw new Error("bitsAllocated is missing from DICOM metadata");
    }
  
    const pixelDataElement = dataSet.elements.x7fe00010;
    if (!pixelDataElement) throw new Error("PixelData element missing");
    const offset = pixelDataElement.dataOffset;
    const byteArray = dataSet.byteArray;
    const frameLength = rows * cols * (bitsAllocated / 8);
    const pixelData =
      bitsAllocated === 16
        ? new Uint16Array(byteArray.buffer, offset, frameLength / 2)
        : new Uint8Array(byteArray.buffer, offset, frameLength);
  
    const image = await imageFromPixelData(
      cols,
      rows,
      pixelData,
      bitsAllocated,
      (dataSet.string("x00280004") || "MONOCHROME2").toUpperCase(),
    );
  
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
  
  const NewViewer: React.FC<ViewerProps> = ({
    series,
    onMetadataExtracted,
  }) => {
    // — current index (clamped to available frames)
    const [idx, setIdx] = useState(0);
    // — loaded frames
    const [frames, setFrames] = useState<HTMLImageElement[]>([]);
    // — how many have finished decoding
    const [availableFrames, setAvailableFrames] = useState(0);
    // — play / pause
    const [isLooping, setIsLooping] = useState(false);
    const [frameRate, setFrameRate] = useState(20);
  
    // Clamp helper
    const setFrameIndex = useCallback(
      (n: number) => {
        const max = Math.max(0, availableFrames - 1);
        setIdx(Math.max(0, Math.min(n, max)));
      },
      [availableFrames],
    );
  
    // load/reset when series changes
    useEffect(() => {
      if (!series) {
        setFrames([]);
        setAvailableFrames(0);
        setIdx(0);
        return;
      }
      let cancelled = false;
      async function loadAll() {
        const count = series!.imageFilePaths.length;
        const imgArr = new Array<HTMLImageElement>(count);

        for (let i = 0; i < count; i++) {
          try {
            const { image, metadata } = await loadDicomImage(
              series!.imageFilePaths[i],
            );
            imgArr[i] = image;
            if (cancelled) return;

            // progressive publish
            setFrames((prev) => {
              const next = [...prev];
              next[i] = image;
              return next;
            });
            setAvailableFrames(i + 1);

            // first frame metadata
            if (i === 0) {
              setFrameIndex(0);
              onMetadataExtracted?.(metadata);
            }
          } catch (e) {
            console.error("Cannot load frame", series!.imageFilePaths[i], e);
          }
        }
  
        // final: ensure all are set
        setFrames(imgArr);
        setAvailableFrames(count);
      }
  
      loadAll();
      return () => {
        cancelled = true;
      };
    }, [series, onMetadataExtracted, setFrameIndex]);
  
    const currentFrame = useMemo(() => frames[idx], [frames, idx]);
  
    if (!series) {
      return <div className="dicom-viewer-container">Seleziona una serie…</div>;
    }
    if (!currentFrame) {
      return <div className="dicom-viewer-container">Caricamento immagini…</div>;
    }
  
    return (
      <div
        className="dicom-viewer-container"
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        {/* Viewport */}
        <div style={{ flex: 1, position: "relative" }}>
          <FrameViewport
            frame={currentFrame}
            cursor={{
              imageArea: "crosshair",
              viewportArea: "default",
            }}
            zoomStep={0}
            panFactor={{ x: 0, y: 0 }}
            onZoomStepChange={() => {}}
            onPanFactorChange={() => {}}
          >
            {/* example overlay: remove if unneeded */}
            <Circle
              cx={currentFrame.naturalWidth / 2}
              cy={currentFrame.naturalHeight / 2}
              r={4}
            />
          </FrameViewport>
        </div>
  
        {/* Navigation */}
        <Navigation
          frameIndex={idx}
          numberOfFrames={series.numberOfImages}
          numberOfAvailableFrames={availableFrames}
          isLooping={isLooping}
          frameRate={frameRate}
          hasArrowButtons
          onFrameIndexChange={setFrameIndex}
          onIsLoopingChange={setIsLooping}
          onFrameRateChange={setFrameRate}
        />
      </div>
    );
  };
  
  export default NewViewer;
  