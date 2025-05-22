// src/stories/ViewerPlayground.stories.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { Meta, StoryFn } from '@storybook/react'
import ViewerToolbar from '../components/ViewerToolbar'
import NewViewer, { ViewerHandles } from '../components/newViewer'
import Sidebar from '../components/Sidebar'
import type { SeriesInfo } from '../components/NestedDicomTable'

const dummy50: SeriesInfo = {
  seriesUID: '1.2.840.loop.50',
  seriesDescription: 'Dummy 50-frame series',
  numberOfImages: 50,
  imageFilePaths: Array.from({ length: 50 }, (_, i) =>
    `/assets/esaote_magnifico/ForMIP/1_3_76_2_1_1_4_1_3_9044_778600979_${i + 1}.dcm`
  ),
}

type PlaygroundArgs = {
  showSidebar: boolean
  brightnessMode: boolean
  measurementMode: boolean
  annotationMode: boolean
  panMode: boolean
}

const PlaygroundTemplate: StoryFn<PlaygroundArgs> = (args) => {
  // prendi lo stato iniziale dai args
  const [showSidebar, setShowSidebar] = useState(args.showSidebar)
  const [brightnessMode, setBrightnessMode] = useState(args.brightnessMode)
  const [measurementMode, setMeasurementMode] = useState(args.measurementMode)
  const [annotationMode, setAnnotationMode] = useState(args.annotationMode)
  const [panMode, setPanMode] = useState(args.panMode)
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null)

  const viewerRef = useRef<ViewerHandles>(null)
  const viewerContainerRef = useRef<HTMLDivElement>(null)

  // sincronizza se cambio i controls da panel
  useEffect(() => setShowSidebar(args.showSidebar), [args.showSidebar])
  useEffect(() => setBrightnessMode(args.brightnessMode), [args.brightnessMode])
  useEffect(() => setMeasurementMode(args.measurementMode), [args.measurementMode])
  useEffect(() => setAnnotationMode(args.annotationMode), [args.annotationMode])
  useEffect(() => setPanMode(args.panMode), [args.panMode])

  const activateMode = useCallback(
    (mode: 'brightness' | 'measurement' | 'annotation' | 'pan' | null) => {
      setBrightnessMode(mode === 'brightness')
      setMeasurementMode(mode === 'measurement')
      setAnnotationMode(mode === 'annotation')
      setPanMode(mode === 'pan')
    },
    []
  )

  const resetViewer = useCallback(() => {
    activateMode(null)
    viewerRef.current?.resetView()
  }, [activateMode])

  const toggleFullscreen = () => {
    const el = viewerContainerRef.current
    if (!el) return
    if (!document.fullscreenElement) el.requestFullscreen().catch(() => {})
    else document.exitFullscreen().catch(() => {})
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
      <ViewerToolbar
        showSidebar={showSidebar}
        brightnessMode={brightnessMode}
        measurementMode={measurementMode}
        annotationMode={annotationMode}
        panMode={panMode}
        onToggleSidebar={() => setShowSidebar(v => !v)}
        onToggleBrightnessMode={() => activateMode(brightnessMode ? null : 'brightness')}
        onToggleMeasurementMode={() => activateMode(measurementMode ? null : 'measurement')}
        onToggleAnnotationMode={() => activateMode(annotationMode ? null : 'annotation')}
        onTogglePanMode={() => activateMode(panMode ? null : 'pan')}
        onZoomIn={() => viewerRef.current?.zoomIn()}
        onZoomOut={() => viewerRef.current?.zoomOut()}
        onBrightnessUp={() => viewerRef.current?.brightnessUp()}
        onBrightnessDown={() => viewerRef.current?.brightnessDown()}
        onFlipHorizontal={() => viewerRef.current?.flipHorizontal()}
        onFlipVertical={() => viewerRef.current?.flipVertical()}
        onResetView={resetViewer}
        onFullscreen={toggleFullscreen}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div
          ref={viewerContainerRef}
          style={{ flex: showSidebar ? 2 : 1, position: 'relative', background: '#000' }}
        >
          <NewViewer
            ref={viewerRef}
            series={dummy50}
            onMetadataExtracted={setMetadata}
            brightnessMode={brightnessMode}
            measurementMode={measurementMode}
            annotationMode={annotationMode}
            panMode={panMode}
          />
        </div>
        {showSidebar && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <Sidebar metadata={metadata} />
          </div>
        )}
      </div>
    </div>
  )
}

export default {
  title: 'Pages/ViewerPlayground',
  parameters: { layout: 'fullscreen' },
  argTypes: {
    showSidebar: { control: 'boolean' },
    brightnessMode: { control: 'boolean' },
    measurementMode: { control: 'boolean' },
    annotationMode: { control: 'boolean' },
    panMode: { control: 'boolean' },
  },
} as Meta<PlaygroundArgs>

export const Playground = PlaygroundTemplate.bind({})
Playground.args = {
  showSidebar: true,
  brightnessMode: false,
  measurementMode: false,
  annotationMode: false,
  panMode: false,
}
