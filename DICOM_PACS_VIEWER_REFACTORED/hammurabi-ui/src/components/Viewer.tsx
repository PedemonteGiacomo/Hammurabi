// src/components/Viewer.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RenderingEngine, Types, Enums } from '@cornerstonejs/core';
import { ToolGroupManager, ZoomTool, WindowLevelTool, addTool } from '@cornerstonejs/tools';

// Define a type for a series
export interface SeriesInfo {
  seriesUID: string;
  seriesDescription: string;
  numberOfImages: number;
  imageFilePaths: string[];
}

interface ViewerProps {
  series: SeriesInfo | null; // the series to be viewed
}

const Viewer: React.FC<ViewerProps> = ({ series }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [renderingEngine, setRenderingEngine] = useState<RenderingEngine | null>(null);
  const viewportId = 'VIEWPORT_1';

  // Reset index when series changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [series]);

  // Create the viewport on mount
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

    // Optionally, register and activate tools (window/level, zoom, scroll, etc.)
    addTool(WindowLevelTool);
    addTool(ZoomTool);
    //addTool(StackScrollMouseWheelTool);

    const toolGroup = ToolGroupManager.createToolGroup('default');
    if (toolGroup) {
      toolGroup.addTool(WindowLevelTool.toolName);
      toolGroup.addTool(ZoomTool.toolName);
      //toolGroup.addTool(StackScrollMouseWheelTool.toolName);
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

  // Helper: Load and display the current image
  const loadCurrentImage = useCallback(() => {
    if (!series || series.imageFilePaths.length === 0 || !renderingEngine) return;

    const filePath = series.imageFilePaths[currentIndex];
    const imageId = `wadouri:${window.location.origin}${filePath}`;
    console.log('Loading image:', imageId);

    // Get the viewport and cast it to a StackViewport to access setStack.
    const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;
    viewport.setStack([imageId]);
    viewport.render();
  }, [series, currentIndex, renderingEngine]);

  // Reload image whenever currentIndex changes
  useEffect(() => {
    loadCurrentImage();
  }, [loadCurrentImage]);

  // Next / Previous controls
  const goNext = () => {
    if (!series) return;
    setCurrentIndex((idx) => Math.min(idx + 1, series.imageFilePaths.length - 1));
  };
  const goPrev = () => {
    setCurrentIndex((idx) => Math.max(idx - 1, 0));
  };

  return (
    <section id="viewer">
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
