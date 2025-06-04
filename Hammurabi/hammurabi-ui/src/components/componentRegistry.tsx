import { Button } from "@chakra-ui/react";

/**
 * Automatically collect all React components in this folder so new widgets can
 * be added without editing this file.  Components must use a capitalized
 * filename and default export.
 */
let requireContext: any = (require as any).context;
if (typeof requireContext !== "function" && process.env.NODE_ENV === "test") {
  const fs = require("fs");
  const path = require("path");
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

const ctx = requireContext("./", false, /^[A-Z][A-Za-z0-9]+\.tsx$/);

export const componentRegistry: Record<string, React.ComponentType<any>> = {};

ctx.keys().forEach((k: string) => {
  const name = k.replace("./", "").replace(/\.tsx$/, "");
  // Skip this file and the renderer itself
  if (name === "componentRegistry" || name === "SchemaRenderer") {
    return;
  }
  const mod = ctx(k) as any;
  const Comp = mod.default ?? mod[name];
  if (Comp) {
    componentRegistry[name] = Comp;
  }
});

// Include Chakra's Button manually
componentRegistry["Button"] = Button;
