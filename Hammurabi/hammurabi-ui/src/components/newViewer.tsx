// src/components/newViewer.tsx

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
        .map((segment) => encodeURIComponent(segment))
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
    // extract just what we need
    const imageFilePaths = series?.imageFilePaths ?? [];
    const numberOfImages = series?.numberOfImages ?? 0;

    // All hooks up front, unconditionally:
    const [idx, setIdx] = useState(0);
    const [frames, setFrames] = useState<(HTMLImageElement | null)[]>(() =>
        Array(imageFilePaths.length).fill(null)
    );
    const [loadedCount, setLoadedCount] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [fps, setFps] = useState(20);

    const clamp = useCallback(
        (n: number) => Math.max(0, Math.min(n, numberOfImages - 1)),
        [numberOfImages]
    );
    const onFrameChange = useCallback(
        (requested: number) => {
            const c = clamp(requested);
            console.log(`[NewViewer] onFrameChange → ${c}`);
            setIdx(c);
        },
        [clamp]
    );
    const onLoopChange = useCallback((l: boolean) => {
        console.log(`[NewViewer] onLoopChange → ${l}`);
        setIsLooping(l);
    }, []);
    const onFpsChange = useCallback((v: number) => {
        console.log(`[NewViewer] onFpsChange → ${v}`);
        setFps(v);
    }, []);

    // memoize the very first frame's URL so we only reset when *that* changes:
    const firstFrameUrl = imageFilePaths[0] || "";

    useEffect(() => {
        if (!firstFrameUrl) return;

        let cancelled = false;
        console.log("[NewViewer] ⟳ series changed → resetting loader");
        setIdx(0);
        setFrames(Array(imageFilePaths.length).fill(null));
        setLoadedCount(0);

        (async () => {
            try {
                console.log("[NewViewer] ⟳ loading initial frame");
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

        return () => {
            cancelled = true;
        };
        // we only care about re-running this when firstFrameUrl really changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstFrameUrl]);

    useEffect(() => {
        // don't run if we haven't got a series or already have frame 0 or this frame
        if (!series || idx === 0 || frames[idx]) return;

        let cancelled = false;
        console.log(`[NewViewer] ⟳ loading frame ${idx}`);
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

        return () => {
            cancelled = true;
        };
        // we only need to re-run when `idx` or that slot in `frames` changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx, frames[idx]]);

    const displayed = useMemo(() => {
        if (!series) return null;
        return frames[idx] ?? frames[0];
    }, [series, frames, idx]);

    // ──────── RENDER ────────

    if (!series) {
        return <div className="dicom-viewer-container">Seleziona una serie…</div>;
    }
    if (!displayed) {
        return <div className="dicom-viewer-container">Caricamento immagini…</div>;
    }

    return (
        <div
            className="dicom-viewer-container"
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
            <div style={{ flex: 1, position: "relative" }}>
                <FrameViewport
                    frame={displayed}
                    cursor={{ imageArea: "crosshair", viewportArea: "default" }}
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

            <Navigation
                frameIndex={idx}
                numberOfFrames={numberOfImages}
                numberOfAvailableFrames={loadedCount}
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
