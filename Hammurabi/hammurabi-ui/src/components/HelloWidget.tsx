// src/components/HelloWidget.tsx
import React, { useMemo } from "react";
import { useComponentVariant } from "../hooks/useComponentVariant";
import { useDeviceVariant } from "../hooks/useDeviceVariant";

/** Shape of a single-device variant, _after_ it’s been picked from the schema */
type Variant = {
  background: string;
  text: string;
  padding: string | number;
  borderRadius: number;
};

/** Prop injected by HelloPage to live-override the JSON */
type HelloWidgetProps = {
  /**
   * Either:
   * • a plain partial <Variant> like `{ "text": "red" }`, **or**
   * • the full schema object `{ variants: { desktop: {…}, … } }`
   */
  __override__?: any;
};

const HelloWidget: React.FC<HelloWidgetProps> = ({ __override__ }) => {
  /* 📱 current device (“mobile” | “tablet” | “desktop”) */
  const device = useDeviceVariant();

  /* 🎯 base values coming from the compiled JSON schema on disk */
  const base = useComponentVariant<Variant>("HelloWidget");

  /* 🔀 figure out what the live editor is sending us */
  const live: Partial<Variant> | undefined = useMemo(() => {
    if (!__override__) return undefined;

    // case 1 → plain object with the actual props
    if (!("variants" in __override__)) {
      return __override__ as Partial<Variant>;
    }

    // case 2 → full schema { variants: { desktop|tablet|mobile } }
    return (__override__.variants?.[device] ?? undefined) as
      | Partial<Variant>
      | undefined;
  }, [__override__, device]);

  /* 🧬 merge: live > base > defaults */
  const { background, text, padding, borderRadius } = {
    ...base,
    ...live,
  };

  return (
    <div
      style={{
        background,
        color: text,
        padding,
        borderRadius,
        textAlign: "center",
        fontSize: "1.25rem",
        transition: "all .15s ease",
      }}
    >
      👋 Hello from a <strong>schema-driven</strong> component!
    </div>
  );
};

export default HelloWidget;
