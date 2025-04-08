// src/components/Viewer.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RenderingEngine, Types, Enums } from '@cornerstonejs/core';
import { ToolGroupManager, ZoomTool, WindowLevelTool, addTool } from '@cornerstonejs/tools';
import dicomParser from 'dicom-parser';

export interface SeriesInfo {
  seriesUID: string;
  seriesDescription: string;
  numberOfImages: number;
  imageFilePaths: string[];
}

interface ViewerProps {
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

const Viewer: React.FC<ViewerProps> = ({ series, onMetadataExtracted }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [renderingEngine, setRenderingEngine] = useState<RenderingEngine | null>(null);

  const viewportId = 'VIEWPORT_1';

  // When a new series loads, set the current index to the "key image" (middle image of the series)
  useEffect(() => {
    if (series && series.imageFilePaths.length > 0) {
      const keyIndex = Math.floor(series.imageFilePaths.length / 2) - 1;
      setCurrentIndex(keyIndex);
    } else {
      setCurrentIndex(0);
    }
  }, [series]);

  // Create the Cornerstone viewport
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

  // Load the current image and extract metadata.
  const loadCurrentImage = useCallback(async () => {
    if (!series || series.imageFilePaths.length === 0 || !renderingEngine) return;

    const filePath = series.imageFilePaths[currentIndex];
    const imageUrl = `${window.location.origin}${filePath.replace(/\s/g, '%20')}`;
    const imageId = `wadouri:${imageUrl}`;

    try {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();

      const dataSet = dicomParser.parseDicom(new Uint8Array(arrayBuffer));
      
      // Extract metadata values.
      const patientId = dataSet.string('x00100020') || 'Unknown';
      const patientName = dataSet.string('x00100010') || 'Unknown';
      const patientSex = dataSet.string('x00100040') || 'Unknown';
      const studyDate = dataSet.string('x00080020') || 'Unknown';
      const studyDescription = dataSet.string('x00081030') || 'Unknown';
      const seriesDescription = dataSet.string('x0008103E') || 'Unknown';
      const manufacturer = dataSet.string('x00080070') || 'Unknown';

      if (onMetadataExtracted) {
        onMetadataExtracted({
          patientId,
          patientName,
          patientSex,
          studyDate,
          studyDescription,
          seriesDescription,
          manufacturer,
        });
      }

      const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;
      viewport.setStack([imageId]);
      viewport.render();
    } catch (error) {
      console.error('Error loading image or extracting metadata:', error);
    }
  }, [series, currentIndex, renderingEngine, onMetadataExtracted]);

  useEffect(() => {
    loadCurrentImage();
  }, [loadCurrentImage]);

  // Navigation handlers.
  const goFirst = () => {
    if (!series) return;
    setCurrentIndex(0);
  };

  const goPrev = () => {
    if (!series) return;
    setCurrentIndex((idx) => Math.max(idx - 1, 0));
  };

  const goNext = () => {
    if (!series) return;
    setCurrentIndex((idx) => Math.min(idx + 1, series.imageFilePaths.length - 1));
  };

  const goLast = () => {
    if (!series) return;
    setCurrentIndex(series.imageFilePaths.length - 1);
  };

  return (
    <div className="dicom-viewer-container">
      {/* The DICOM viewport */}
      <div ref={viewportRef} className="dicom-viewport" />

      {/* Navigation controls */}
      <div className="viewer-navigation">
        <button className="icon-button nav-first" onClick={goFirst} disabled={!series || currentIndex <= 0}>
          <img src="/assets/first-svgrepo-com.svg" alt="First" />
        </button>
        <button className="icon-button nav-prev" onClick={goPrev} disabled={!series || currentIndex <= 0}>
          <img src="/assets/previous-svgrepo-com.svg" alt="Previous" />
        </button>
        <span className="viewer-nav-text">
          Showing image {currentIndex + 1} of {series && series.imageFilePaths.length}
        </span>
        <button className="icon-button nav-next" onClick={goNext} disabled={!series || currentIndex >= series.imageFilePaths.length - 1}>
          <img src="/assets/next-svgrepo-com.svg" alt="Next" />
        </button>
        <button className="icon-button nav-last" onClick={goLast} disabled={!series || currentIndex >= series.imageFilePaths.length - 1}>
          <img src="/assets/last-svgrepo-com.svg" alt="Last" />
        </button>
      </div>
    </div>
  );
};

export default Viewer;
