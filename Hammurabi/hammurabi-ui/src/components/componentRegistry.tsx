// src/components/componentRegistry.ts
// Automatically discover all components in this folder and register them by
// filename. Any file exporting a default React component will be available to
// the schema without manual edits.

// Webpack provides `require.context`, but during tests `require.context` may be
// undefined. Provide a small fallback that loads files synchronously from this
// directory when running under Node.
let requireContext: any = (require as any).context;
if (typeof requireContext !== "function") {
  const fs = require("fs");
  const path = require("path");
  require("ts-node/register/transpile-only");
  requireContext = (dir: string, _sub: boolean, regex: RegExp) => {
    const base = path.resolve(__dirname, dir);
    const keys = fs
      .readdirSync(base)
      .filter((f) => regex.test("./" + f))
      .map((f) => "./" + f);
    const fn = (key: string) => require(path.join(base, key.slice(2)));
    fn.keys = () => keys;
    return fn;
  };
}

// Webpack keys include the leading "./" so the regex accounts for it.
const ctx = requireContext("./", false, /^\.\/[A-Z].*\.tsx$/);

export const componentRegistry: Record<string, React.ComponentType<any>> = {};

ctx.keys().forEach((k) => {
  const name = k.replace("./", "").replace(/\.tsx$/, "");
  if (name === "componentRegistry" || name === "SchemaRenderer") return;
  const mod = ctx(k) as { default: React.ComponentType<any> };
  componentRegistry[name] = mod.default;
});

// Components located elsewhere can still be added manually below if needed.
export { Button } from "@chakra-ui/react";
