// src/hooks/useComponentVariant.ts
import { useBreakpointValue } from "@chakra-ui/react";
import type { Device } from "./useDeviceVariant";

/* ------------------------------------------------------------------ */
/* 1. build-time discovery di tutti i JSON in schema/components        */
/*    false  = NON entra nelle sub-directory                           */
/*    /\.schema\.json$/ = solo quei file                               */
/* ------------------------------------------------------------------ */
const schemaCtx = require.context(
  "../schema/components",  // cartella
  false,                   // no sub-folder
  /\.schema\.json$/        // regex
);

/* ------------------------------------------------------------------ */
/* 2. Traduce "./NewViewer.schema.json" → "NewViewer": schemaObject    */
/* ------------------------------------------------------------------ */
const SCHEMAS: Record<string, any> = {};

schemaCtx.keys().forEach((k) => {
  const name = k.replace("./", "").replace(".schema.json", ""); // "NewViewer"
  // quando CRA compila JSON li esporta sia come default sia come modulo
  const schema = (schemaCtx(k) as any).default ?? schemaCtx(k);
  SCHEMAS[name] = schema;
});

/* ------------------------------------------------------------------ */
/* 3. Hook vero e proprio                                              */
/* ------------------------------------------------------------------ */
export function useComponentVariant<T = unknown>(component: string): T {
  const device = useBreakpointValue<Device>({
    base: "mobile",
    md: "tablet",
    lg: "desktop",
  })!;

  // se manca lo schema → {}, se manca la variante → {}
  return (SCHEMAS[component]?.variants?.[device] ?? {}) as T;
}
