// src/components/Viewer.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RenderingEngine, Types, Enums } from '@cornerstonejs/core';
import { ToolGroupManager, ZoomTool, WindowLevelTool, addTool } from '@cornerstonejs/tools';
import dicomParser from 'dicom-parser';

// Define the type for a series.
export interface SeriesInfo {
  seriesUID: string;
  seriesDescription: string;
  numberOfImages: number;
  imageFilePaths: string[];
}

interface ViewerProps {
  series: SeriesInfo | null; // The series to be viewed.
  onMetadataExtracted?: (metadata: {
    patientId?: string;
    patientName?: string;
    patientSex?: string;
    studyDate?: string;
    studyDescription?: string;
    seriesDescription?: string;
    manufacturer?: string;
  }) => void; // Callback to send extracted metadata.
}

const Viewer: React.FC<ViewerProps> = ({ series, onMetadataExtracted }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [renderingEngine, setRenderingEngine] = useState<RenderingEngine | null>(null);
  const viewportId = 'VIEWPORT_1';

  // Reset index when a new series is selected.
  useEffect(() => {
    setCurrentIndex(0);
  }, [series]);

  // Create the Cornerstone viewport once.
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const engine = new RenderingEngine('engine1');
    setRenderingEngine(engine);

    const viewportInput: Types.PublicViewportInput = {
      viewportId,
      element,
      type: Enums.ViewportType.STACK,
    };
    engine.enableElement(viewportInput);

    // Register and activate tools.
    addTool(WindowLevelTool);
    addTool(ZoomTool);
    const toolGroup = ToolGroupManager.createToolGroup('default');
    if (toolGroup) {
      toolGroup.addTool(WindowLevelTool.toolName);
      toolGroup.addTool(ZoomTool.toolName);
      toolGroup.addViewport(viewportId, engine.id);
      toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [{ mouseButton: 1 }],
      });
      toolGroup.setToolActive(ZoomTool.toolName, {
        bindings: [{ mouseButton: 3 }],
      });
    }

    return () => {
      engine.disableElement(viewportId);
    };
  }, []);

  // Load and display the current image and extract metadata.
  const loadCurrentImage = useCallback(async () => {
    if (!series || series.imageFilePaths.length === 0 || !renderingEngine) return;

    const filePath = series.imageFilePaths[currentIndex];
    const imageUrl = `${window.location.origin}${filePath.replace(/\s/g, '%20')}`;
    const imageId = `wadouri:${imageUrl}`;
    console.log('Loading image:', imageId);

    try {
      // Fetch the raw DICOM data.
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();

      // Parse the DICOM data.
      const dataSet = dicomParser.parseDicom(new Uint8Array(arrayBuffer));

      // Extract metadata fields (update tag keys as needed).
      const patientId = dataSet.string('x00100020') || 'Unknown';
      const patientName = dataSet.string('x00100010') || 'Unknown';
      const patientSex = dataSet.string('x00100040') || 'Unknown';
      const studyDate = dataSet.string('x00080020') || 'Unknown';
      const studyDescription = dataSet.string('x00081030') || 'Unknown';
      const seriesDescription = dataSet.string('x0008103E') || 'Unknown';
      const manufacturer = dataSet.string('x00080070') || 'Unknown';

      const extractedMetadata = {
        patientId,
        patientName,
        patientSex,
        studyDate,
        studyDescription,
        seriesDescription,
        manufacturer,
      };

      // Pass the extracted metadata back via the callback.
      if (onMetadataExtracted) {
        onMetadataExtracted(extractedMetadata);
      }

      // Update the viewport’s stack and render.
      const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;
      viewport.setStack([imageId]);
      viewport.render();
    } catch (error) {
      console.error('Error loading image or extracting metadata:', error);
    }
  }, [series, currentIndex, renderingEngine, onMetadataExtracted]);

  // Reload the image when the current index changes.
  useEffect(() => {
    loadCurrentImage();
  }, [loadCurrentImage]);

  const goNext = () => {
    if (!series) return;
    setCurrentIndex((idx) => Math.min(idx + 1, series.imageFilePaths.length - 1));
  };
  const goPrev = () => {
    setCurrentIndex((idx) => Math.max(idx - 1, 0));
  };

  return (
    <section id="viewer" style={{ flex: 1, marginRight: '1rem' }}>
      <h3 style={{ color: 'white' }}>Viewer</h3>
      <div
        id="dicomImageViewport"
        ref={viewportRef}
        style={{ width: '512px', height: '512px', backgroundColor: 'black' }}
      />
      <div style={{ marginTop: '1rem' }}>
        <button onClick={goPrev} disabled={!series}>Previous</button>
        <button onClick={goNext} disabled={!series}>Next</button>
      </div>
      <div style={{ marginTop: '1rem', color: 'yellow' }}>
        {series
          ? `Viewing image ${currentIndex + 1} / ${series.imageFilePaths.length} in series ${series.seriesUID}`
          : 'No series selected'}
      </div>
    </section>
  );
};

export default Viewer;
