import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import uiSchema from "../schema/uiSchema.json";
import { useDeviceVariant } from "../hooks/useDeviceVariant";

// import your real components:
import TopBar from "../components/TopBar";
import NestedDicomTable from "../components/NestedDicomTable";
import ViewerToolbar from "../components/ViewerToolbar";
import NewViewer from "../components/newViewer";
import Sidebar from "../components/Sidebar";

const registry: Record<string, React.FC<any>> = {
  TopBar,
  StudyList: NestedDicomTable,
  ViewerToolbar,
  NewViewer,
  Sidebar
};

export const SchemaRenderer: React.FC = () => {
  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  const device = useDeviceVariant();

  // find matching pageKey
  const pages = (uiSchema as any).pages;
  const pageKey = Object.keys(pages).find(k => pages[k].path === pathname);
  if (!pageKey) return <div>404: {pathname}</div>;

  const regions = pages[pageKey].regions as Record<string, any>;

  function renderComponent(reg: any) {
    const Component = registry[reg.component];
    if (!Component) return <div>Unknown component “{reg.component}”</div>;

    // merge default props + per-variant schema
    let variantProps = {};
    try {
      // @ts-ignore
      const raw = require(`../schema/components/${reg.component}.schema.json`);
      variantProps = raw.variants[device] || {};
    } catch {}

    const props = { ...reg.props, ...variantProps };

    // wire navigation or state
    if (reg.component === "StudyList") {
      props.onSelectSeries = (s: any) => navigate("/viewer", { state: { series: s } });
    }
    if (reg.component === "NewViewer") {
      props.series = (state as any)?.series;
    }

    return <Component {...props} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header>{renderComponent(regions.header)}</header>
      {regions.toolbar && <nav>{renderComponent(regions.toolbar)}</nav>}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <main style={{ flex: 1, overflow: "auto" }}>{renderComponent(regions.main)}</main>
        {regions.sidebar && (
          <aside>{renderComponent(regions.sidebar)}</aside>
        )}
      </div>
    </div>
  );
};
