// src/hooks/useComponentVariant.ts
import { useDeviceVariant }   from "./useDeviceVariant";

/*  Mappa dei JSON che descrivono le varianti.
 *  Se domani aggiungi un altro componente basta importarlo qui. */
import newViewerSchema   from "../schema/components/NewViewer.schema.json";
import sidebarSchema     from "../schema/components/Sidebar.schema.json";
import topBarSchema      from "../schema/components/TopBar.schema.json";
import viewerTbSchema    from "../schema/components/ViewerToolbar.schema.json";
import studyListSchema   from "../schema/components/StudyList.schema.json";

const SCHEMAS: Record<string, any> = {
  NewViewer:      newViewerSchema,
  Sidebar:        sidebarSchema,
  TopBar:         topBarSchema,
  ViewerToolbar:  viewerTbSchema,
  StudyList:      studyListSchema,
};

export function useComponentVariant<T = any>(component: keyof typeof SCHEMAS): T {
  const device = useDeviceVariant();                 // "mobile" | "tablet" | "desktop"
  const schema = SCHEMAS[component];
  return (schema?.variants?.[device] ?? {}) as T;    // fallback → {}
}
