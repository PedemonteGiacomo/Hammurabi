// src/components/SchemaRenderer.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import uiSchema from "../schema/uiSchema.json";
import { useDeviceVariant } from "../hooks/useDeviceVariant";

// your low-level components go here if you ever still need them…
import SelectionPage from "../pages/SelectionPage";
import ViewerPage from "../pages/ViewerPage";
import HelloPage from "../pages/HelloPage";

// add them to the registry
const registry: Record<string, React.FC<any>> = {
  SelectionPage,
  ViewerPage,
  HelloPage
};

export const SchemaRenderer: React.FC = () => {
  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  const device = useDeviceVariant();

  const pageKey = Object
    .entries((uiSchema as any).pages)
    .find(([, def]: any) => def.path === pathname)?.[0];

  if (!pageKey) {
    return <div>404: {pathname}</div>;
  }

  const regions = (uiSchema as any).pages[pageKey].regions;

  // we know now that each page only has a single region called "main"
  const compName = regions.main.component as string;
  const Page = registry[compName];
  return Page
    ? <Page />
    : <div>Unknown page “{compName}”</div>;
};
