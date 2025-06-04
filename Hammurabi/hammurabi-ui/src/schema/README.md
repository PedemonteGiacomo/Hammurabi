# Adding a schema‑driven component

This short guide shows how to plug a **new widget** (in the example we call it `HelloWidget`) into the UI via JSON, without touching build or hook code. You only need to edit **four files**.

---

## 1 · JSON schema

`src/schema/components/HelloWidget.schema.json`

```json
{
  "variants": {
    "desktop": { "background": "#004578", "text": "#ffffff", "padding": "2rem",  "borderRadius": 8  },
    "tablet":  { "background": "#0063B1", "text": "#ffffff", "padding": "1.5rem","borderRadius": 6  },
    "mobile":  { "background": "#0078D4", "text": "#ffffff", "padding": "1rem",  "borderRadius": 4  }
  }
}
```

> The `require.context` discovery inside `useComponentVariant` picks this up automatically – no extra wiring is required.

---

## 2 · React component

`src/components/HelloWidget.tsx`

```tsx
import React from "react";
import { useComponentVariant } from "../hooks/useComponentVariant";

type Variant = {
  background: string;
  text: string;
  padding: string | number;
  borderRadius: number;
};

const HelloWidget: React.FC = () => {
  const { background, text, padding, borderRadius } =
    useComponentVariant<Variant>("HelloWidget");

  return (
    <div
      style={{
        background,
        color: text,
        padding,
        borderRadius,
        textAlign: "center",
        fontSize: "1.25rem",
      }}
    >
      👋 Hello from a <strong>schema‑driven</strong> component!
    </div>
  );
};

export default HelloWidget;
```

---

## 3 · Playground page

`src/pages/HelloPage.tsx`

```tsx
import React from "react";
import TopBar from "../components/TopBar";
import HelloWidget from "../components/HelloWidget";

const HelloPage: React.FC = () => (
  <>
    <TopBar />
    <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
      <HelloWidget />
    </div>
  </>
);

export default HelloPage;
```

---

## 4 · Wire‑up routing

### 4.a  Add the page to **uiSchema**

`src/schema/uiSchema.json`

```jsonc
{
  "pages": {
    "selection": { /* … */ },
    "viewer":    { /* … */ },

    "hello": {               // ← NEW
      "path": "/hello",
      "regions": {
        "main": { "component": "HelloPage" }
      }
    }
  }
}
```

### 4.b  Register the page in **SchemaRenderer**

Add commentMore actions
`src/components/SchemaRenderer.tsx`

```tsx
import HelloPage from "../pages/HelloPage";   // ← NEW

const registry: Record<string, React.FC<any>> = {
  SelectionPage,
  ViewerPage,
  HelloPage,           // ← NEW
};
```

Run the dev server and visit **/hello** – the widget is live.

---

## Result by breakpoint

| Breakpoint | Looks like                                        |
| ---------- | ------------------------------------------------- |
| Desktop    | Dark‑blue `#004578`, 2 rem padding, 8 px radius   |
| Tablet     | Mid‑blue  `#0063B1`, 1.5 rem padding, 6 px radius |
| Mobile     | Light‑blue `#0078D4`, 1 rem padding, 4 px radius  |

Resize the browser (or use Device Mode) and the widget updates instantly.

---

## Troubleshooting

| Issue                                                     | Cause                   | Fix                                                                                                      |
| --------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `Property 'context' does not exist on type 'NodeRequire'` | Non‑webpack environment | Make sure you run with CRA/CRACO (webpack).                                                              |
| Widget ignores JSON                                       | Filename/key mismatch   | File must be `HelloWidget.schema.json` and the component must call `useComponentVariant("HelloWidget")`. |
| 404 page                                                  | Route not added         | Add the `hello` entry to `uiSchema.json` and import it in `SchemaRenderer`.                              |

---

### Next steps

* Add more props to the JSON and consume them in the component.
* Copy these four steps to create any number of plug‑and‑play widgets.
* Dropping another `*.schema.json` inside `src/schema/components` is enough for auto‑discovery – just supply the matching `.tsx` component.

Happy coding! 🎉
