// src/hooks/useComponentVariant.ts
import { useBreakpointValue } from "@chakra-ui/react";
import type { Device } from "./useDeviceVariant";

/* ------------------------------------------------------------------ */
/* 1. build-time discovery di tutti i JSON in schema/components        */
/*    false  = NON entra nelle sub-directory                           */
/*    /\.schema\.json$/ = solo quei file                               */
/* ------------------------------------------------------------------ */
let requireContext: any = (require as any).context;
if (typeof requireContext !== "function" && process.env.NODE_ENV === "test") {
  const fs = require("fs");
  const path = require("path");
  try {
    require("ts-node/register/transpile-only");
  } catch {}
  requireContext = (dir: string, _sub: boolean, regex: RegExp) => {
    const base = path.resolve(__dirname, dir);
    const keys = fs
      .readdirSync(base)
      .filter((f: string) => regex.test("./" + f))
      .map((f: string) => "./" + f);
    const fn = (key: string) => require(path.join(base, key.slice(2)));
    fn.keys = () => keys;
    return fn;
  };
}

const schemaCtx = requireContext(
  "../schema/components",
  false,
  /\.schema\.json$/
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
