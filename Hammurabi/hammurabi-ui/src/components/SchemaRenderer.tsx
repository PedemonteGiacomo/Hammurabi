import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDeviceVariant } from "../hooks/useDeviceVariant";
import uiSchemaFull from "../schema/uiSchema.full.json";
import { componentRegistry } from "./componentRegistry";
import HelloWidgetDefault from "../schema/components/HelloWidget.schema.json";
import { ViewerHandles } from "../components/newViewer";

const SchemaRenderer: React.FC = () => {
  // 1) Hook di routing e device
  const navigate = useNavigate();
  const location = useLocation();
  const device = useDeviceVariant();

  // 2) Tutte le Hook di stato e ref
  const [metadata, setMetadata] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [brightnessMode, setBrightnessMode] = useState(false);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [panMode, setPanMode] = useState(false);
  const [helloOverride, setHelloOverride] = useState<any>(undefined);
  const [activeTab, setActiveTab] = useState<"dicom"|"json">("dicom");

  const viewerRef = useRef<ViewerHandles | null>(null);
  const viewerContainerRef = useRef<HTMLDivElement | null>(null);

  // 3) Callback helpers
  const activateMode = useCallback(
    (mode: "brightness" | "measurement" | "annotation" | "pan" | null) => {
      setBrightnessMode(mode === "brightness");
      setMeasurementMode(mode === "measurement");
      setAnnotationMode(mode === "annotation");
      setPanMode(mode === "pan");
    },
    []
  );
  const resetViewer = useCallback(() => {
    activateMode(null);
    viewerRef.current?.resetView();
  }, [activateMode]);
  const enterOrExitFullscreen = useCallback(() => {
    const el = viewerContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  // 4) Calcolo pageKey
  const pageKey = Object.entries((uiSchemaFull as any).pages).find(
    ([, def]: any) => def.path === location.pathname
  )?.[0];

  // 5) Redirect se necessario
  useEffect(() => {
    if (pageKey === "viewer" && !(location.state as any)?.series) {
      navigate("/");
    }
  }, [pageKey, location.state, navigate]);

  // 6) Reset stato viewer on page change
  useEffect(() => {
    if (pageKey === "viewer") {
      setShowSidebar(true);
      setBrightnessMode(false);
      setMeasurementMode(false);
      setAnnotationMode(false);
      setPanMode(false);
      setMetadata(null);
    }
  }, [pageKey]);

  // 7) Return condizionali dopo tutte le Hook
  if (!pageKey) {
    return <div>404: {location.pathname}</div>;
  }
  if (pageKey === "viewer" && !(location.state as any)?.series) {
    return null;
  }

  // 8) Recursive render function
  const renderItem = (item: any): React.ReactNode => {
    // If you define visibility for a device, skip the component on the wrong device
// src/components/SchemaRenderer.tsx, inside renderItem()
if (item.visibleOn && !item.visibleOn.includes(device)) {
  // you did declare visibleOn = ["tablet","desktop"], but current device isn't in it
  return null;
}



    const compName: string = item.component;
    const Comp = componentRegistry[compName];
    if (!Comp) {
      return <div>Unknown component "{compName}"</div>;
    }

    // Props statiche dal JSON
    const baseProps: Record<string, any> = item.props || {};
    let mergedProps: Record<string, any> = { ...baseProps };

    // Override responsive
    if (item.responsive && item.responsive[device]?.props) {
      const respProps = item.responsive[device].props;
      if (respProps.style) {
        mergedProps.style = { ...mergedProps.style, ...respProps.style };
      }
      for (const key of Object.keys(respProps)) {
        if (key !== "style") mergedProps[key] = respProps[key];
      }
    }

    // Props dinamiche in base al componente
    let dynamicProps: Record<string, any> = {};
    switch (compName) {
      case "ViewerToolbar":
        dynamicProps = {
          showSidebar,
          brightnessMode,
          measurementMode,
          annotationMode,
          panMode,
          onToggleSidebar: () => setShowSidebar(v => !v),
          onToggleBrightnessMode: () => activateMode(brightnessMode ? null : "brightness"),
          onToggleMeasurementMode: () => activateMode(measurementMode ? null : "measurement"),
          onToggleAnnotationMode: () => activateMode(annotationMode ? null : "annotation"),
          onTogglePanMode: () => activateMode(panMode ? null : "pan"),
          onZoomIn: () => viewerRef.current?.zoomIn(),
          onZoomOut: () => viewerRef.current?.zoomOut(),
          onBrightnessUp: () => viewerRef.current?.brightnessUp(),
          onBrightnessDown: () => viewerRef.current?.brightnessDown(),
          onFlipHorizontal: () => viewerRef.current?.flipHorizontal(),
          onFlipVertical: () => viewerRef.current?.flipVertical(),
          onResetView: resetViewer,
          onFullscreen: enterOrExitFullscreen,
        };
        break;
      case "NewViewer":
        dynamicProps = {
          ref: viewerRef,
          series: (location.state as any)?.series,
          onMetadataExtracted: setMetadata,
          brightnessMode,
          measurementMode,
          annotationMode,
          panMode,
        };
        break;
      case "Sidebar":
        dynamicProps = { metadata };
        break;
      case "NestedDicomTable":
        dynamicProps = { onSelectSeries: (series: any) => navigate("/viewer", { state: { series } }) };
        break;
      case "Container":
        if (mergedProps.className === "viewer-container") {
          mergedProps.className = showSidebar
            ? "viewer-container with-sidebar"
            : "viewer-container full-width";
          dynamicProps.ref = viewerContainerRef;
        }
        if (mergedProps.className === "sidebar-container" && !showSidebar) {
          return null;
        }
        break;
      case "JSONEditor":
        interface JSONEditorDynamicProps {
          defaultValue: any;
          onChange: (val: any) => void;
        }

        dynamicProps = {
          defaultValue: HelloWidgetDefault,
          onChange: (val: any) => setHelloOverride(val)
        } as JSONEditorDynamicProps;
        break;
      case "HelloWidget":
        dynamicProps = { __override__: helloOverride };
        break;
      case "InfoBlock":
        if (mergedProps.valueKey) {
          dynamicProps = { value: metadata?.[mergedProps.valueKey] ?? "—" };
        }
        break;
      // nel switch-case di renderItem, aggiungi:
      case "Button":
        const onClickProp = mergedProps.onClick;
        if (onClickProp === "switchToDicom") {
          dynamicProps.onClick = () => setActiveTab("dicom");
        }
        if (onClickProp === "switchToText") {
          dynamicProps.onClick = () => setActiveTab("json");
        }
        // disable tab visibility
        if (mergedProps.className?.includes("dicom-view") && activeTab !== "dicom") {
          return null;
        }
        if (mergedProps.className?.includes("json-view") && activeTab !== "json") {
          return null;
        }
        break;

      default:
        dynamicProps = {};
    }

    const finalProps = { ...mergedProps, ...dynamicProps };
    const childrenElements = Array.isArray(item.children)
      ? item.children.map((child: any, idx: number) => <React.Fragment key={idx}>{renderItem(child)}</React.Fragment>)
      : null;

    return <Comp {...finalProps}>{childrenElements}</Comp>;
  };

  // 9) Render finale della pagina
  const pageDef = (uiSchemaFull as any).pages[pageKey];
  return <>{pageDef.children.map((item: any, idx: number) => <React.Fragment key={idx}>{renderItem(item)}</React.Fragment>)}</>;
};

export default SchemaRenderer;
