// src/components/componentRegistry.ts
// Automatically discover all components in this folder and register them by
// filename. Any file exporting a default React component will be available to
// the schema without manual edits.

const ctx = require.context("./", false, /^[A-Z].*\.tsx$/);

export const componentRegistry: Record<string, React.ComponentType<any>> = {};

ctx.keys().forEach((k) => {
  const name = k.replace("./", "").replace(/\.tsx$/, "");
  if (name === "componentRegistry" || name === "SchemaRenderer") return;
  const mod = ctx(k) as { default: React.ComponentType<any> };
  componentRegistry[name] = mod.default;
});

// Components located elsewhere can still be added manually below if needed.
export { Button } from "@chakra-ui/react";
