// src/components/NewViewer.tsx
// -----------------------------------------------------------------------------
// Replacement for the old Cornerstone-based <Viewer>. It uses the Viewport kit
// that lives in **src/newViewport/** (FrameViewport, Navigation, etc.).
// The component keeps the public API identical to the old one so that
// <ViewerPage> and the rest of the UI do **not** need to change → you can just
// rename the import.
//
// ⚠️ This implementation focuses on single-frame MONOCHROME2 images (8- or 16-
//     bit). If you also need RGB or palette-color support just extend the helper
//     `imageFromPixelData`.
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

async function imageFromPixelData(
    width: number,
    height: number,
    pixelData: Uint8Array | Uint16Array,
    bitsAllocated: number
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
        const v = bitsAllocated === 16
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
    const res = await fetch(filePath);
    const buffer = await res.arrayBuffer();
    const dataSet = dicomParser.parseDicom(new Uint8Array(buffer));

    const cols = dataSet.uint16("x00280011");
    const rows = dataSet.uint16("x00280010");
    if (cols == null || rows == null) throw new Error("Missing dimensions");

    const bitsAllocated = dataSet.uint16("x00280100");
    if (bitsAllocated == null) throw new Error("Missing bitsAllocated");

    const pde = dataSet.elements.x7fe00010;
    if (!pde) throw new Error("Missing PixelData");
    const offset = pde.dataOffset;
    const frameLen = rows * cols * (bitsAllocated / 8);
    const byteArray = dataSet.byteArray.buffer;
    const pixelData =
        bitsAllocated === 16
            ? new Uint16Array(byteArray, offset, frameLen / 2)
            : new Uint8Array(byteArray, offset, frameLen);

    // metadata (only used once on frame 0)
    const metadata = {
        patientId: dataSet.string("x00100020") || "Unknown",
        patientName: dataSet.string("x00100010") || "Unknown",
        patientSex: dataSet.string("x00100040") || "Unknown",
        studyDate: dataSet.string("x00080020") || "Unknown",
        studyDescription: dataSet.string("x00081030") || "Unknown",
        seriesDescription: dataSet.string("x0008103E") || "Unknown",
        manufacturer: dataSet.string("x00080070") || "Unknown",
    } as const;

    const img = await imageFromPixelData(cols, rows, pixelData, bitsAllocated);
    return { image: img, metadata } as const;
}

/* -------------------------------------------------------------------------- */
/*  Public component                                                          */
/* -------------------------------------------------------------------------- */

export interface ViewerProps {
    series: SeriesInfo | null;
    onMetadataExtracted?: (md: {
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
    // if no series, early-return
    if (!series) {
        return (
            <div className="dicom-viewer-container">
                Seleziona una serie…
            </div>
        );
    }

    // now `series` is non-null
    const { imageFilePaths, numberOfImages } = series;

    const [idx, setIdx] = useState(0);
    const [frames, setFrames] = useState<HTMLImageElement[]>([]);
    const [available, setAvailable] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [fps, setFps] = useState(20);

    // clamp helper
    const clamp = useCallback(
        (n: number) => Math.max(0, Math.min(n, available - 1)),
        [available]
    );

    // navigation handlers with console logging
    const onFrameChange = useCallback(
        (n: number) => {
            console.log("→ request frame:", n);
            const c = clamp(n);
            console.log("→ clamped to:", c);
            setIdx(c);
        },
        [clamp]
    );
    const onLoopChange = useCallback((l: boolean) => {
        console.log("→ loop:", l);
        setIsLooping(l);
    }, []);
    const onFpsChange = useCallback((v: number) => {
        console.log("→ fps:", v);
        setFps(v);
    }, []);

    // load all frames progressively
    useEffect(() => {
        let cancelled = false;
        setFrames([]);
        setAvailable(0);
        setIdx(0);

        (async () => {
            const temp: HTMLImageElement[] = [];
            for (let i = 0; i < imageFilePaths.length; i++) {
                try {
                    const { image, metadata } = await loadDicomImage(
                        imageFilePaths[i]
                    );
                    if (cancelled) return;
                    temp[i] = image;
                    setFrames((prev) => {
                        const nxt = [...prev];
                        nxt[i] = image;
                        return nxt;
                    });
                    setAvailable(i + 1);
                    if (i === 0) {
                        onMetadataExtracted?.(metadata);
                    }
                } catch (err) {
                    console.error("Failed to load", imageFilePaths[i], err);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [imageFilePaths, onMetadataExtracted]);

    // pick the exact frame if ready, otherwise last-available
    const displayed = useMemo(() => {
        if (frames[idx]) return frames[idx];
        if (available > 0) return frames[available - 1];
        return null;
    }, [frames, idx, available]);

    if (!displayed) {
        return (
            <div className="dicom-viewer-container">
                Caricamento immagini…
            </div>
        );
    }

    return (
        <div
            className="dicom-viewer-container"
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
            }}
        >
            {/* viewport */}
            <div style={{ flex: 1, position: "relative" }}>
                <FrameViewport
                    frame={displayed}
                    cursor={{
                        imageArea: "crosshair",
                        viewportArea: "default",
                    }}
                    zoomStep={0}
                    panFactor={{ x: 0, y: 0 }}
                    onZoomStepChange={() => { }}
                    onPanFactorChange={() => { }}
                >
                    <Circle
                        cx={displayed.naturalWidth / 2}
                        cy={displayed.naturalHeight / 2}
                        r={4}
                    />
                </FrameViewport>
            </div>

            {/* navigation */}
            <Navigation
                frameIndex={idx}
                numberOfFrames={numberOfImages}
                numberOfAvailableFrames={available}
                isLooping={isLooping}
                frameRate={fps}
                hasArrowButtons
                onFrameIndexChange={onFrameChange}
                onIsLoopingChange={onLoopChange}
                onFrameRateChange={onFpsChange}
            />
        </div>
    );
};

export default NewViewer;
